-- Kurerade Kolada KPI:er för OmvärldsRadar
-- Kör i Supabase SQL Editor EFTER migrate-sprint5.sql

INSERT INTO kolada_kpis (id, title, description, category, unit, active) VALUES

-- === EKONOMI ===
('N00002', 'Resultat före extraordinära poster', 'Kommunens resultat som andel av skatter och bidrag', 'Ekonomi', 'procent', true),
('N00003', 'Soliditet inklusive pensioner', 'Eget kapital inklusive pensionsåtaganden som andel av tillgångar', 'Ekonomi', 'procent', true),
('N00900', 'Kommunal skattesats', 'Den kommunala skattesatsen', 'Ekonomi', 'kronor', true),
('N00004', 'Nettokostnad per invånare', 'Kommunens totala nettokostnad per invånare', 'Ekonomi', 'kronor', true),
('N00005', 'Investeringsvolym per invånare', 'Nettoinvesteringar per invånare i kronor', 'Ekonomi', 'kronor', true),

-- === BEFOLKNING ===
('N01951', 'Befolkning totalt', 'Totalt antal invånare i kommunen', 'Befolkning', 'antal', true),
('N01960', 'Befolkningsförändring', 'Befolkningsförändring i procent under året', 'Befolkning', 'procent', true),
('N02908', 'Andel invånare 0-17 år', 'Andel av befolkningen som är 0-17 år', 'Befolkning', 'procent', true),
('N02909', 'Andel invånare 65+ år', 'Andel av befolkningen som är 65 år och äldre', 'Befolkning', 'procent', true),
('N02914', 'Försörjningskvot', 'Antal personer 0-19 + 65+ per 100 personer 20-64 år', 'Befolkning', 'kvot', true),

-- === UTBILDNING ===
('N15002', 'Elever behöriga till gymnasieskolan', 'Andel elever i åk 9 behöriga till ett nationellt program', 'Utbildning', 'procent', true),
('N15420', 'Andel behöriga lärare', 'Andel lärare med pedagogisk högskoleexamen i grundskolan', 'Utbildning', 'procent', true),
('N15030', 'Barn i förskola 1-5 år', 'Andel inskrivna barn i förskola, 1-5 år', 'Utbildning', 'procent', true),
('N15513', 'Kostnad per elev grundskola', 'Bruttokostnad per elev i kommunal grundskola', 'Utbildning', 'kronor', true),
('N15817', 'Elever med godkänt i alla ämnen åk 9', 'Andel elever som uppnått kunskapskraven i alla ämnen', 'Utbildning', 'procent', true),

-- === OMSORG ===
('N26001', 'Nöjd med äldreomsorgen totalt', 'Andel av brukarna som är nöjda totalt med sin hemtjänst/sitt äldreboende', 'Omsorg', 'procent', true),
('N26400', 'Kostnad per brukare äldreomsorg', 'Kostnad per brukare i ordinärt boende (hemtjänst)', 'Omsorg', 'kronor', true),
('N26013', 'Väntetid till äldreboende', 'Genomsnittlig väntetid i antal dagar till särskilt boende', 'Omsorg', 'dagar', true),
('N28001', 'Handläggningstid ekonomiskt bistånd', 'Genomsnittlig handläggningstid i antal dagar', 'Omsorg', 'dagar', true),
('N26902', 'Andel personal med adekvat utbildning', 'Andel personal i äldreomsorg med adekvat utbildning', 'Omsorg', 'procent', true),

-- === MILJÖ & SAMHÄLLE ===
('N07903', 'Hushållsavfall kg per invånare', 'Insamlat hushållsavfall i kg per invånare', 'Miljö & Samhälle', 'kg', true),
('N07402', 'Andel förnybara bränslen i kollektivtrafik', 'Andel förnybara bränslen i kollektivtrafiken', 'Miljö & Samhälle', 'procent', true),
('N07006', 'CO2-utsläpp per invånare', 'Koldioxidutsläpp per invånare inom kommunens gränser', 'Miljö & Samhälle', 'ton', true),
('N22001', 'Färdigställda bostäder per 1000 inv', 'Antal nybyggda bostäder per 1000 invånare', 'Miljö & Samhälle', 'antal', true),
('N07926', 'Energianvändning per invånare', 'Total energianvändning i MWh per invånare', 'Miljö & Samhälle', 'MWh', true),

-- === ARBETSMARKNAD ===
('N00987', 'Sysselsättningsgrad 20-64 år', 'Andel förvärvsarbetande av befolkningen 20-64 år', 'Arbetsmarknad', 'procent', true),
('N00988', 'Arbetslöshet 16-64 år', 'Andel öppet arbetslösa av befolkningen 16-64 år', 'Arbetsmarknad', 'procent', true),
('N00941', 'Ohälsotal', 'Antal utbetalda nettodagar med sjukpenning och sjuk-/aktivitetsersättning per person 16-64 år', 'Arbetsmarknad', 'dagar', true),
('N03101', 'Sjukfrånvaro kommunanställda', 'Sjukfrånvaro i procent av sammanlagd ordinarie arbetstid bland kommunanställda', 'Arbetsmarknad', 'procent', true),
('N01963', 'Andel med eftergymnasial utbildning', 'Andel av befolkningen 25-64 år med eftergymnasial utbildning', 'Arbetsmarknad', 'procent', true)

ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  unit = EXCLUDED.unit,
  active = EXCLUDED.active;
