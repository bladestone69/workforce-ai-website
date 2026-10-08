-- Run once in the new Supabase project's SQL Editor.
-- Anonymous visitors cannot access this table through Supabase directly.
create table if not exists public.site_pageviews (
    id bigint generated always as identity primary key,
    occurred_at timestamptz not null default now(),
    path text not null check (char_length(path) between 1 and 120),
    from_path text check (from_path is null or char_length(from_path) between 1 and 120),
    referrer_host text check (referrer_host is null or char_length(referrer_host) between 1 and 100)
);

create index if not exists site_pageviews_occurred_at_idx on public.site_pageviews (occurred_at desc);
create index if not exists site_pageviews_path_idx on public.site_pageviews (path, occurred_at desc);
alter table public.site_pageviews enable row level security;
revoke all on public.site_pageviews from anon, authenticated;
grant select, insert on public.site_pageviews to service_role;
grant usage, select on sequence public.site_pageviews_id_seq to service_role;

create or replace function public.site_analytics_summary(days_back integer default 30)
returns jsonb
language sql
stable
security invoker
set search_path = ''
as $$
    with views as (
        select path, from_path, referrer_host, occurred_at
        from public.site_pageviews
        where occurred_at >= now() - (least(greatest(days_back, 1), 90) * interval '1 day')
    )
    select jsonb_build_object(
        'days', least(greatest(days_back, 1), 90),
        'pageviews', (select count(*) from views),
        'pages', coalesce((select jsonb_agg(row_to_json(p)) from (
            select path, count(*) as views from views group by path order by views desc limit 12
        ) p), '[]'::jsonb),
        'referrers', coalesce((select jsonb_agg(row_to_json(r)) from (
            select referrer_host as host, count(*) as views from views
            where referrer_host is not null group by referrer_host order by views desc limit 10
        ) r), '[]'::jsonb),
        'routes', coalesce((select jsonb_agg(row_to_json(t)) from (
            select from_path, path, count(*) as views from views
            where from_path is not null group by from_path, path order by views desc limit 10
        ) t), '[]'::jsonb),
        'daily', coalesce((select jsonb_agg(row_to_json(d)) from (
            select occurred_at::date as day, count(*) as views from views
            group by occurred_at::date order by day desc limit 30
        ) d), '[]'::jsonb)
    );
$$;

revoke all on function public.site_analytics_summary(integer) from public, anon, authenticated;
grant execute on function public.site_analytics_summary(integer) to service_role;

-- Retention: schedule or run this monthly after reviewing the studio's policy.
-- delete from public.site_pageviews where occurred_at < now() - interval '90 days';
