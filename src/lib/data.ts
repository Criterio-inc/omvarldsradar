import { createBrowserClient } from "@supabase/ssr";

// Skapa en Supabase-klient för browser-sidan
function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !url.startsWith("http")) return null;
  return createBrowserClient(url, key);
}

// --- Types ---
export interface Article {
  id: string;
  title: string;
  url: string;
  summary: string | null;
  published_at: string | null;
  fetched_at: string;
  ai_category: string | null;
  ai_subcategory: string | null;
  ai_relevance: number | null;
  ai_impact: string | null;
  ai_action: string | null;
  ai_timeframe: string | null;
  ai_summary: string | null;
  source_name?: string;
}

export interface Source {
  id: string;
  name: string;
  slug: string;
  url: string;
  feed_url: string | null;
  feed_type: string;
  category: string;
  maps_to: string[];
  active: boolean;
  last_fetched_at: string | null;
  last_fetch_status: string;
  article_count: number;
}

export interface DashboardStats {
  totalArticles: number;
  articlesThisWeek: number;
  actionRequired: number;
  totalSources: number;
  activeSources: number;
  rssReady: number;
}

// --- Queries ---

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const supabase = getSupabase();
  if (!supabase) return defaultStats;

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [articlesRes, weekRes, actionRes, sourcesRes] = await Promise.all([
    supabase.from("articles").select("id", { count: "exact", head: true }),
    supabase.from("articles").select("id", { count: "exact", head: true }).gte("fetched_at", weekAgo),
    supabase.from("articles").select("id", { count: "exact", head: true }).eq("ai_action", "Agera nu"),
    supabase.from("sources").select("id, feed_type, active"),
  ]);

  // Logga Supabase-fel men returnera vad vi kan
  if (articlesRes.error) console.error("[data] articles query error:", articlesRes.error.message);
  if (sourcesRes.error) console.error("[data] sources query error:", sourcesRes.error.message);

  const sources = sourcesRes.data ?? [];
  return {
    totalArticles: articlesRes.count ?? 0,
    articlesThisWeek: weekRes.count ?? 0,
    actionRequired: actionRes.count ?? 0,
    totalSources: sources.length,
    activeSources: sources.filter((s) => s.active).length,
    rssReady: sources.filter((s) => s.feed_type === "rss").length,
  };
}

export async function fetchLatestArticles(limit = 10): Promise<Article[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("articles")
    .select("*, sources(name)")
    .order("fetched_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[data] fetchLatestArticles error:", error.message);
    throw new Error(`Kunde inte hämta artiklar: ${error.message}`);
  }

  return (data ?? []).map((a) => ({
    ...a,
    source_name: (a.sources as { name: string } | null)?.name ?? "Okänd",
  }));
}

export async function fetchSources(): Promise<Source[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from("sources")
      .select("*")
      .order("name");

    return data ?? [];
  } catch {
    return [];
  }
}

export async function fetchArticles(options?: {
  category?: string;
  limit?: number;
  offset?: number;
}): Promise<{ articles: Article[]; count: number }> {
  const supabase = getSupabase();
  if (!supabase) return { articles: [], count: 0 };

  try {
    let query = supabase
      .from("articles")
      .select("*, sources(name)", { count: "exact" })
      .order("fetched_at", { ascending: false });

    if (options?.category && options.category !== "Alla") {
      query = query.eq("ai_category", options.category);
    }
    if (options?.limit) query = query.limit(options.limit);
    if (options?.offset) query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);

    const { data, count } = await query;

    const articles = (data ?? []).map((a) => ({
      ...a,
      source_name: (a.sources as { name: string } | null)?.name ?? "Okänd",
    }));

    return { articles, count: count ?? 0 };
  } catch {
    return { articles: [], count: 0 };
  }
}

// --- Briefing ---

export interface Briefing {
  id: string;
  title: string;
  content: string;
  period_start: string;
  period_end: string;
  article_count: number;
  categories_covered: string[];
  generated_at: string;
}

export async function fetchLatestBriefing(): Promise<Briefing | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data } = await supabase
      .from("briefings")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(1)
      .single();

    return data;
  } catch {
    return null;
  }
}

export async function fetchBriefingArchive(limit = 10): Promise<Briefing[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from("briefings")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(limit);

    return data ?? [];
  } catch {
    return [];
  }
}

export async function fetchUrgentArticles(limit = 5): Promise<Article[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from("articles")
      .select("*, sources(name)")
      .eq("ai_action", "Agera nu")
      .order("fetched_at", { ascending: false })
      .limit(limit);

    return (data ?? []).map((a) => ({
      ...a,
      source_name: (a.sources as { name: string } | null)?.name ?? "Okänd",
    }));
  } catch {
    return [];
  }
}

// --- Briefing source articles ---

export async function fetchBriefingArticles(
  periodStart: string,
  periodEnd: string,
  limit = 50
): Promise<Article[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from("articles")
      .select("*, sources(name)")
      .gte("fetched_at", periodStart)
      .lte("fetched_at", periodEnd)
      .not("ai_category", "is", null)
      .gte("ai_relevance", 50)
      .order("ai_relevance", { ascending: false })
      .limit(limit);

    return (data ?? []).map((a) => ({
      ...a,
      source_name: (a.sources as { name: string } | null)?.name ?? "Okänd",
    }));
  } catch {
    return [];
  }
}

// --- Article by ID ---

export async function fetchArticleById(id: string): Promise<Article | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data } = await supabase
      .from("articles")
      .select("*, sources(name, url)")
      .eq("id", id)
      .single();

    if (!data) return null;
    const src = data.sources as { name: string; url: string } | null;
    return {
      ...data,
      source_name: src?.name ?? "Okänd",
      source_url: src?.url,
    };
  } catch {
    return null;
  }
}

// --- Search ---

export async function searchArticles(query: string, limit = 20): Promise<Article[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const pattern = `%${query}%`;
    const { data } = await supabase
      .from("articles")
      .select("*, sources(name)")
      .or(`title.ilike.${pattern},ai_summary.ilike.${pattern}`)
      .order("fetched_at", { ascending: false })
      .limit(limit);

    return (data ?? []).map((a) => ({
      ...a,
      source_name: (a.sources as { name: string } | null)?.name ?? "Okänd",
    }));
  } catch {
    return [];
  }
}

// --- Advanced Search ---

export interface SearchFilters {
  query?: string;
  categories?: string[];
  impacts?: string[];
  actions?: string[];
  timeframes?: string[];
  dateFrom?: string;
  dateTo?: string;
  relevanceMin?: number;
  sortBy?: "date" | "relevance";
  limit?: number;
  offset?: number;
}

export async function advancedSearchArticles(
  filters: SearchFilters
): Promise<{ articles: Article[]; count: number }> {
  const supabase = getSupabase();
  if (!supabase) return { articles: [], count: 0 };

  try {
    let query = supabase
      .from("articles")
      .select("*, sources(name)", { count: "exact" });

    // Text search (ILIKE — can upgrade to FTS after migration)
    if (filters.query?.trim()) {
      const pattern = `%${filters.query.trim()}%`;
      query = query.or(`title.ilike.${pattern},ai_summary.ilike.${pattern}`);
    }

    // Category filter
    if (filters.categories?.length) {
      query = query.in("ai_category", filters.categories);
    }

    // Impact filter
    if (filters.impacts?.length) {
      query = query.in("ai_impact", filters.impacts);
    }

    // Action filter
    if (filters.actions?.length) {
      query = query.in("ai_action", filters.actions);
    }

    // Timeframe filter
    if (filters.timeframes?.length) {
      query = query.in("ai_timeframe", filters.timeframes);
    }

    // Date range
    if (filters.dateFrom) {
      query = query.gte("fetched_at", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte("fetched_at", filters.dateTo);
    }

    // Relevance threshold
    if (filters.relevanceMin && filters.relevanceMin > 0) {
      query = query.gte("ai_relevance", filters.relevanceMin);
    }

    // Sorting
    if (filters.sortBy === "relevance") {
      query = query.order("ai_relevance", { ascending: false, nullsFirst: false });
    } else {
      query = query.order("fetched_at", { ascending: false });
    }

    // Pagination
    const limit = filters.limit ?? 20;
    const offset = filters.offset ?? 0;
    query = query.range(offset, offset + limit - 1);

    const { data, count } = await query;

    const articles = (data ?? []).map((a) => ({
      ...a,
      source_name: (a.sources as { name: string } | null)?.name ?? "Okänd",
    }));

    return { articles, count: count ?? 0 };
  } catch (err) {
    console.error("[data] advancedSearchArticles error:", err);
    return { articles: [], count: 0 };
  }
}

// --- Calendar / Regelverkskalender ---

export interface CalendarArticle extends Article {
  estimated_deadline: string;
  urgency: "akut" | "kort" | "medel" | "lang";
}

export async function fetchCalendarArticles(options?: {
  categories?: string[];
}): Promise<CalendarArticle[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    let query = supabase
      .from("articles")
      .select("*, sources(name)")
      .or(
        'ai_action.eq.Agera nu,ai_action.eq.Planera,ai_timeframe.eq.Akut (0-3 mån),ai_timeframe.eq.Kort sikt (3-12 mån)'
      )
      .order("fetched_at", { ascending: false })
      .limit(100);

    if (options?.categories?.length) {
      query = query.in("ai_category", options.categories);
    }

    const { data } = await query;
    if (!data) return [];

    // Calculate estimated deadline from timeframe + fetched_at
    return data.map((a) => {
      const fetched = new Date(a.fetched_at);
      let deadline: Date;
      let urgency: CalendarArticle["urgency"];

      switch (a.ai_timeframe) {
        case "Akut (0-3 mån)":
          deadline = new Date(fetched.getTime() + 45 * 24 * 60 * 60 * 1000); // ~1.5 months
          urgency = "akut";
          break;
        case "Kort sikt (3-12 mån)":
          deadline = new Date(fetched.getTime() + 180 * 24 * 60 * 60 * 1000); // ~6 months
          urgency = "kort";
          break;
        case "Medellång sikt (1-3 år)":
          deadline = new Date(fetched.getTime() + 730 * 24 * 60 * 60 * 1000); // ~2 years
          urgency = "medel";
          break;
        default:
          deadline = new Date(fetched.getTime() + 1460 * 24 * 60 * 60 * 1000); // ~4 years
          urgency = "lang";
      }

      // If action is "Agera nu", bump urgency
      if (a.ai_action === "Agera nu" && urgency !== "akut") {
        urgency = "akut";
        deadline = new Date(fetched.getTime() + 30 * 24 * 60 * 60 * 1000);
      }

      return {
        ...a,
        source_name: (a.sources as { name: string } | null)?.name ?? "Okänd",
        estimated_deadline: deadline.toISOString(),
        urgency,
      };
    }).sort((a, b) => new Date(a.estimated_deadline).getTime() - new Date(b.estimated_deadline).getTime());
  } catch (err) {
    console.error("[data] fetchCalendarArticles error:", err);
    return [];
  }
}

// --- Kolada ---

export interface KoladaMunicipality {
  code: string;
  name: string;
  type: string;
}

export interface KoladaKpi {
  id: string;
  title: string;
  description: string | null;
  category: string;
  unit: string | null;
}

export interface KoladaDataPoint {
  kpi_id: string;
  municipality_code: string;
  year: number;
  value: number | null;
}

export async function fetchKoladaMunicipalities(): Promise<KoladaMunicipality[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from("kolada_municipalities")
      .select("*")
      .order("name");
    return data ?? [];
  } catch {
    return [];
  }
}

export async function fetchKoladaKpis(category?: string): Promise<KoladaKpi[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    let query = supabase
      .from("kolada_kpis")
      .select("*")
      .eq("active", true)
      .order("category")
      .order("title");
    if (category) query = query.eq("category", category);
    const { data } = await query;
    return data ?? [];
  } catch {
    return [];
  }
}

// --- Trend data ---

export interface TrendWeekly {
  week: string;
  articles: number;
}

export interface TrendCategory {
  name: string;
  value: number;
  color: string;
}

export interface TrendImpact {
  name: string;
  direkt: number;
  indirekt: number;
  mojlighet: number;
  risk: number;
}

const categoryChartColors: Record<string, string> = {
  "Styrning & Demokrati": "#3b82f6",
  "Digitalisering & Teknik": "#8b5cf6",
  "Välfärd & Omsorg": "#ec4899",
  "Utbildning & Kompetens": "#6366f1",
  "Klimat, Miljö & Samhällsbyggnad": "#14b8a6",
  "Trygghet & Beredskap": "#64748b",
  "Ekonomi & Resurser": "#f59e0b",
  "Arbetsgivare & Organisation": "#f97316",
  "Samhälle & Medborgare": "#10b981",
  "Innovation & Omställning": "#06b6d4",
};

export async function fetchTrendData(): Promise<{
  weekly: TrendWeekly[];
  categories: TrendCategory[];
  impact: TrendImpact[];
}> {
  const supabase = getSupabase();
  const empty = { weekly: [], categories: [], impact: [] };
  if (!supabase) return empty;

  try {
    // Fetch articles from last 8 weeks with category and impact data
    const eightWeeksAgo = new Date(Date.now() - 56 * 24 * 60 * 60 * 1000).toISOString();
    const { data: articles } = await supabase
      .from("articles")
      .select("fetched_at, ai_category, ai_impact")
      .gte("fetched_at", eightWeeksAgo);

    if (!articles || articles.length === 0) return empty;

    // Group by week number
    const weekMap = new Map<string, number>();
    const catMap = new Map<string, number>();
    const impactWeekMap = new Map<string, { direkt: number; indirekt: number; mojlighet: number; risk: number }>();

    const impactKeyMap: Record<string, keyof typeof defaultImpact> = {
      "Direkt reglering": "direkt",
      "Indirekt påverkan": "indirekt",
      "Möjlighet": "mojlighet",
      "Risk/hot": "risk",
    };
    const defaultImpact = { direkt: 0, indirekt: 0, mojlighet: 0, risk: 0 };

    for (const a of articles) {
      const d = new Date(a.fetched_at);
      // ISO 8601 veckonummer
      const utcDate = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
      utcDate.setUTCDate(utcDate.getUTCDate() + 4 - (utcDate.getUTCDay() || 7));
      const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
      const weekNum = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
      const weekLabel = `V${weekNum}`;

      weekMap.set(weekLabel, (weekMap.get(weekLabel) ?? 0) + 1);

      if (a.ai_category) {
        catMap.set(a.ai_category, (catMap.get(a.ai_category) ?? 0) + 1);
      }

      if (a.ai_impact) {
        if (!impactWeekMap.has(weekLabel)) impactWeekMap.set(weekLabel, { ...defaultImpact });
        const key = impactKeyMap[a.ai_impact];
        if (key) impactWeekMap.get(weekLabel)![key]++;
      }
    }

    const weekly = Array.from(weekMap.entries())
      .map(([week, articles]) => ({ week, articles }))
      .sort((a, b) => {
        const na = parseInt(a.week.slice(1));
        const nb = parseInt(b.week.slice(1));
        // Hantera årsskifte: om skillnad > 40 veckor, wrappa
        if (Math.abs(na - nb) > 40) return na > nb ? -1 : 1;
        return na - nb;
      });

    const categories = Array.from(catMap.entries())
      .map(([name, value]) => ({
        name: name.length > 25 ? name.slice(0, 22) + "..." : name,
        value,
        color: categoryChartColors[name] || "#94a3b8",
      }))
      .sort((a, b) => b.value - a.value);

    const impact = Array.from(impactWeekMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => parseInt(a.name.slice(1)) - parseInt(b.name.slice(1)));

    return { weekly, categories, impact };
  } catch {
    return empty;
  }
}

const defaultStats: DashboardStats = {
  totalArticles: 0,
  articlesThisWeek: 0,
  actionRequired: 0,
  totalSources: 0,
  activeSources: 0,
  rssReady: 0,
};
