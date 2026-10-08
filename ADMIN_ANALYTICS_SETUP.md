# Private enquiries and site analytics

This release adds `/admin` for studio staff and Vercel Web Analytics for anonymous page-view reporting. The admin page is deliberately absent from public navigation and search indexing, but its URL is not a secret. Authentication, not hiding the URL, protects enquiry data.

## Turn on analytics

1. In the Vercel project, open **Analytics** and enable Web Analytics.
2. Redeploy the preview branch after enabling it. Public pages load `/_vercel/insights/script.js` on Vercel (not on localhost).
3. Visit a few public pages on the preview URL, then check Analytics for page views, popular pages and referrers. Do not submit personal details as analytics events.

This first version reports aggregate page visits and referral sources. It does not record an individual visitor's click-by-click path, and form contents are never sent to analytics.

## Turn on the private admin

1. Verify the project is connected to a **private** Vercel Blob store, and `BLOB_READ_WRITE_TOKEN`, `GMAIL_USER`, and `GMAIL_APP_PASSWORD` are available in the intended environment. The mailbox defaults to `GMAIL_USER`; set `ADMIN_EMAILS` only if other staff should sign in.
2. In Vercel Firewall, add a rate-limit rule for `/api/admin-auth`. Confirm it protects the preview and production environments where admin will be enabled. Keep preview deployments protected if they use live customer data.
3. Set `ADMIN_ENABLED=true` for the intended environment and redeploy. Leave it false or unset elsewhere. This flag is server-side only.
4. Open `/admin`, request a code at an allowed mailbox, and sign in. The code lasts ten minutes; the session lasts eight hours. Check that project enquiries, call requests and testing-pool signups appear.
5. In a private/incognito window, verify `/api/admin-leads` returns 401 after admin is enabled. Test a disallowed mailbox, incorrect code and sign-out. Never forward sign-in codes.

The dashboard lists the latest 60 saved enquiry records from private storage. Search filters only those visible records; it is not a full archive search. Analytics is viewed in Vercel's own dashboard, with separate Vercel team permissions.

The private store also contains admin sign-in challenges and sessions. Expired records are rejected, but storage is not automatically purged. Include `admin/challenges/` and `admin/sessions/` in the periodic private-storage review described in `SECURITY_DEPLOYMENT.md`.
