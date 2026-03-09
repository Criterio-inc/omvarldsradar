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

  try {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [articlesRes, weekRes, actionRes, sourcesRes] = await Promise.all([
      supabase.from("articles").select("id", { count: "exact", head: true }),
      supabase.from("articles").select("id", { count: "exact", head: true }).gte("fetched_at", weekAgo),
      supabase.from("articles").select("id", { count: "exact", head: true }).eq("ai_action", "Agera nu"),
      supabase.from("sources").select("id, feed_type, active"),
    ]);

    const sources = sourcesRes.data ?? [];
    return {
      totalArticles: articlesRes.count ?? 0,
      articlesThisWeek: weekRes.count ?? 0,
      actionRequired: actionRes.count ?? 0,
      totalSources: sources.length,
      activeSources: sources.filter((s) => s.active).length,
      rssReady: sources.filter((s) => s.feed_type === "rss").length,
    };
  } catch {
    return defaultStats;
  }
}

export async function fetchLatestArticles(limit = 10): Promise<Article[]> {
  const supabase = getSupabase();
  if (!supabase) return [];

  try {
    const { data } = await supabase
      .from("articles")
      .select("*, sources(name)")
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
      // ISO week number
      const startOfYear = new Date(d.getFullYear(), 0, 1);
      const weekNum = Math.ceil(((d.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
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
      .sort((a, b) => parseInt(a.week.slice(1)) - parseInt(b.week.slice(1)));

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
