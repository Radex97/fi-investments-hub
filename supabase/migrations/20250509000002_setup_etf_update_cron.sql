
-- First, enable the required extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the ETF data update to run every day at 2:00 UTC
SELECT cron.schedule(
  'daily-etf-data-update',
  '0 2 * * *',  -- At 02:00 every day
  $$
  SELECT
    net.http_post(
      url:=CONCAT(current_setting('supabase.functions_endpoint'), '/update-etf-data'),
      headers:=CONCAT('{"Content-Type": "application/json", "Authorization": "Bearer ', current_setting('supabase.service_role_key'), '"}')::jsonb,
      body:='{}'::jsonb
    ) AS request_id;
  $$
);
