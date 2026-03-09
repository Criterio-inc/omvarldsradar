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

const defaultStats: DashboardStats = {
  totalArticles: 0,
  articlesThisWeek: 0,
  actionRequired: 0,
  totalSources: 0,
  activeSources: 0,
  rssReady: 0,
};
