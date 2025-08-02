-- Enable the cron extension (it will be managed by Supabase in the proper schema)
SELECT cron.schedule(
  'sync-youtube-playlist',
  '*/30 * * * *', -- Every 30 minutes
  $$
  SELECT
    net.http_post(
        url:='https://cvhmlrijuidvrsrzxmfv.supabase.co/functions/v1/fetch-youtube-playlist',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2aG1scmlqdWlkdnJzcnp4bWZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjA5NjEsImV4cCI6MjA2OTczNjk2MX0.N7Atcu_UFXdJr5E5DI3tJNye4tA2DebhESo3Wu17g-k"}'::jsonb,
        body:='{}'::jsonb
    ) as request_id;
  $$
);