-- ============================================================
-- OmvärldsRadar - Seed: 31 bevakningskällor
-- VERIFIERADE 2026-03-09: Riktiga RSS-URLer testade med curl
-- Kör EFTER schema.sql i Supabase SQL Editor
-- ============================================================

INSERT INTO sources (name, slug, url, feed_url, feed_type, category, maps_to) VALUES

-- ============================================================
-- ✅ VERIFIERADE RSS-FLÖDEN (6 st — ger riktig XML)
-- ============================================================

('SKR', 'skr', 'https://skr.se',
  'https://skr.se/4.e6f1d6318fa4a7c94db534c/12.e6f1d6318fa4a7c94db5bb0.portlet?state=rss&sv.contenttype=text/xml;charset=UTF-8',
  'rss', 'Styrning & digitalisering',
  ARRAY['Styrning & Demokrati', 'Arbetsgivare & Organisation']),

('Tillväxtverket', 'tillvaxtverket', 'https://tillvaxtverket.se',
  'https://tillvaxtverket.se/4.35643232185c4dc7f0b51413/12.35643232185c4dc7f0b51425.portlet?state=rss&sv.contenttype=text/xml;charset=UTF-8',
  'rss', 'Innovation & tillväxt',
  ARRAY['Innovation & Omställning']),

('Ekonomistyrningsverket', 'esv', 'https://www.esv.se',
  'https://www.esv.se/Specialsidor/RSS/E-plikt-RSS/',
  'rss', 'Ekonomi & arbetsmarknad',
  ARRAY['Ekonomi & Resurser']),

('Computer Sweden', 'computer-sweden', 'https://computersweden.se',
  'https://computersweden.se/feed/',
  'rss', 'Branschmedia',
  ARRAY['Digitalisering & Teknik', 'Innovation & Omställning']),

('Dagens Samhälle', 'dagens-samhalle', 'https://www.dagenssamhalle.se',
  'https://www.dagenssamhalle.se/rss.xml',
  'rss', 'Branschmedia',
  ARRAY['Styrning & Demokrati', 'Välfärd & Omsorg', 'Ekonomi & Resurser']),

('Altinget', 'altinget', 'https://www.altinget.se',
  'https://www.altinget.se/rss',
  'rss', 'Branschmedia',
  ARRAY['Styrning & Demokrati']),

-- ============================================================
-- 🔧 KRÄVER SCRAPING (25 st — inget fungerande RSS-flöde)
-- Implementeras med web scraper i nästa iteration
-- ============================================================

-- Styrning & digitalisering
('DIGG', 'digg', 'https://www.digg.se', NULL, 'scrape',
  'Styrning & digitalisering',
  ARRAY['Digitalisering & Teknik', 'Styrning & Demokrati']),

('Inera', 'inera', 'https://www.inera.se', NULL, 'scrape',
  'Styrning & digitalisering',
  ARRAY['Digitalisering & Teknik']),

('eSam', 'esam', 'https://www.esam.se', NULL, 'scrape',
  'Styrning & digitalisering',
  ARRAY['Digitalisering & Teknik']),

('Upphandlingsmyndigheten', 'upphandlingsmyndigheten', 'https://www.upphandlingsmyndigheten.se', NULL, 'scrape',
  'Styrning & digitalisering',
  ARRAY['Styrning & Demokrati', 'Ekonomi & Resurser']),

-- Välfärd, hälsa & utbildning
('Socialstyrelsen', 'socialstyrelsen', 'https://www.socialstyrelsen.se', NULL, 'scrape',
  'Välfärd, hälsa & utbildning',
  ARRAY['Välfärd & Omsorg']),

('IVO', 'ivo', 'https://www.ivo.se', NULL, 'scrape',
  'Välfärd, hälsa & utbildning',
  ARRAY['Välfärd & Omsorg']),

('Folkhälsomyndigheten', 'folkhalsomyndigheten', 'https://www.folkhalsomyndigheten.se', NULL, 'scrape',
  'Välfärd, hälsa & utbildning',
  ARRAY['Välfärd & Omsorg', 'Samhälle & Medborgare']),

('Skolverket', 'skolverket', 'https://www.skolverket.se', NULL, 'scrape',
  'Välfärd, hälsa & utbildning',
  ARRAY['Utbildning & Kompetens']),

('Universitetskanslersämbetet', 'uka', 'https://www.uka.se', NULL, 'scrape',
  'Välfärd, hälsa & utbildning',
  ARRAY['Utbildning & Kompetens']),

-- Samhällsbyggnad, miljö & energi
('Naturvårdsverket', 'naturvardsverket', 'https://www.naturvardsverket.se', NULL, 'scrape',
  'Samhällsbyggnad, miljö & energi',
  ARRAY['Klimat, Miljö & Samhällsbyggnad']),

('Boverket', 'boverket', 'https://www.boverket.se', NULL, 'scrape',
  'Samhällsbyggnad, miljö & energi',
  ARRAY['Klimat, Miljö & Samhällsbyggnad']),

('Energimyndigheten', 'energimyndigheten', 'https://www.energimyndigheten.se', NULL, 'scrape',
  'Samhällsbyggnad, miljö & energi',
  ARRAY['Klimat, Miljö & Samhällsbyggnad']),

-- Trygghet & beredskap
('MSB', 'msb', 'https://www.msb.se', NULL, 'scrape',
  'Trygghet & beredskap',
  ARRAY['Trygghet & Beredskap']),

('FOI', 'foi', 'https://www.foi.se', NULL, 'scrape',
  'Trygghet & beredskap',
  ARRAY['Trygghet & Beredskap']),

('BRÅ', 'bra', 'https://bra.se', NULL, 'scrape',
  'Trygghet & beredskap',
  ARRAY['Trygghet & Beredskap', 'Samhälle & Medborgare']),

-- Ekonomi & arbetsmarknad
('Konjunkturinstitutet', 'konj', 'https://www.konj.se', NULL, 'scrape',
  'Ekonomi & arbetsmarknad',
  ARRAY['Ekonomi & Resurser']),

('Arbetsmiljöverket', 'av', 'https://www.av.se', NULL, 'scrape',
  'Ekonomi & arbetsmarknad',
  ARRAY['Arbetsgivare & Organisation']),

('Statskontoret', 'statskontoret', 'https://www.statskontoret.se', NULL, 'scrape',
  'Ekonomi & arbetsmarknad',
  ARRAY['Arbetsgivare & Organisation', 'Styrning & Demokrati']),

-- Innovation & tillväxt
('Vinnova', 'vinnova', 'https://www.vinnova.se', NULL, 'scrape',
  'Innovation & tillväxt',
  ARRAY['Innovation & Omställning']),

('PTS', 'pts', 'https://pts.se', NULL, 'scrape',
  'Innovation & tillväxt',
  ARRAY['Innovation & Omställning', 'Digitalisering & Teknik']),

-- Regeringen & länsstyrelserna
('Regeringskansliet', 'regeringen', 'https://www.regeringen.se', NULL, 'scrape',
  'Regeringen & länsstyrelserna',
  ARRAY['Styrning & Demokrati', 'Ekonomi & Resurser']),

('Länsstyrelserna', 'lansstyrelserna', 'https://www.lansstyrelsen.se', NULL, 'scrape',
  'Regeringen & länsstyrelserna',
  ARRAY['Klimat, Miljö & Samhällsbyggnad', 'Trygghet & Beredskap']),

-- EU-institutioner
('EU-kommissionen', 'eu-kommissionen', 'https://ec.europa.eu', NULL, 'scrape',
  'EU-institutioner',
  ARRAY['Styrning & Demokrati', 'Digitalisering & Teknik']),

('EU Digital Strategy', 'eu-digital', 'https://digital-strategy.ec.europa.eu', NULL, 'scrape',
  'EU-institutioner',
  ARRAY['Digitalisering & Teknik', 'Innovation & Omställning']),

-- Forskning & statistik
('SCB', 'scb', 'https://www.scb.se', NULL, 'scrape',
  'Forskning & statistik',
  ARRAY['Ekonomi & Resurser', 'Samhälle & Medborgare']),

('Riksrevisionen', 'riksrevisionen', 'https://www.riksrevisionen.se', NULL, 'scrape',
  'Forskning & statistik',
  ARRAY['Styrning & Demokrati', 'Ekonomi & Resurser']);

-- ============================================================
-- Testorganisation
-- ============================================================

INSERT INTO organizations (id, name, type, municipality_code, settings)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Testkommun',
  'municipality',
  '1380',
  '{
    "categories": [
      "Styrning & Demokrati",
      "Digitalisering & Teknik",
      "Välfärd & Omsorg",
      "Utbildning & Kompetens",
      "Klimat, Miljö & Samhällsbyggnad",
      "Trygghet & Beredskap",
      "Ekonomi & Resurser",
      "Arbetsgivare & Organisation",
      "Samhälle & Medborgare",
      "Innovation & Omställning"
    ]
  }'::jsonb
);
