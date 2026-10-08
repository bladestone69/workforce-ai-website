# Security deployment checklist

The public site contains no browser-side service credentials and no voice or conversation-storage endpoints. Complete these steps before promoting the Phase 1 deployment.

Luna provides clearly labelled, deterministic guided site answers in static previews and at launch. **Live AI remains disabled by default.** Do not set `ASSISTANT_ENABLED=true` until its provider/model, budget, platform-wide rate limit, privacy wording, knowledge answers and human handoff have been reviewed. `XAI_CHAT_API_KEY` and `XAI_CHAT_MODEL` are server-side variables only. The assistant does not use Hume, microphone access or persistent transcripts. The public Privacy notice describes guided mode; update it before live AI is enabled.

## Required environment variables

Configure these as encrypted variables for Production and, where appropriate, trusted Preview deployments:

- `ALLOWED_ORIGINS` — comma-separated additional origins, if required. The production domains are already allowed by code.
- `BLOB_READ_WRITE_TOKEN` — provisioned by connecting a **private** Vercel Blob store.
- `GMAIL_USER` — the Gmail account used to send website notifications: `Lockdownstudio021@gmail.com`.
- `GMAIL_APP_PASSWORD` — a dedicated 16-character Google App Password; never use the normal Gmail password.
- `CONTACT_TO_EMAIL` — set to `Lockdownstudio021@gmail.com`.

Never prefix a secret with `NEXT_PUBLIC_` and never commit a populated `.env` file.

## Private lead storage

1. Create a new Vercel Blob store with access set to **Private**.
2. Connect it to the production project so Vercel provisions `BLOB_READ_WRITE_TOKEN`.
3. Do not reuse the existing public store for new enquiries.
4. Audit the old public store for leads or other personal information. Remove public access or delete sensitive objects according to the agreed retention policy.

The lead endpoint returns only an opaque reference. It never returns a Blob URL.

## Retention and requests

The public Privacy notice commits the studio to reviewing enquiries, testing-pool records and identifiable game feedback at least every 12 months, with a normal maximum of 12 months after last relevant activity. This is a **studio process, not an automatic expiry feature**. Assign an owner to maintain a dated review log. At each review, check both `leads/` and `game-feedback/` in the private Blob store, the corresponding Gmail notifications, and any follow-up copies; delete records no longer needed. Document any legal or active-project exception and its next review date. Handle access, correction, deletion and playtest withdrawal emails sent to the studio address; verify identity before releasing a record. Do not claim automatic deletion until an audited cleanup mechanism is deployed.

## Enquiry email delivery

1. Enable 2-Step Verification on the studio Google account.
2. Create a dedicated Google App Password named `Lockdown Website`.
3. Add `GMAIL_USER`, `GMAIL_APP_PASSWORD`, and `CONTACT_TO_EMAIL` to the Vercel project as server-side variables.
4. Mark `GMAIL_APP_PASSWORD` as sensitive for Production and Preview.
5. Never expose the App Password in browser code, commit it, or prefix it with `NEXT_PUBLIC_`.

## Platform controls

- Add a Vercel Firewall rate-limit rule for `/api/save-lead`. The in-function limiter is defense in depth and is not a globally consistent distributed limiter.
- Add a Vercel Firewall rate-limit rule for `/api/assistant-chat` before enabling it; confirm a spend/usage alert with the provider.
- Keep preview deployments protected when they use real storage credentials.
- Confirm deployment protection and access logs are enabled for the team.
- Review Function logs after release; responses intentionally avoid logging lead content.

## Release verification

- Confirm `/admin` and `/admin.html` redirect to `/`.
- Confirm removed voice and conversation endpoints return 404.
- Confirm cross-origin POST requests to `/api/save-lead` return 403.
- Confirm malformed payloads return 400/413/415 without stack traces.
- Confirm the homepage, product page, and services page have no JavaScript or console errors.
- Confirm new enquiries appear only in the private Blob store.
- Submit one project enquiry and one call request, then confirm both arrive at `Lockdownstudio021@gmail.com` with the visitor's reply address and all form details.
- Confirm the production Content Security Policy does not allow unused external APIs or microphone access.
- Confirm `/api/assistant-status` reports disabled until intentional launch. Once enabled, verify factual answer tests, prompt-injection tests, unconfigured/error fallback, and that no chat text or credentials appear in logs.
- Assign the retention-review owner and calendar reminder before accepting real submissions; include both Blob and Gmail copies.
