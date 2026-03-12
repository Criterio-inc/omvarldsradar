-- Sprint 5 Migration: Kolada-tabeller + FTS index
-- Kör i Supabase SQL Editor

-- =============================================================
-- 1. Full-Text Search index för artiklar (Block A)
-- =============================================================

-- Lägg till FTS-kolumn (genererad automatiskt från titel + sammanfattning)
-- OBS: Swedish text search config kanske inte finns, vi använder 'simple' som fallback
ALTER TABLE articles ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(ai_summary, '') || ' ' || coalesce(summary, ''))
  ) STORED;

-- GIN-index för snabb sökning
CREATE INDEX IF NOT EXISTS idx_articles_fts ON articles USING gin(fts);


-- =============================================================
-- 2. Kolada-tabeller (Block D)
-- =============================================================

-- Kommuner & regioner
CREATE TABLE IF NOT EXISTS kolada_municipalities (
  code TEXT PRIMARY KEY,          -- "0180" (Stockholm)
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'K'  -- K=kommun, L=region
);

-- KPI-definitioner (kurerade av oss)
CREATE TABLE IF NOT EXISTS kolada_kpis (
  id TEXT PRIMARY KEY,            -- "N00945"
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,         -- Vår kurerade kategori
  unit TEXT,
  active BOOLEAN DEFAULT true
);

-- KPI-data (cachelagras från Kolada API)
CREATE TABLE IF NOT EXISTS kolada_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  kpi_id TEXT REFERENCES kolada_kpis(id),
  municipality_code TEXT REFERENCES kolada_municipalities(code),
  year INT NOT NULL,
  value NUMERIC,
  gender TEXT DEFAULT 'T',
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(kpi_id, municipality_code, year, gender)
);

-- Index för snabba lookups
CREATE INDEX IF NOT EXISTS idx_kolada_data_kpi ON kolada_data(kpi_id);
CREATE INDEX IF NOT EXISTS idx_kolada_data_mun ON kolada_data(municipality_code);
CREATE INDEX IF NOT EXISTS idx_kolada_data_year ON kolada_data(year);


-- =============================================================
-- 3. RLS-policies (läsbehörighet för alla inloggade)
-- =============================================================

ALTER TABLE kolada_municipalities ENABLE ROW LEVEL SECURITY;
ALTER TABLE kolada_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE kolada_data ENABLE ROW LEVEL SECURITY;

-- Alla inloggade kan läsa
CREATE POLICY "kolada_municipalities_read" ON kolada_municipalities
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "kolada_kpis_read" ON kolada_kpis
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "kolada_data_read" ON kolada_data
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Service role kan skriva (cache-uppdateringar via API-route)
-- Hanteras automatiskt genom att API-routen använder service_role_key
