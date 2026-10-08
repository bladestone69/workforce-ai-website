# Lockdown Studios — Northstar website redesign specification

**Status:** Working design document; first local implementation slice in progress, not deployed
**Date:** 5 October 2026
**Target:** The existing `workforce-ai-website` project and its established `lockdownstudios.com` deployment
**Reference demo:** `../../outputs/lockdown-research-concepts/northstar.html` (in the shared workspace; not production code)

## 1. Decision and objective

Northstar is the core visual and content direction: dark teal, restrained stars, bright cyan accents, compact structured sections, the real Lockdown Studios logo, and a clear explanation before visual spectacle. The goal is **qualified project enquiries**. Secondary goals are to demonstrate the studio's production ability, help visitors choose a suitable service, and show studio-owned work without confusing it with client services.

The redesign stays in the current repository and eventually replaces the current site's pages on the existing domain. The concept folders remain independent. The first local slice includes the Northstar Home, shared styling, four focused service pages and an off-by-default assistant implementation. This document does **not** authorise deployment, provider purchases, secret changes, or publication of the public AI assistant.

### Audience and the questions the site must answer

1. Business owner/marketing lead: Can you make or improve our website? Roughly what will it cost? How do we enquire?
2. Product/operations lead: Can you build an app or automate a particular workflow? What is the discovery and scope process?
3. Brand, creator, or production partner: Can you build a game, 3D content, or an interactive experience? What proves it?
4. Curious visitor/player: What has the studio actually made, and where can I see it?

Within the first screen, a new visitor should understand the four capabilities: **websites & apps; games & interactive; 3D & animation; AI & automation**. One studio connects them, but the services must remain individually understandable. The AI offering is not the hero product.

### Success measures

- Primary: qualified enquiries by service, and enquiries that receive a successful human reply.
- Supporting: service-route selections, pricing views, project-to-service click-through, call requests, assistant-to-human handoffs, and form delivery success/failure.
- Quality: comprehension in short user tests; no inaccessible or broken paths; acceptable mobile performance.
- Establish a baseline before changing production. Do not claim a conversion lift until post-launch data exists. Do not optimise for raw visits or chat volume alone.

## 2. What exists now (repository audit)

| Area | Existing material | Redesign decision |
|---|---|---|
| Public core | `index.html`, `services.html`, `work.html`, `about.html`, shared `site.css`/`site.js` | Keep routes where practical; rebuild page hierarchy and shared design system. |
| Service groups | Four categories on Home/Services; flip-to-pricing panels on Services | Keep categories and approved pricing; make detail and price access more obvious and keyboard/screen-reader friendly. |
| Website pricing | Starter Improvement R3,000; Website Rescue R6,500; Lead Website R12,500; Care Lite R499/month; Care R1,999/month, all starting points | Retain pending owner reconfirmation. Apps are custom-quoted, not covered by website entry prices. |
| Other pricing | Current Services page lists game and 3D guide ranges; AI is custom | Reconfirm scope, inclusions and commercial validity before publication. AI remains custom-priced. |
| Projects | World War ToonZ, Monster Match, Emoji Match, Digital & 3D Assets, with detail pages | Keep as genuine studio-owned work. Add factual metadata, outcomes only when evidenced, and better next-project/service links. |
| Digital assets | `3d-models.html` links to Reallusion catalogue | Retain as project/collection page; verify every listing and rights before launch. |
| Enquiries | `index.html#contact` form posts to `/api/save-lead`; private Blob then Gmail SMTP notification; call-request mode | Keep server-side delivery architecture, but review failure/retry, privacy, spam defence and production configuration. |
| AI | Current production branch has removed Hume/voice/conversation endpoints. `ai-avatars.html` redirects to Services. Separate v2 contains Aura chat/voice experiments. | Build a new, scoped **website concierge**. Do not reintroduce Hume or copy the v2 proxy/voice code as-is. |
| Legacy | `learning.html`, `videos.html`, `WWT.html`, `MM.html`, `admin.html`, update scripts, old CSS/JS | Inventory traffic and inbound links, then redirect, remove from deployment, or deliberately retain. Do not surface stale pages in navigation. |

The repo has substantial existing uncommitted changes. Implementation must preserve them, create a safe checkpoint/branch strategy, and avoid overwriting unrelated work.

## 3. Positioning and content rules

**One-line definition:** Lockdown Studios designs and builds websites and apps, games and interactive experiences, 3D visuals, and tailored AI tools.

**Proposed homepage headline:** “Make it clear. Make it count.”
**Required explanatory line:** “We design and build websites & apps, games, 3D visuals, and tailored AI tools—from the first idea to a working experience.”

The headline may evolve in testing; the literal explanation may not be dropped. Copy should state the audience, deliverable, expected result, and next step. Avoid generic “innovation” claims, unsupported metrics, vague “end-to-end” promises, fake testimonials, and illustrative art presented as completed client work.

**Calls to action:** One primary action (“Discuss your project”/“Start a project”) and a relevant secondary action (“Find your service”/“See projects”). Service pages use service-specific CTAs. Every project page links to a related service and to another project. The public assistant offers help, not a competing hero CTA.

## 4. Information architecture and page plan

### Primary navigation

`Home` (logo) · `Services` · `Projects` · `About` · `Contact` · persistent `Start a project` CTA. On mobile, all routes remain available in an accessible menu. The assistant launcher is separate from navigation. “Products” is not a competing top-level label: studio-owned products live under Projects; client offerings live under Services.

| Page / route | Role and sections | Primary CTA | Required source material |
|---|---|---|---|
| **Home** `/` | Northstar hero; four service routes; 2–3 selected proof items; short process; concise starting-price context; studio credibility; contact preview; assistant entry | Discuss your project | Final message, approved project thumbnails, price approval, real studio details |
| **Services index** `/services` | Four groups, clear “good fit” descriptions, deliverables, price routes, process, FAQ, contact | Choose a service | Service scope, exclusions, pricing policy |
| **Websites & Apps** `/websites-apps` | Separate website packages from custom web/app work; examples, deliverables, timeline factors, care options, FAQs | Discuss a website / app | Exact package inclusions, exclusions, ownership, hosting/support terms |
| **Games & Interactive** `/games-interactive` | Use cases, prototype-to-production stages, platforms, indicative range if approved, related games | Discuss a game | Supported platforms, service boundaries, confirmed price examples |
| **3D & Animation** `/3d-animation` | Asset/animation types, workflow, formats, licensing/usage considerations, related asset work | Request visual scope | Portfolio images, deliverable formats, rights/licensing policy |
| **AI & Automation** `/ai-automation` | Defined use cases, assistant/avatar offering by enquiry, discovery/integration/security approach, custom-price factors, related public concierge as a *limited* example | Discuss an AI solution | Approved claims, supported channels/providers, support/usage terms |
| **Projects index** `/projects` (or retain `/work` URL with “Projects” label) | Filter or simple sections for games and digital assets; featured cards; no service catalogue or template gallery | Discuss a similar project | Project permissions, current availability, links |
| **Project detail** existing four routes | Brief, studio role, what was built, media, factual results/availability, related service, next project | Discuss similar work | Screenshots/trailers, credit/ownership, verifiable facts |
| **About** `/about` | Plain studio description, who is behind it, location, working principles, process, trust/contact details | Meet/discuss with the studio | Approved bio, team names/photos if wanted, business details |
| **Contact** `/contact` | Dedicated project form; direct email; optional 15-minute call request; response expectations; privacy note | Send enquiry | Operational response-time promise, recipient, privacy text |
| **Privacy** `/privacy` | Plain-language lead and AI-chat data handling; retention/deletion/contact | — | Owner/legal review and final data-flow choices |
| **404** | Helpful route back to Services, Projects and Contact | Find a service | — |

**Routing choice:** Keep existing `/services`, `/work`, `/about` and project URLs working during migration. If `/projects` replaces `/work`, use a permanent redirect and update sitemap/canonicals/internal links. Do not launch empty service detail pages; until their content is ready, the Services index anchors remain the fallback.

**Not in primary navigation:** Learning/video archive, website-template demos, old admin page, AI-avatar redirect, or the separate v2 website. Decide their retention from traffic and content value; no orphaned indexed pages.

### Page templates

- **Service detail:** Outcome-first hero → who it fits → deliverables and boundaries → relevant evidence → how scope/pricing works → process/timing → FAQ → service-specific contact CTA.
- **Project detail:** What it is → media → challenge/goal → studio contribution → concrete features/results → availability/external link → related service/next project. Mark studio-owned versus client work.
- **Contact:** Short form first, direct email as fallback, no account required. Call requests expose phone and suitable time fields.

## 5. Visual and interaction system

- Reuse the **actual supplied Lockdown Studios logo** consistently; create a legible compact version for small navigation if the current banner crop is unsuitable. Do not invent a replacement mark.
- Northstar palette: near-black/navy base, layered teal surfaces, bright cyan for action/wayfinding, and warm neutral text. Use contrast to separate sections. Document exact tokens after visual QA, not by copying the demo's rough values blindly.
- Tighten typography relative to older oversized layouts: strong but finite heading scale, narrower line lengths, readable 16px+ body text, scannable subheads. Cards and media are compact and aligned; project images use consistent aspect ratios/crops.
- Retain the star-field as a subtle atmospheric background. Limit particle count; no essential content depends on motion. Pause/reduce for `prefers-reduced-motion`, touch devices and lower-power devices. Avoid a large decorative hero image or glowing logo orbit.
- Use alternating section tones and occasional light/teal accent bands to avoid monotony. Buttons, links and focus rings have distinct states. Mobile layout is designed, not only stacked.
- Pricing should be immediately discoverable. A flip-card may be kept as progressive disclosure **only** if both faces have accessible controls, keyboard/focus behavior, reduced-motion behavior and a non-JS fallback. A simple disclosure may be preferable after testing.
- Assistant launcher is discreet, labelled, keyboard accessible, dismissible and does not cover the contact CTA or page content on mobile.

## 6. Public AI assistant: product and safety specification

### Job to be done

The site assistant is a **Lockdown Studios concierge**, not a replacement salesperson or a live demonstration of every client AI feature. It can explain the four services, summarise starting website prices accurately, suggest which route fits a visitor's stated goal, link to relevant projects, and direct a visitor to the enquiry form or a human. It must say when a quote or technical feasibility requires human review. No Hume integration and no public “Try the avatar demo” promise.

**Initial release: text-only.** An optional visual character/avatar can be explored after the text experience proves useful; voice is a separate decision requiring provider, consent, accessibility, cost and microphone-policy review. The client AI-avatar offering stays visible on the AI service page and is available by enquiry.

### Experience

Launcher label: “Ask about our services”. First message states scope and that it is an AI assistant. Suggested prompts: “Which website option fits me?”, “Can you make a game prototype?”, “How do I request a quote?” Answers should be concise, cite/link site pages, and always offer a human route. Never auto-open, autoplay audio, ask for a phone number in chat, or represent an estimate as a final quote.

### Knowledge and data

- Curated, versioned first-party knowledge set: service definitions, package inclusions/exclusions, approved pricing, project facts, contact details, availability/response policy and FAQs. Each entry has owner, source URL, approval status, last reviewed date and next review date.
- The assistant must not learn from arbitrary visitor messages, pull unreviewed repository content into prompts, or browse external sites by default.
- Define approved answers for out-of-scope, sensitive or uncertain questions; refuse fabricated guarantees and redirect to the human team.
- Keep model/provider choice behind a server-side adapter. A model, TTS provider or avatar renderer is an implementation choice, not the product definition. Record cost per conversation and budget caps before enabling publicly.
- Do not copy v2 `api/chat.js` into production: it currently has wildcard CORS, passes client body through to the model, and logs a portion of the key. Rebuild under the current project's security conventions, with strict input schema, server-owned instructions/knowledge, output size limits, request timeout, rate limiting, error handling and no credential-derived logging.
- Consider prompt-injection and data-exfiltration tests even with first-party knowledge. The assistant cannot make promises, submit leads, send email or access private systems without an explicit, validated handoff flow.

### Privacy and handoff

Default to no persistent transcript storage until purpose, consent, retention and deletion process are approved. Collect only operationally necessary session/abuse metadata. Display a short disclosure and link to Privacy. Provide “Talk to a person” at all times. If the visitor chooses it, send them to the **existing validated lead form** with optional, user-reviewed context; do not silently copy the conversation or personal details. If the AI service is unavailable, show normal service links and contact route. All assistant activity must be measurable without storing raw conversation text in analytics.

## 7. Content/data model and asset inventory

Static content can remain file-backed at first; a CMS is not justified until edit frequency and ownership require it. Keep one structured source of truth for repeated names, URLs, prices, dates and CTAs to avoid drift between pages and the assistant knowledge set.

| Record | Minimum fields | Owner / rule |
|---|---|---|
| `service` | id, title, plain description, audience/use cases, deliverables, exclusions, process, CTA, related projects, FAQ, review date | Studio owner approves claims; four records |
| `price_option` | service id, label, `from` or range, currency ZAR, unit, inclusions, exclusions, effective/review date, disclaimer | Commercial owner approves; no assistant quote beyond this |
| `project` | slug, title, type, status/availability, studio-owned/client, role, summary, factual features, media, alt text, rights, external links, related service | No fabricated metrics; obtain client permission before publication |
| `asset` | source file, dimensions, crop, caption/alt, licence, credit, optimisation status | Audit existing images; keep originals for editing |
| `lead` | reference, receivedAt, name, email, optional phone/company, service, message, contact preference/time, source, consent version, delivery state | Private storage; retention and access policy required |
| `assistant_knowledge` | id, question/intent, approved answer/facts, destination URL, approval/review dates | Published facts only |
| `assistant_usage` | timestamp bucket, anonymous session key, latency, status, token/cost totals, handoff event | No raw messages in analytics by default |

**Content still needed:** real website/app case study(s) with client permission; screenshots/before-after or a clearly labelled studio sample if no client example is available; verified testimonials/reviews if used; team/studio photos and names if approved; project role/availability for each game; asset catalogue rights and live links; confirmed package inclusions, care-plan limits and response process; FAQ answers; privacy/retention wording. Mark unknown facts as “needs approval,” never fill them with invented copy.

## 8. Technical architecture and non-functional requirements

- **Keep the existing Vercel project/domain.** Prefer an incremental static-first implementation using semantic HTML, shared components/styles and small JS. A framework migration is not a prerequisite; consider it only if content maintenance or multi-page reuse demonstrably warrants one.
- Keep API keys, Gmail app password, Blob token and future model credentials server-side in environment variables. Production and preview separation; protect previews with real credentials. No browser-side secret or public lead Blob URLs.
- Current lead endpoint writes private Blob **before** sending email. If email fails, the lead may already exist while the user sees an error. Plan an idempotent reference, explicit delivery state, retry/alert procedure and operational reconciliation so no enquiry is silently lost or duplicated.
- Add platform-level rate limiting/bot protection to contact and assistant endpoints; the in-memory function limiter is not global. Validate body sizes and schemas; enforce same-origin/CORS policy, output encoding, no-store responses, least privilege and safe logs. Review CSP when the assistant provider is chosen; do not broadly weaken it.
- Define retention/deletion for leads and assistant events, limited operator access, backup/export and incident contact. Remove or block legacy admin/conversation routes after confirming no required data is stranded.
- Performance targets: Google “good” Core Web Vitals at the 75th percentile of mobile visits—LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1. Set image dimensions; use modern compressed formats, lazy-load below-fold media, defer non-critical JS and avoid autoplay hero video. These are targets, not measured claims.
- Accessibility target: WCAG 2.2 AA. Check 4.5:1 normal-text contrast, semantic headings, keyboard navigation, visible focus, meaningful alt text, labelled forms, status announcements, touch targets, reduced motion and assistant dialog focus management.
- SEO: unique descriptive titles/descriptions, canonical URLs, correct redirects, one useful H1 per page, internal links between service/project pages, XML sitemap/robots, useful alt text and truthful local business details/schema only where applicable. Preserve existing ranked URLs where possible.
- Browser/device matrix: current Chrome, Edge, Firefox and Safari; desktop, tablet and narrow mobile; keyboard and screen-reader spot checks. Include no-JS fallback for navigation, content and contact route.
- Analytics: use consent/privacy-conscious measurement. Define event names (`service_select`, `pricing_view`, `project_open`, `contact_start`, `contact_success`, `contact_error`, `call_request`, `assistant_open`, `assistant_handoff`) and exclude message bodies, email, phone, chat text and secret values. Create a simple monthly dashboard by service and lead quality.

## 9. Delivery plan and gates

| Phase | Deliverable | Exit gate |
|---|---|---|
| **0. Discovery and content lock** | Inventory URLs/assets; baseline analytics and Search Console; approve messaging, package terms, project rights and assistant knowledge scope | Missing proof, prices and ownership questions recorded; no invented content |
| **1. Design system and page prototypes** | Northstar tokens/components; responsive Home, Services index, one service detail, one project detail; accessibility states | Owner approves desktop/mobile direction; short comprehension test finds the four services and contact path |
| **2. Core site build** | All public pages, navigation, case-study templates, redirects, metadata/sitemap, real contact/call forms | Link/form/accessibility tests pass; email delivery confirmed in production-like environment |
| **3. AI concierge** | Approved knowledge set, text UI, protected API, handoff, privacy disclosure, cost/abuse monitoring | Red-team and factual tests pass; budgets/retention/provider approved; clear failure fallback |
| **4. Launch** | Staging review, backups, deployment checklist, production smoke test, Search Console submission | Domain/SSL/redirects/CSP/forms/assistant verified; rollback route documented |
| **5. Optimise** | 2–4 weeks of lead-quality review, usability fixes, performance tuning, optional avatar/voice decision | Changes based on measured problems rather than novelty |

**Suggested build order within Phase 2:** shared shell → Home → Services index and four detail pages → Contact → Projects/index and detail pages → About/Privacy/404 → SEO and legacy redirects. Deploy only after cross-page QA, not page by page to production.

### Acceptance tests

1. A new visitor can say what the studio does and choose a relevant service without interpreting studio jargon.
2. The primary contact path works on every page; a submitted project enquiry and call request each reach `Lockdownstudio021@gmail.com`, with a usable reply address and all required details.
3. Website starting prices are accurate and clearly marked “from”; apps and AI are not presented as fixed-price packages.
4. Studio-owned projects and service offerings are visibly distinct; external links and media work; no fake results or testimonials.
5. The assistant answers from approved facts, flags uncertainty, does not expose secrets or personal information, and reliably hands off to a person.
6. Mobile menu, service navigation, pricing disclosure, forms and assistant work by keyboard/touch and under reduced motion.
7. Redirects, canonicals, sitemap, robots, 404, CSP and no-index/private-route decisions are verified on the deployed domain.
8. Core Web Vitals and error rates are measured after launch; failing templates create follow-up work rather than a false “done” claim.

## 10. Decisions and materials needed from the studio

| Decision/input | Recommended default | Needed before |
|---|---|
| Final headline and plain service description | Northstar wording above | Page design lock |
| Domain route for Projects | Keep `/work` for SEO, label “Projects”; consider `/projects` later with redirect | IA implementation |
| Website package scope/prices and care terms | Existing five starting prices pending reconfirmation | Publishing pricing |
| Game/3D guide prices | Audit current published ranges; remove if not commercially defendable | Service pages |
| Website/app proof | Obtain one permissioned case study, or clearly label a studio sample | Launch of full proof section |
| Real team/location/contact information | Approved Johannesburg details and Gmail; do not invent address/phone | About and Contact |
| AI provider, model, usage budget, transcript policy | Text-only, provider-agnostic, no persistent transcripts by default | Assistant development |
| Optional AI avatar/voice | Defer; no Hume | Post-launch decision |
| Lead and chat retention/privacy wording | Owner/legal review based on actual flows | Production launch |
| Response-time promise and enquiry ownership | Assign a person and escalation/backup | Contact launch |

## 11. Evidence behind the design choices

- Nielsen Norman Group's corporate-site usability research supports clear explanations of what a company does, easy-to-find contact details, simple navigation, and authentic proof: https://www.nngroup.com/articles/about-us-information-on-websites/
- Their B2B usability research identifies early pricing context as important during vendor research; it is directional and older, not a predicted conversion rate for this studio: https://www.nngroup.com/articles/b2b-usability/
- Google Search Central recommends unique, descriptive titles and useful, people-first content: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- Google's Core Web Vitals thresholds: https://support.google.com/webmasters/answer/9205520
- W3C WCAG 2.2 is the accessibility benchmark: https://www.w3.org/TR/WCAG22/

The Northstar direction is still a hypothesis until tested with likely customers. A small task-based test should ask people to identify the services, find a price starting point, find credible evidence and complete an enquiry; revise the design where they fail.
