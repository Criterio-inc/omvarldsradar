-- ============================================================
-- OmvärldsRadar — pg_cron: Schemalagda agentiska flöden
--
-- INSTRUKTION FÖR PÄR:
--   1. Gå till Supabase Dashboard → Database → Extensions
--   2. Sök "pg_cron" → klicka Enable
--   3. Sök "pg_net" → klicka Enable
--   4. Gå till SQL Editor → klistra in ALLT nedan → klicka Run
--   5. Verifiera: kör  SELECT * FROM cron.job;
--
-- Tre pipelines + cleanup:
--   1. Datainsamling  — var 6:e timme (00, 06, 12, 18 UTC = 01, 07, 13, 19 sv)
--   2. Briefing       — söndag kväll 20:00 UTC (21:00 svensk vintertid)
--   3. Notifieringar  — varje morgon 07:00 UTC (08:00 svensk vintertid)
--   4. Cleanup        — måndag 03:00 UTC
--
-- OBS: pg_cron kör i UTC. Svensk tid = UTC+1 (vinter) / UTC+2 (sommar)
-- ============================================================

-- ============================================================
-- Pipeline 1: DATAINSAMLING (var 6:e timme)
-- Hämtar RSS-flöden från alla 25+ källor + AI-klassificerar
-- ============================================================
SELECT cron.schedule(
  'fetch-all-sources',
  '0 */6 * * *',  -- 00:00, 06:00, 12:00, 18:00 UTC
  $$
    SELECT net.http_post(
      url := 'https://blyroacvazagxgfbixlb.supabase.co/functions/v1/fetch-sources',
      headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseXJvYWN2YXphZ3hnZmJpeGxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA0NDI4MiwiZXhwIjoyMDg4NjIwMjgyfQ.c_W4f_XIdOC2lrgXqJSf_fxspmez3pWnRropWiFrDos", "Content-Type": "application/json"}'::jsonb,
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
  '0 20 * * 0',  -- Söndag 20:00 UTC = 21:00 sv vintertid
  $$
    SELECT net.http_post(
      url := 'https://blyroacvazagxgfbixlb.supabase.co/functions/v1/generate-briefing',
      headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseXJvYWN2YXphZ3hnZmJpeGxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA0NDI4MiwiZXhwIjoyMDg4NjIwMjgyfQ.c_W4f_XIdOC2lrgXqJSf_fxspmez3pWnRropWiFrDos", "Content-Type": "application/json"}'::jsonb,
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
  '0 7 * * *',  -- Varje dag 07:00 UTC = 08:00 sv vintertid
  $$
    SELECT net.http_post(
      url := 'https://blyroacvazagxgfbixlb.supabase.co/functions/v1/send-notifications',
      headers := '{"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJseXJvYWN2YXphZ3hnZmJpeGxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MzA0NDI4MiwiZXhwIjoyMDg4NjIwMjgyfQ.c_W4f_XIdOC2lrgXqJSf_fxspmez3pWnRropWiFrDos", "Content-Type": "application/json"}'::jsonb,
      body := '{}'::jsonb
    );
  $$
);

-- ============================================================
-- BONUS: Rensa gammal fetch_log (behåll 30 dagar)
-- ============================================================
SELECT cron.schedule(
  'cleanup-old-fetch-logs',
  '0 3 * * 1',  -- Måndag 03:00 UTC
  $$
    DELETE FROM fetch_log
    WHERE started_at < now() - interval '30 days';
  $$
);

-- ============================================================
-- VERIFIERING — kör detta efteråt:
-- ============================================================
SELECT jobid, jobname, schedule, active FROM cron.job ORDER BY jobid;
