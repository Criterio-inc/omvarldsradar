-- Kurerade Kolada KPI:er för OmvärldsRadar
-- ALLA ID:n verifierade mot Kolada API 2026-03-11
-- Kör i Supabase SQL Editor EFTER migrate-sprint5.sql

-- Rensa gamla felaktiga KPI:er först
DELETE FROM kolada_data WHERE kpi_id NOT IN (
  'N03001','N03002','N00900','N03011','N03132',
  'N01951','N01963','N01960','N00959','N00927',
  'N15428','N15030','N10804','N15006','N15507',
  'N20891','N21006','N20892','N20044','N31001',
  'N07916','N00403','N07900','U07414','N07540',
  'N02267','N01720','N00957','N00090','N01982'
);
DELETE FROM kolada_kpis WHERE id NOT IN (
  'N03001','N03002','N00900','N03011','N03132',
  'N01951','N01963','N01960','N00959','N00927',
  'N15428','N15030','N10804','N15006','N15507',
  'N20891','N21006','N20892','N20044','N31001',
  'N07916','N00403','N07900','U07414','N07540',
  'N02267','N01720','N00957','N00090','N01982'
);

INSERT INTO kolada_kpis (id, title, description, category, unit, active) VALUES

-- === EKONOMI (5) ===
('N03001', 'Resultat före extraordinära poster', 'Resultat som andel av skatt och generella statsbidrag', 'Ekonomi', 'procent', true),
('N03002', 'Soliditet inkl pensionsåtaganden', 'Soliditet inklusive pensionsåtaganden i kommunen', 'Ekonomi', 'procent', true),
('N00900', 'Skattesats totalt', 'Total kommunal och regional skattesats', 'Ekonomi', 'procent', true),
('N03011', 'Nettokostnader per invånare', 'Verksamhetens nettokostnader enligt resultaträkning', 'Ekonomi', 'kr/inv', true),
('N03132', 'Nettoinvesteringar per invånare', 'Nettoinvesteringar totalt i kommunen', 'Ekonomi', 'kr/inv', true),

-- === BEFOLKNING (5) ===
('N01951', 'Invånare totalt', 'Totalt antal invånare i kommunen', 'Befolkning', 'antal', true),
('N01963', 'Befolkningsförändring', 'Befolkningsförändring sedan föregående år', 'Befolkning', 'procent', true),
('N01960', 'Invånare 65+ år', 'Andel av befolkningen som är 65 år och äldre', 'Befolkning', 'procent', true),
('N00959', 'Medelålder', 'Genomsnittlig ålder i kommunen', 'Befolkning', 'år', true),
('N00927', 'Demografisk försörjningskvot', 'Antal unga+äldre per person i arbetsför ålder', 'Befolkning', 'kvot', true),

-- === UTBILDNING (5) ===
('N15428', 'Behöriga till yrkesprogram', 'Elever i åk 9 behöriga till yrkesprogram, hemkommun', 'Utbildning', 'procent', true),
('N15030', 'Lärare med pedagogisk högskolexamen', 'Lärare med pedagogisk högskolexamen i grundskola åk 1-9', 'Utbildning', 'procent', true),
('N10804', 'Barn i förskola/fritids', 'Barn 1-12 år inskrivna i förskola, fritidshem och pedagogisk omsorg', 'Utbildning', 'procent', true),
('N15006', 'Kostnad grundskola per elev', 'Kostnad grundskola åk 1-9, hemkommun', 'Utbildning', 'kr/elev', true),
('N15507', 'Meritvärde åk 9', 'Genomsnittligt meritvärde 17 ämnen, hemkommun', 'Utbildning', 'poäng', true),

-- === OMSORG (5) ===
('N20891', 'Invånare 65+ med omsorg', 'Andel invånare 65+ i särskilt boende eller med hemtjänst', 'Omsorg', 'procent', true),
('N21006', 'Kostnad hemtjänst per brukare', 'Kostnad hemtjänst äldreomsorg per hemtjänsttagare', 'Omsorg', 'kronor', true),
('N20892', 'Invånare 80+ med omsorg', 'Andel invånare 80+ i särskilt boende eller med hemtjänst', 'Omsorg', 'procent', true),
('N20044', 'Nettokostnad äldreomsorg', 'Nettokostnad omsorg om äldre och funktionsnedsättning', 'Omsorg', 'kr/inv', true),
('N31001', 'Kostnad ekonomiskt bistånd', 'Kostnad ekonomiskt bistånd per invånare', 'Omsorg', 'kr/inv', true),

-- === MILJÖ & SAMHÄLLE (5) ===
('N07916', 'Färdigställda bostäder', 'Färdigställda bostäder, ny- och ombyggnad per 1000 invånare', 'Miljö & Samhälle', 'antal/1000', true),
('N00403', 'Ekologisk åkermark', 'Ekologiskt brukad åkermark som andel av total åkermark', 'Miljö & Samhälle', 'procent', true),
('N07900', 'Bredband 100 Mbit/s', 'Tillgång till fast bredband om minst 100 Mbit/s', 'Miljö & Samhälle', 'procent', true),
('U07414', 'Avfall till materialåtervinning', 'Kommunalt avfall insamlat för materialåtervinning inkl biologisk', 'Miljö & Samhälle', 'procent', true),
('N07540', 'Anmälda brott totalt', 'Anmälda brott totalt per 100 000 invånare', 'Miljö & Samhälle', 'antal/100k', true),

-- === ARBETSMARKNAD (5) ===
('N02267', 'Sysselsättningsgrad 20-64 år', 'Andel sysselsatta av befolkningen 20-64 år', 'Arbetsmarknad', 'procent', true),
('N01720', 'Arbetslöshet 16-64 år', 'Arbetslösa eller i åtgärd minst en dag under året', 'Arbetsmarknad', 'procent', true),
('N00957', 'Ohälsotal', 'Utbetalda nettodagar sjukpenning och sjuk-/aktivitetsersättning per person 16-64 år', 'Arbetsmarknad', 'dagar', true),
('N00090', 'Sjukfrånvaro kommunanställda', 'Total sjukfrånvaro bland kommunanställda', 'Arbetsmarknad', 'procent', true),
('N01982', 'Eftergymnasial utbildning 25-64 år', 'Invånare 25-64 år med eftergymnasial utbildning', 'Arbetsmarknad', 'procent', true)

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit,
  active = EXCLUDED.active;
