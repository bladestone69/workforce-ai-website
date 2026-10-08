-- Run after enabling the pg_cron extension in Supabase Integrations > Cron.
-- Check Cron job history after setup and after any database upgrade.
select cron.schedule(
    'site-pageviews-90-day-retention',
    '15 3 * * *',
    $$delete from public.site_pageviews where occurred_at < now() - interval '90 days'$$
);
