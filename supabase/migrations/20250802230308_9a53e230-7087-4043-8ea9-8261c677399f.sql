-- Remove extensions from public schema and install in extensions schema
DROP EXTENSION IF EXISTS pg_cron;
DROP EXTENSION IF EXISTS pg_net;

-- Create extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;

-- Install extensions in the extensions schema
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Schedule the YouTube playlist sync to run every 30 minutes
SELECT extensions.cron.schedule(
  'sync-youtube-playlist',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT
    extensions.net.http_post(
        url:='https://cvhmlrijuidvrsrzxmfv.supabase.co/functions/v1/fetch-youtube-playlist',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2aG1scmlqdWlkdnJzcnp4bWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjA5NjEsImV4cCI6MjA2OTczNjk2MX0.N7Atcu_UFXdJr5E5DI3tJNye4tA2DebhESo3Wu17g-k"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);