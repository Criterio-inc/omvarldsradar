-- ============================================================
-- OmvärldsRadar — pg_cron: Schemalagda agentiska flöden
-- Kör detta i Supabase SQL Editor EFTER att Edge Functions deployats
--
-- Tre pipelines:
--   1. Datainsamling  — var 6:e timme
--   2. Briefing       — söndag kväll 20:00
--   3. Notifieringar  — varje morgon 07:00
-- ============================================================

-- Aktivera pg_cron och pg_net (krävs för HTTP-anrop)
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ============================================================
-- Pipeline 1: DATAINSAMLING (var 6:e timme)
-- Hämtar RSS-flöden från alla 25+ källor
-- ============================================================
SELECT cron.schedule(
  'fetch-all-sources',
  '0 */6 * * *',  -- 00:00, 06:00, 12:00, 18:00
  $$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/fetch-sources',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);

-- ============================================================
-- Pipeline 2: BRIEFING-GENERERING (söndag kväll)
-- Sammanfattar veckans artiklar med Claude Sonnet
-- ============================================================
SELECT cron.schedule(
  'generate-weekly-briefing',
  '0 20 * * 0',  -- Söndag 20:00
  $$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/generate-briefing',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);

-- ============================================================
-- Pipeline 3: E-POSTNOTIFIERINGAR (varje morgon)
-- Skickar köade briefings och alerts via Resend
-- ============================================================
SELECT cron.schedule(
  'send-pending-notifications',
  '0 7 * * *',  -- Varje dag 07:00
  $$
    SELECT net.http_post(
      url := current_setting('app.settings.supabase_url') || '/functions/v1/send-notifications',
      headers := jsonb_build_object(
        'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
        'Content-Type', 'application/json'
      ),
      body := '{}'::jsonb
    );
  $$
);

-- ============================================================
-- BONUS: Rensa gammal fetch_log (behåll 30 dagar)
-- ============================================================
SELECT cron.schedule(
  'cleanup-old-fetch-logs',
  '0 3 * * 1',  -- Måndag 03:00
  $$
    DELETE FROM fetch_log
    WHERE started_at < now() - interval '30 days';
  $$
);

-- ============================================================
-- Visa aktiva cron-jobb
-- ============================================================
-- SELECT * FROM cron.job;
