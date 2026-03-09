// ============================================================
// OmvärldsRadar — Agentiskt flöde: Datainsamling
// WAT: Workflow = fetch-cycle, Agent = orchestrator, Tools = RSS-parser + DB
//
// Flöde:
//   1. Hämta alla aktiva källor som behöver uppdateras
//   2. För varje källa: parse RSS/Atom → extrahera artiklar
//   3. Dedup mot befintliga artiklar (via URL)
//   4. Spara nya artiklar i Supabase
//   5. Logga resultat i fetch_log (observerbarhet)
//   6. Uppdatera source.last_fetched_at
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { parseFeed } from "./rss-parser.ts";

// --- Types ---
interface Source {
  id: string;
  name: string;
  slug: string;
  url: string;
  feed_url: string | null;
  feed_type: "rss" | "atom" | "scrape";
  category: string;
  maps_to: string[];
  fetch_interval_minutes: number;
  last_fetched_at: string | null;
}

interface ParsedArticle {
  title: string;
  url: string;
  summary: string | null;
  published_at: string | null;
}

interface FetchResult {
  source_id: string;
  source_name: string;
  status: "success" | "error" | "skipped";
  articles_found: number;
  articles_new: number;
  articles_skipped: number;
  error_message: string | null;
  duration_ms: number;
}

// --- Config ---
const RATE_LIMIT_MS = 500; // 500ms mellan requests
const FETCH_TIMEOUT_MS = 15000; // 15s timeout per källa
const USER_AGENT = "OmvarldsRadar/1.0 (omvarldsradar.criteroconsulting.se)";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const HAIKU_MODEL = "claude-haiku-4-20250414";
const CLASSIFY_BATCH_SIZE = 5; // Klassificera 5 artiklar per API-anrop (kostnadsoptimering)

// Giltiga kategorier (matchar databasens ai_category)
const VALID_CATEGORIES = [
  "Styrning & Demokrati",
  "Digitalisering & Teknik",
  "Välfärd & Omsorg",
  "Utbildning & Kompetens",
  "Klimat, Miljö & Samhällsbyggnad",
  "Trygghet & Beredskap",
  "Ekonomi & Resurser",
  "Arbetsgivare & Organisation",
  "Samhälle & Medborgare",
  "Innovation & Omställning",
];

Deno.serve(async (req) => {
  const startTime = Date.now();

  try {
    // Auth: Kräver service_role key eller valid JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- Steg 1: Hämta källor som behöver uppdateras ---
    const now = new Date();
    const { data: sources, error: sourcesError } = await supabase
      .from("sources")
      .select("*")
      .eq("active", true)
      .not("feed_url", "is", null) // Skippa scrape-källor för nu
      .order("last_fetched_at", { ascending: true, nullsFirst: true });

    if (sourcesError) {
      throw new Error(`Failed to fetch sources: ${sourcesError.message}`);
    }

    // Filtrera: enbart källor vars intervall har passerat
    const sourcesToFetch = (sources as Source[]).filter((s) => {
      if (!s.last_fetched_at) return true; // Aldrig hämtad
      const lastFetch = new Date(s.last_fetched_at);
      const intervalMs = s.fetch_interval_minutes * 60 * 1000;
      return now.getTime() - lastFetch.getTime() >= intervalMs;
    });

    console.log(
      `[OmvärldsRadar] ${sourcesToFetch.length}/${sources?.length} källor behöver uppdateras`
    );

    // --- Steg 2-5: Bearbeta varje källa ---
    const results: FetchResult[] = [];

    for (const source of sourcesToFetch) {
      const result = await fetchSource(supabase, source);
      results.push(result);

      // Rate limiting
      await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT_MS));
    }

    // --- Sammanfattning ---
    const totalNew = results.reduce((sum, r) => sum + r.articles_new, 0);
    const totalErrors = results.filter((r) => r.status === "error").length;
    const totalDuration = Date.now() - startTime;

    const summary = {
      timestamp: now.toISOString(),
      sources_processed: results.length,
      sources_total: sources?.length ?? 0,
      articles_new: totalNew,
      errors: totalErrors,
      duration_ms: totalDuration,
      results,
    };

    console.log(
      `[OmvärldsRadar] Klart: ${totalNew} nya artiklar, ${totalErrors} fel, ${totalDuration}ms`
    );

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[OmvärldsRadar] Fatal error:`, error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

// --- Tool: Hämta och bearbeta en enskild källa ---
async function fetchSource(
  supabase: ReturnType<typeof createClient>,
  source: Source
): Promise<FetchResult> {
  const start = Date.now();
  const logEntry: Partial<FetchResult> = {
    source_id: source.id,
    source_name: source.name,
  };

  try {
    console.log(`[${source.name}] Hämtar ${source.feed_url}...`);

    // Hämta RSS-feed med timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(source.feed_url!, {
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const xml = await response.text();

    // Parsa RSS/Atom
    const articles = parseFeed(xml, source.feed_type);
    logEntry.articles_found = articles.length;

    console.log(`[${source.name}] Hittade ${articles.length} artiklar`);

    // Dedup: kolla vilka URLer som redan finns
    const urls = articles.map((a) => a.url).filter(Boolean);
    const { data: existing } = await supabase
      .from("articles")
      .select("url")
      .in("url", urls);

    const existingUrls = new Set((existing ?? []).map((e: { url: string }) => e.url));

    // Filtrera nya artiklar
    const newArticles = articles
      .filter((a) => a.url && !existingUrls.has(a.url))
      .map((a) => ({
        source_id: source.id,
        title: a.title,
        url: a.url,
        summary: a.summary,
        published_at: a.published_at,
        fetched_at: new Date().toISOString(),
      }));

    logEntry.articles_new = newArticles.length;
    logEntry.articles_skipped = articles.length - newArticles.length;

    // Spara nya artiklar
    if (newArticles.length > 0) {
      const { data: inserted, error: insertError } = await supabase
        .from("articles")
        .insert(newArticles)
        .select("id, title, summary");

      if (insertError) {
        throw new Error(`Insert failed: ${insertError.message}`);
      }

      // AI-klassificering med Haiku (kör inline, ej bakgrund)
      if (inserted && inserted.length > 0) {
        await classifyArticles(supabase, inserted);
      }
    }

    // Uppdatera källa
    await supabase
      .from("sources")
      .update({
        last_fetched_at: new Date().toISOString(),
        last_fetch_status: "success",
        last_fetch_error: null,
      })
      .eq("id", source.id);

    // Logga framgång
    const duration = Date.now() - start;
    await supabase.from("fetch_log").insert({
      source_id: source.id,
      status: "success",
      articles_found: logEntry.articles_found,
      articles_new: logEntry.articles_new,
      articles_skipped: logEntry.articles_skipped,
      duration_ms: duration,
      completed_at: new Date().toISOString(),
    });

    console.log(
      `[${source.name}] ✓ ${newArticles.length} nya, ${logEntry.articles_skipped} skippade (${duration}ms)`
    );

    return {
      source_id: source.id,
      source_name: source.name,
      status: "success",
      articles_found: logEntry.articles_found ?? 0,
      articles_new: logEntry.articles_new ?? 0,
      articles_skipped: logEntry.articles_skipped ?? 0,
      error_message: null,
      duration_ms: duration,
    };
  } catch (error) {
    const duration = Date.now() - start;
    const errorMsg = (error as Error).message;

    console.error(`[${source.name}] ✗ ${errorMsg} (${duration}ms)`);

    // Uppdatera källa med felstatus
    await supabase
      .from("sources")
      .update({
        last_fetch_status: "error",
        last_fetch_error: errorMsg,
      })
      .eq("id", source.id);

    // Logga fel
    await supabase.from("fetch_log").insert({
      source_id: source.id,
      status: "error",
      error_message: errorMsg,
      duration_ms: duration,
      completed_at: new Date().toISOString(),
    });

    return {
      source_id: source.id,
      source_name: source.name,
      status: "error",
      articles_found: 0,
      articles_new: 0,
      articles_skipped: 0,
      error_message: errorMsg,
      duration_ms: duration,
    };
  }
}

// --- AI-klassificering med Claude Haiku ---

interface ArticleToClassify {
  id: string;
  title: string;
  summary: string | null;
}

interface ClassificationResult {
  id: string;
  ai_category: string;
  ai_impact: string;
  ai_action: string;
  ai_timeframe: string;
  ai_relevance: number;
  ai_summary: string;
}

async function classifyArticles(
  supabase: ReturnType<typeof createClient>,
  articles: ArticleToClassify[]
): Promise<void> {
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!anthropicKey) {
    console.warn("[AI] ANTHROPIC_API_KEY saknas — hoppar över klassificering");
    return;
  }

  // Bearbeta i batchar
  for (let i = 0; i < articles.length; i += CLASSIFY_BATCH_SIZE) {
    const batch = articles.slice(i, i + CLASSIFY_BATCH_SIZE);

    try {
      const results = await classifyBatch(anthropicKey, batch);

      // Uppdatera varje artikel med AI-resultat
      for (const result of results) {
        await supabase
          .from("articles")
          .update({
            ai_category: result.ai_category,
            ai_impact: result.ai_impact,
            ai_action: result.ai_action,
            ai_timeframe: result.ai_timeframe,
            ai_relevance: result.ai_relevance,
            ai_summary: result.ai_summary,
          })
          .eq("id", result.id);
      }

      console.log(
        `[AI] Klassificerade ${results.length}/${batch.length} artiklar (batch ${Math.floor(i / CLASSIFY_BATCH_SIZE) + 1})`
      );
    } catch (error) {
      console.error(`[AI] Klassificeringsfel (batch ${Math.floor(i / CLASSIFY_BATCH_SIZE) + 1}):`, error);
      // Fortsätt med nästa batch — artiklar utan klassificering visas ändå
    }

    // Rate limit mot Anthropic API
    if (i + CLASSIFY_BATCH_SIZE < articles.length) {
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

async function classifyBatch(
  apiKey: string,
  articles: ArticleToClassify[]
): Promise<ClassificationResult[]> {
  const articleList = articles
    .map(
      (a, idx) =>
        `[${idx + 1}] ID: ${a.id}\nTitel: ${a.title}\nSammanfattning: ${a.summary || "Ingen"}`
    )
    .join("\n\n");

  const prompt = `Du är omvärldsanalytiker för svensk offentlig sektor (kommuner och regioner).

Klassificera följande ${articles.length} artiklar. Svara med ENBART giltig JSON — en array med objekt.

GILTIGA KATEGORIER (välj exakt en per artikel):
${VALID_CATEGORIES.map((c) => `- "${c}"`).join("\n")}

GILTIGA PÅVERKAN-NIVÅER: "Direkt påverkan", "Indirekt påverkan", "Möjlighet", "Risk"
GILTIGA ÅTGÄRDER: "Agera nu", "Planera", "Bevaka"
GILTIGA TIDSHORISONTER: "0-6 månader", "6-24 månader", "2+ år"

Svara med denna JSON-struktur (INGEN annan text):
[
  {
    "id": "artikel-id",
    "ai_category": "en av kategorierna ovan",
    "ai_impact": "en av påverkan-nivåerna",
    "ai_action": "en av åtgärderna",
    "ai_timeframe": "en av tidshorisonterna",
    "ai_relevance": 0-100,
    "ai_summary": "2-3 meningars analys av artikelns relevans för kommuner/regioner"
  }
]

ARTIKLAR:
${articleList}`;

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: HAIKU_MODEL,
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Haiku API error: ${response.status} ${errorBody}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || "[]";

  // Extrahera JSON från svaret (kan ha markdown-formatering)
  const jsonMatch = text.match(/\[[\s\S]*\]/);
  if (!jsonMatch) {
    console.warn("[AI] Kunde inte parsa JSON från Haiku-svar:", text.substring(0, 200));
    return [];
  }

  try {
    const parsed = JSON.parse(jsonMatch[0]) as ClassificationResult[];

    // Validera och sanera resultaten
    return parsed
      .filter((r) => r.id && articles.some((a) => a.id === r.id))
      .map((r) => ({
        id: r.id,
        ai_category: VALID_CATEGORIES.includes(r.ai_category) ? r.ai_category : "Styrning & Demokrati",
        ai_impact: r.ai_impact || "Indirekt påverkan",
        ai_action: r.ai_action || "Bevaka",
        ai_timeframe: r.ai_timeframe || "6-24 månader",
        ai_relevance: Math.min(100, Math.max(0, r.ai_relevance || 50)),
        ai_summary: r.ai_summary || "",
      }));
  } catch {
    console.warn("[AI] JSON parse error:", text.substring(0, 200));
    return [];
  }
}
