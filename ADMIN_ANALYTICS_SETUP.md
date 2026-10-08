# Private enquiries and site analytics

This release adds `/admin` for studio staff. The admin page is deliberately absent from public navigation and search indexing, but its URL is not a secret. Authentication, not hiding the URL, protects enquiry data. Vercel Web Analytics is not used.

## Connect Supabase visits

1. In the new Supabase project, open **SQL Editor** and run `supabase/site_analytics.sql`. It creates a private page-view table and a report function. No public or authenticated browser role has table access.
2. In **Project Settings / API Keys**, create or copy a new `sb_secret_...` key. Put it in Vercel as `SUPABASE_SECRET_KEY` for the intended environment. Never put this key in browser code, Git, email or chat. Set `SUPABASE_URL` to the project's `https://...supabase.co` URL.
3. Add a Vercel Firewall rate-limit rule for `/api/track-page` to protect database writes. The code also has an in-memory limiter, but that is not a distributed protection.
4. Set `SITE_ANALYTICS_ENABLED=true` in Vercel and redeploy. Until this flag and both Supabase variables are set, tracking does not write visits and the admin reports setup pending.
5. Visit several public pages on the deployed site. Sign in at `/admin`; the 30-day report should show page views, popular pages, external referrer domains and common on-site routes. No visitor ID, IP, form data, query strings or full external URLs are saved in the visit table.
6. Enable **Cron** in Supabase, then run `supabase/site_analytics_retention.sql` and confirm its daily job appears. Assign a monthly owner to inspect job history. Until the job is confirmed, leave tracking disabled. The commented delete in the schema alone does not remove records.

The counts are page loads, not unique people. Ad blockers, disabled JavaScript, Do Not Track, bots and network failures can affect counts. Enquiry records and Gmail notifications remain in their current working flow and do not depend on Supabase.

## Turn on the private admin

1. Verify the project is connected to a **private** Vercel Blob store, and `BLOB_READ_WRITE_TOKEN`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD` are available in the intended environment. The mailbox defaults to `GMAIL_USER`; set `ADMIN_EMAILS` only if other staff should sign in.
2. In Vercel Firewall, add a rate-limit rule for `/api/admin-auth`. Confirm it protects the preview and production environments where admin will be enabled. Keep preview deployments protected if they use live customer data.
3. Set `ADMIN_ENABLED=true` for the intended environment and redeploy. Leave it false or unset elsewhere. This flag is server-side only.
4. Open `/admin`, request a code at an allowed mailbox, and sign in. The code lasts ten minutes; the session lasts eight hours. Check that project enquiries, call requests and testing-pool signups appear.
5. In a private/incognito window, verify `/api/admin-leads` returns 401 after admin is enabled. Test a disallowed mailbox, incorrect code and sign-out. Never forward sign-in codes.

The dashboard lists the latest 60 saved enquiry records from private storage. Search filters only those visible records; it is not a full archive search. The visit report is displayed on the same private page after studio authentication.

The private store also contains admin sign-in challenges and sessions. Expired records are rejected, but storage is not automatically purged. Include `admin/challenges/` and `admin/sessions/` in the periodic private-storage review described in `SECURITY_DEPLOYMENT.md`.
