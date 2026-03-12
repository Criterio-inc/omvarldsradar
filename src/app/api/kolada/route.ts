import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

const KOLADA_BASE = "https://api.kolada.se/v3";
const CACHE_TTL_DAYS = 7;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DB = SupabaseClient<any, any, any>;

function getServiceClient(): DB | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// --- Municipalities ---

async function getMunicipalities(db: DB) {
  // Försök cache
  const { data: cached, error } = await db
    .from("kolada_municipalities")
    .select("*")
    .order("name");

  if (!error && cached && cached.length > 0) {
    return cached;
  }

  // Cache miss — hämta från Kolada API
  const res = await fetch(`${KOLADA_BASE}/municipality`);
  if (!res.ok) throw new Error(`Kolada API error: ${res.status}`);
  const json = await res.json();

  const municipalities = (json.values || [])
    .filter((m: { type: string }) => m.type === "K" || m.type === "L")
    .map((m: { id: string; title: string; type: string }) => ({
      code: m.id,
      name: m.title,
      type: m.type,
    }));

  // Spara i cache (upsert)
  if (municipalities.length > 0) {
    await db
      .from("kolada_municipalities")
      .upsert(municipalities as any, { onConflict: "code" });
  }

  return municipalities;
}

// --- KPIs ---

async function getKpis(db: DB, category?: string) {
  let query = db.from("kolada_kpis").select("*").eq("active", true);
  if (category) {
    query = query.eq("category", category);
  }
  const { data, error } = await query.order("title");

  if (error) throw new Error(error.message);
  return data ?? [];
}

// --- Data ---

async function getData(
  db: DB,
  kpiId: string,
  municipalities: string[],
  years: number[]
) {
  // Kolla cache först
  const cacheThreshold = new Date(
    Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data: cached } = await db
    .from("kolada_data")
    .select("*")
    .eq("kpi_id", kpiId)
    .in("municipality_code", municipalities)
    .in("year", years)
    .gte("fetched_at", cacheThreshold);

  // Kolla vilka kombinationer som saknas
  const cachedKeys = new Set(
    (cached ?? []).map(
      (d: { kpi_id: string; municipality_code: string; year: number; gender: string }) =>
        `${d.kpi_id}-${d.municipality_code}-${d.year}-${d.gender}`
    )
  );

  const missing: { municipality: string; year: number }[] = [];
  for (const mun of municipalities) {
    for (const year of years) {
      if (!cachedKeys.has(`${kpiId}-${mun}-${year}-T`)) {
        missing.push({ municipality: mun, year });
      }
    }
  }

  let freshData: Array<{
    kpi_id: string;
    municipality_code: string;
    year: number;
    value: number | null;
    gender: string;
  }> = [];

  // Hämta saknade från Kolada API
  if (missing.length > 0) {
    const uniqueMuns = [...new Set(missing.map((m) => m.municipality))];
    const uniqueYears = [...new Set(missing.map((m) => m.year))];

    const munParam = uniqueMuns.join(",");
    const yearParam = uniqueYears.join(",");
    const url = `${KOLADA_BASE}/data/kpi/${kpiId}/municipality/${munParam}/year/${yearParam}`;

    try {
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        freshData = (json.values || []).flatMap(
          (item: { municipality: string; period: string; values: Array<{ gender: string; value: number | null }> }) =>
            (item.values || [])
              .filter((v: { gender: string }) => v.gender === "T")
              .map((v: { gender: string; value: number | null }) => ({
                kpi_id: kpiId,
                municipality_code: item.municipality,
                year: parseInt(item.period),
                value: v.value,
                gender: v.gender,
              }))
        );

        // Spara i cache
        if (freshData.length > 0) {
          await db
            .from("kolada_data")
            .upsert(freshData as any, {
              onConflict: "kpi_id,municipality_code,year,gender",
            });
        }
      }
    } catch (err) {
      console.error("[kolada] API fetch error:", err);
    }
  }

  // Kombinera cache + nytt
  const allData = [...(cached ?? []), ...freshData];
  return allData;
}

// --- Route Handler ---

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get("action");

  const db = getServiceClient();
  if (!db) {
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    switch (action) {
      case "municipalities": {
        const data = await getMunicipalities(db);
        return NextResponse.json({ data });
      }

      case "kpis": {
        const category = searchParams.get("category") || undefined;
        const data = await getKpis(db, category);
        return NextResponse.json({ data });
      }

      case "data": {
        const kpi = searchParams.get("kpi");
        const municipalities = searchParams.get("municipalities")?.split(",") ?? [];
        const years = (searchParams.get("years")?.split(",") ?? []).map(Number);

        if (!kpi || municipalities.length === 0 || years.length === 0) {
          return NextResponse.json(
            { error: "Parametrar saknas: kpi, municipalities, years" },
            { status: 400 }
          );
        }

        const data = await getData(db, kpi, municipalities, years);
        return NextResponse.json({ data });
      }

      default:
        return NextResponse.json(
          { error: "Ogiltig action. Använd: municipalities, kpis, data" },
          { status: 400 }
        );
    }
  } catch (err) {
    console.error("[kolada] Error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Okänt fel" },
      { status: 500 }
    );
  }
}
