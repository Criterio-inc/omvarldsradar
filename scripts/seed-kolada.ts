/**
 * Seed Kolada municipalities (kommuner + regioner) from Kolada API
 *
 * Usage: npx tsx scripts/seed-kolada.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "..", ".env.local") });

const KOLADA_BASE = "https://api.kolada.se/v3";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    console.error(
      "❌ Saknar NEXT_PUBLIC_SUPABASE_URL eller SUPABASE_SERVICE_ROLE_KEY i .env.local"
    );
    process.exit(1);
  }

  const db = createClient(url, key);

  console.log("📥 Hämtar kommuner och regioner från Kolada API...");

  const res = await fetch(`${KOLADA_BASE}/municipality`);
  if (!res.ok) {
    console.error(`❌ Kolada API svarade med ${res.status}`);
    process.exit(1);
  }

  const json = await res.json();
  const all = json.values || [];

  // Filtrera: K = kommun, L = region (skippa riket etc)
  const municipalities = all
    .filter((m: { type: string }) => m.type === "K" || m.type === "L")
    .map((m: { id: string; title: string; type: string }) => ({
      code: m.id,
      name: m.title,
      type: m.type,
    }));

  const kommuner = municipalities.filter(
    (m: { type: string }) => m.type === "K"
  );
  const regioner = municipalities.filter(
    (m: { type: string }) => m.type === "L"
  );

  console.log(`✅ Hittade ${kommuner.length} kommuner och ${regioner.length} regioner`);

  // Upsert i batchar om 100
  const batchSize = 100;
  let inserted = 0;

  for (let i = 0; i < municipalities.length; i += batchSize) {
    const batch = municipalities.slice(i, i + batchSize);
    const { error } = await db
      .from("kolada_municipalities")
      .upsert(batch, { onConflict: "code" });

    if (error) {
      console.error(`❌ Batch ${i / batchSize + 1} misslyckades:`, error.message);
    } else {
      inserted += batch.length;
      console.log(
        `  📦 Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} kommuner/regioner`
      );
    }
  }

  console.log(`\n✅ Totalt: ${inserted} kommuner/regioner sparade i databasen`);
  console.log("\n🎉 Klar! Kör sedan seed-kolada-kpis.sql i Supabase SQL Editor.");
}

main().catch((err) => {
  console.error("❌ Seed-skript kraschade:", err);
  process.exit(1);
});
