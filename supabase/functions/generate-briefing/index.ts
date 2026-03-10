// ============================================================
// OmvärldsRadar — Agentiskt flöde: Briefing-generering
// WAT: Workflow = weekly-briefing, Agent = synthesizer, Tool = Claude Sonnet
//
// Flöde:
//   1. Hämta alla AI-analyserade artiklar från senaste veckan
//   2. Gruppera per kategori
//   3. Skicka till Claude Sonnet för syntes → briefing-text
//   4. Spara briefing i DB
//   5. Skapa notifieringar i kön för alla prenumeranter
//
// Triggas av:
//   - pg_cron (varje söndag kväll 20:00)
//   - Manuellt via HTTP POST
// ============================================================

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

Deno.serve(async (req) => {
  const startTime = Date.now();

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // --- Steg 1: Hämta veckans artiklar ---
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: articles, error: articlesError } = await supabase
      .from("articles")
      .select("title, url, ai_category, ai_subcategory, ai_relevance, ai_impact, ai_action, ai_timeframe, ai_summary, published_at, sources(name)")
      .gte("fetched_at", weekAgo.toISOString())
      .not("ai_category", "is", null)
      .gte("ai_relevance", 50) // Minst medelhög relevans
      .order("ai_relevance", { ascending: false })
      .limit(50); // Max 50 artiklar per briefing

    if (articlesError) {
      throw new Error(`Failed to fetch articles: ${articlesError.message}`);
    }

    if (!articles || articles.length === 0) {
      return new Response(
        JSON.stringify({
          message: "No analyzed articles this week — no briefing generated",
          duration_ms: Date.now() - startTime,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log(
      `[Briefing] ${articles.length} artiklar att sammanfatta`
    );

    // --- Steg 2: Gruppera per kategori ---
    const byCategory = new Map<string, typeof articles>();
    for (const article of articles) {
      const cat = article.ai_category || "Övrigt";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat)!.push(article);
    }

    // --- Steg 3: Generera briefing med Claude ---
    const articlesSummary = Array.from(byCategory.entries())
      .map(
        ([category, items]) =>
          `\n## ${category} (${items.length} artiklar)\n` +
          items
            .map(
              (a) =>
                `- "${a.title}" (relevans: ${a.ai_relevance}, ${a.ai_impact || "ej bedömd"}) — ${a.ai_summary || "Ingen sammanfattning"}`
            )
            .join("\n")
      )
      .join("\n");

    const prompt = `Du är omvärldsanalytiker för svensk offentlig sektor. Skriv en koncis veckosammanfattning (briefing) baserad på nedanstående artiklar.

Strukturera briefingen så här:
1. **Sammanfattning** (3-5 meningar om veckans viktigaste händelser)
2. **Agera nu** — artiklar som kräver omedelbar uppmärksamhet
3. **Planera** — kommande förändringar att förbereda sig för
4. **Bevaka** — trender att hålla ögonen på
5. **Per kategori** — korta sammanfattningar per bevakningsområde

Skriv på svenska. Var konkret och handlingsinriktad. Undvik floskler.

Period: ${weekAgo.toISOString().split("T")[0]} till ${now.toISOString().split("T")[0]}

Artiklar:
${articlesSummary}`;

    const claudeResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!claudeResponse.ok) {
      const errorBody = await claudeResponse.text();
      throw new Error(
        `Claude API error: ${claudeResponse.status} ${errorBody}`
      );
    }

    const claudeData = await claudeResponse.json();
    const briefingContent =
      claudeData.content?.[0]?.text || "Kunde inte generera briefing.";

    // --- Steg 4: Spara briefing ---
    const categoriesCovered = Array.from(byCategory.keys());
    const briefingTitle = `Omvärldsbriefing ${weekAgo.toISOString().split("T")[0]} – ${now.toISOString().split("T")[0]}`;

    const { data: briefing, error: briefingError } = await supabase
      .from("briefings")
      .insert({
        title: briefingTitle,
        content: briefingContent,
        period_start: weekAgo.toISOString(),
        period_end: now.toISOString(),
        article_count: articles.length,
        categories_covered: categoriesCovered,
      })
      .select()
      .single();

    if (briefingError) {
      throw new Error(`Failed to save briefing: ${briefingError.message}`);
    }

    console.log(`[Briefing] Sparad: ${briefingTitle}`);

    // --- Steg 5: Skapa notifieringar (respekterar weekly_briefing pref) ---
    const { data: subscribers } = await supabase
      .from("profiles")
      .select("id, full_name, notification_preferences");

    // Filtrera: bara de som har weekly_briefing aktiverad
    const eligibleSubscribers = (subscribers ?? []).filter((sub) => {
      const prefs = sub.notification_preferences;
      if (!prefs) return true; // Default: skicka
      if (prefs.enabled === false) return false;
      if (prefs.weekly_briefing === false) return false;
      return true;
    });

    if (eligibleSubscribers.length > 0) {
      const notifications = eligibleSubscribers.map((sub) => ({
        profile_id: sub.id,
        type: "briefing" as const,
        subject: briefingTitle,
        body: briefingContent,
        status: "pending" as const,
        scheduled_for: new Date().toISOString(),
      }));

      await supabase.from("notification_queue").insert(notifications);
      console.log(
        `[Briefing] ${notifications.length} notifieringar köade`
      );
    }

    const summary = {
      briefing_id: briefing.id,
      title: briefingTitle,
      articles_included: articles.length,
      categories_covered: categoriesCovered,
      subscribers_notified: eligibleSubscribers.length,
      duration_ms: Date.now() - startTime,
    };

    return new Response(JSON.stringify(summary), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(`[Briefing] Fatal error:`, error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
