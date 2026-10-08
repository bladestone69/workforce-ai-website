# Private enquiries and site analytics

This release adds `/admin` for studio staff. The admin page is deliberately absent from public navigation and search indexing, but its URL is not a secret. Authentication, not hiding the URL, protects enquiry data. Visit analytics is not active yet; Vercel Web Analytics has been removed from the site.

## Visit analytics decision

Use a free, privacy-focused provider such as Cloudflare Web Analytics if its current limits suit the studio. It can report page views, popular pages and referrers without using Vercel's paid analytics product. A Cloudflare account and site-specific beacon token are needed before adding its script. Keep the beacon token public but never put a Cloudflare API token in browser code. An embedded report inside `/admin` would additionally need a narrow, server-side read-only API token and a verified supported analytics query. Do not claim individual visitor journeys from aggregate analytics.

The admin currently shows an honest setup-pending state for visits. Enquiry records do not depend on analytics.

## Turn on the private admin

1. Verify the project is connected to a **private** Vercel Blob store, and `BLOB_READ_WRITE_TOKEN`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD` are available in the intended environment. The mailbox defaults to `GMAIL_USER`; set `ADMIN_EMAILS` only if other staff should sign in.
2. In Vercel Firewall, add a rate-limit rule for `/api/admin-auth`. Confirm it protects the preview and production environments where admin will be enabled. Keep preview deployments protected if they use live customer data.
3. Set `ADMIN_ENABLED=true` for the intended environment and redeploy. Leave it false or unset elsewhere. This flag is server-side only.
4. Open `/admin`, request a code at an allowed mailbox, and sign in. The code lasts ten minutes; the session lasts eight hours. Check that project enquiries, call requests and testing-pool signups appear.
5. In a private/incognito window, verify `/api/admin-leads` returns 401 after admin is enabled. Test a disallowed mailbox, incorrect code and sign-out. Never forward sign-in codes.

The dashboard lists the latest 60 saved enquiry records from private storage. Search filters only those visible records; it is not a full archive search. Analytics is viewed in Vercel's own dashboard, with separate Vercel team permissions.

The private store also contains admin sign-in challenges and sessions. Expired records are rejected, but storage is not automatically purged. Include `admin/challenges/` and `admin/sessions/` in the periodic private-storage review described in `SECURITY_DEPLOYMENT.md`.
