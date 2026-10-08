# Page-by-page review checklist

Review updated: 7 October 2026. Status means **observed in the local static preview** unless noted. This checklist is for review and sign-off, not automatic approval. We will work through one page at a time and keep the content that is already sound.

## Review sequence

| Page | Status |
| --- | --- |
| Home | Visual and copy approved; live verification pending |
| Services hub | Visual and copy approved; live verification pending |
| 01 / Websites | Local audit complete; fixes and approval pending |
| 02 / Apps & digital tools | Local audit complete; fixes and approval pending |
| 03 / Games & Interactive | Local audit complete; fixes and approval pending |
| 04 / 3D & Animation | Local audit complete; fixes and approval pending |
| 05 / AI & Automation | Local audit complete; fixes and approval pending |
| Projects catalogue | Full local review complete; fixes and approval pending |
| World War ToonZ, Monster Match, Emoji Match | Local first-pass audit complete; content/store confirmation pending |
| Drift Protocol | Local first-pass audit complete; live feedback test pending |
| Digital & 3D asset collection | Local first-pass audit complete; fixes and marketplace confirmation pending |
| About | Local review and fixes complete; approval pending |
| Contact (Home section) | Local layout and form flow checked; live delivery pending |
| Privacy and utility pages | Notice updated for guided Luna and 12-month review; production and legal sign-off pending |

The three fictional before/after examples need their own concept-demo review. Admin is an internal page, not part of the public visual sign-off.

## Home — detailed review

### Correct / working

- [x] The hero identifies the studio and names websites/apps, games, 3D and AI in one sentence. The main CTA reaches Contact; the secondary CTA reaches Services.
- [x] Five service cards each have a distinct outcome and link to a local detail page. Local Home links and image paths exist.
- [x] Featured work is explicitly labelled studio-owned and routes to the relevant project/asset page.
- [x] The process has four clear stages and the website price band says prices are starting points, not fixed quotes.
- [x] At 1440px, the narrower content width is comfortable; the contact panel fits within a 900px-high desktop viewport.
- [x] At 390px, the page has no horizontal overflow. Service cards stack and the primary CTA remains visible.
- [x] The mobile menu and Projects shortcuts open with their expected links.
- [x] Home has one H1, labelled form controls, a skip link, meaningful image alt text and reduced-motion handling for the constellation.
- [x] The two Home project images loaded in the preview; no browser console errors or warnings were observed.
- [x] The dedicated `?enquiry=call` route preselects Phone call, requires a phone number and changes the form wording.

### Local fixes completed

- [x] **P1 — Message count:** Home, Services and the constellation now describe five distinct routes.
- [x] **P1 — Phone contact:** Phone call and WhatsApp reveal a required phone field with an explicit label; the lead API enforces the same rule.
- [x] **P1 — Mobile Luna placement:** Ask Luna is a 44px header control on mobile, clear of cards and form. Checked at 390px and 320px.
- [x] **P2 — Mobile form length:** Required fields stay visible while optional company/time fields are collapsed. Contact is about 728px at 390px and 800px at 320px, with no horizontal overflow.
- [x] **P2 — Privacy route:** Privacy is linked beside the form note and in the Home footer.
- [x] **P2 — Artwork consistency:** Home uses the same render/wireframe 3D artwork direction as Projects and the asset page.
- [x] **P2 — Price context:** Home points to Games and 3D guide prices and explains Apps/AI custom quotes.
- [x] **P2 — Search/social presentation:** Home declares the existing www domain as canonical, plus social metadata, a 1200×630 preview image and favicon. Verify social cards after deployment.

### Requires live verification, not a local pass

- [ ] **P1 — Enquiry delivery:** The static preview cannot run `/api/save-lead`. Validate a real submission on the configured deployment and confirm private Blob storage plus Gmail notification to the studio. Do not claim email delivery from the local preview.
- [ ] **P1 — Failure handling:** Test the production form's validation, 503/error message and saved-but-email-failed state without creating duplicate leads. Confirm the studio has an operational way to find privately stored leads if email fails.
- [ ] **P2 — Performance/accessibility lab:** Run a production Lighthouse or equivalent mobile check, keyboard-only pass, screen-reader spot check, and real-device check. Visual/no-overflow checks alone are not a full accessibility or speed audit.
- [ ] **P2 — Content claims:** Confirm public statements such as the Steam publication and project descriptions against the current product pages before release.

### Approval

- [x] Home visual direction approved by Marcel on 6 October 2026.
- [x] Home copy approved by Marcel on 6 October 2026.
- [ ] Home functionality signed off after the P1 fixes and live email test.

## Services hub — detailed review

### Correct / working locally

- [x] The hero and five cards agree with Home's five-route message. Each card gives an outcome, a suitable use case, a price guide or custom-quote explanation, a detail link and an enquiry link.
- [x] Website, Games and 3D starting prices match their detail pages; Apps and AI are consistently quoted by scope. The disclaimer distinguishes guide prices from final proposals.
- [x] The five detail-page files exist. The general CTA preselects Other, and a tested AI enquiry preselects Automation or AI solution on Home's contact form.
- [x] The page has one H1, a skip link and a clear heading hierarchy. At 390px the cards stack without horizontal overflow; the final CTA remains readable and touch-sized.
- [x] The Home design language carries through in the star background, dark translucent sections, coloured card accents, type, buttons and compact CTA/footer.

### Needs work before Services approval

- [x] **P1 — Tablet Luna overlap:** Launcher moves into the header through 900px. At 877px it clears cards and the menu; the panel fits below the header, receives focus, and Escape returns focus to the launcher.
- [x] **P1 — Service-card hierarchy:** Cards now use Home's balanced 2+3 desktop arrangement. AI has the same width as Games and 3D; narrower layouts use two columns, then one.
- [x] **P2 — App enquiry choice:** The Apps link preselects a neutral “App or digital tool” form choice; visitors can still choose Web app or Mobile app directly.
- [x] **P2 — Privacy/footer consistency:** Services footer now links to Privacy information.
- [x] **P2 — Search/social consistency:** Services now has its own canonical URL, title/description for social cards, shared preview asset and favicon. Verify social cards after deployment.

### Requires live verification

- [ ] Enquiry delivery still needs a production submission and Gmail/private-storage check; local CTA routing is not proof of delivery.
- [ ] Production mobile performance, keyboard-only navigation, screen-reader spot check and real-device review remain open.

### Approval

- [x] Services visual direction approved by Marcel on 6 October 2026.
- [x] Services copy and pricing summary approved by Marcel on 6 October 2026.
- [ ] Services functionality signed off after fixes and live enquiry verification.

## Projects catalogue — detailed review

### Correct / working locally

- [x] The hero now uses the same single-column scale and structure as Services, without a featured project panel beside it. Drift Protocol remains linked in Prototypes.
- [x] The catalogue separates released games, prototypes/work in progress, fictional website demos, and digital assets. Each section has a matching category jump and relevant detail/service links.
- [x] The fictional website examples are explicitly identified as demonstrations, not client results. The render/wireframe visual is labelled illustrative, not an existing marketplace pack.
- [x] At 1440px and 390px the hero and catalogue have no horizontal overflow. Game images and the asset visual render; the page has one H1 and a skip link.
- [x] At 768px and 320px the page remains readable without element overflow. Mobile Projects shortcuts open and close correctly; category jumps reach the right section and keep it below the sticky header.
- [x] Every local Projects link and hash target resolves. The World War ToonZ Steam listing confirms the published-game claim and Lockdown Studios publisher credit.

### Section-by-section decision

| Area | Review result | Remaining action |
| --- | --- | --- |
| Hero and navigation | Matches Services; removing the side feature makes the page easier to scan. | Hero direction accepted; retain Projects in global navigation. |
| Studio games | Strong artwork, titles and consistent routes to three game pages. | Confirm Monster Match and Emoji Match public status/wording with the studio during their detail-page reviews. |
| Prototypes / WIP | Drift is clearly playable and links to its own page; PopItUp is correctly only listed with stronger artwork contrast. | Keep PopItUp non-clickable until there is a detail page. |
| Before/after demos | Fictional status is disclosed; hospitality, trades and professional cards have distinct previews and copy. | Review each demo page separately. |
| Digital / 3D assets | The render/wireframe image is a compact 420px desktop / 320px mobile card, with separate catalogue/custom-service routes. | Confirm current marketplace availability during the asset-page review; the illustration is not itself a product. |
| Closing routes | Service link, project CTA and shared Privacy footer link are present. | Review final wording with the studio. |

### Needs work before Projects approval

- [x] **P1 — Category-link touch targets:** All jump links measure at least 44px high at 390px and wrap into two compact rows; focus-visible has a distinct background.
- [x] **P2 — Shared footer/head:** Projects now has Privacy, canonical URL, social preview metadata and favicon. Verify the social card after deployment.
- [x] **P2 — Demo-card differentiation:** Three industry-specific photographic previews and concise distinct copy retain the fictional-demo labels.
- [x] **P2 — Prototype contrast:** PopItUp artwork has a stronger dark treatment and readable white title at desktop and mobile sizes.
- [x] **P2 — Category destination clarity:** AI services is separated from in-page jumps by a rule on desktop and its own row on mobile, with an accessible destination label.
- [x] **P2 — Digital & 3D card size:** The image no longer inherits its oversized source height; it uses a 16:9 preview at 420px desktop / 320px mobile.

### Requires separate review

- [ ] Review each game/project detail page, the three interactive demo pages, and the asset collection individually; catalogue routing is not approval of their content or behaviour.
- [ ] Confirm Monster Match and Emoji Match status and Reallusion asset availability before launch. World War ToonZ's Steam listing was verified on 6 October 2026.

### Approval

- [x] Projects hero direction accepted by Marcel on 6 October 2026.
- [ ] Projects visual direction approved by Marcel.
- [ ] Projects copy and catalogue organisation approved by Marcel.
- [ ] Projects functionality signed off after remaining fixes and destination-page reviews.

## About — detailed review

- [x] Hero uses the shared visual scale and names the five service routes without giving AI special prominence.
- [x] The process remains clear. Repeated principle cards were replaced by links to three studio-owned projects, explicitly distinguished from client work.
- [x] Shared canonical/social/favicons and Privacy footer link are present.
- [x] Checked desktop and mobile layouts with no horizontal overflow; proof cards remain readable and keyboard-focusable.
- [ ] Marcel to approve the revised About copy and project selection.
- [ ] Verify the social preview after deployment.

## Contact — detailed review

- [x] About and navigation CTAs reach the Home contact section below the sticky header.
- [x] Standard Contact fits in about 728px at 390px. Required fields, privacy link and direct email remain visible without horizontal overflow.
- [x] Phone and WhatsApp selections reveal a required phone field; call-request mode uses the correct heading, required phone and suitable-time option.
- [x] The client disables a second submission when a lead was stored but its email notification failed, keeping the reference visible for manual follow-up.
- [ ] On Vercel, submit a real enquiry and call request, then verify private Blob storage and receipt at Lockdownstudio021@gmail.com. The static preview cannot prove delivery.
- [ ] Test production error and saved-but-email-failed recovery paths, keyboard-only flow and real-device behaviour before final launch approval.

## Secondary screens — first-pass audit (7 October 2026)

This is a local layout, navigation, content and interaction audit, not approval of service claims, prices or deployed integrations. At 390px and 1440px, the five service pages and five main project-detail pages each have one H1 and no horizontal document overflow. Lazy-loaded game art exists locally; it was not a missing-file error.

### Shared findings

- [x] **P2 — Shared page head/footer:** The five service detail pages, game detail pages and 3D asset collection now carry the approved canonical/social/favicons and Privacy footer pattern. Verify social cards after deployment.
- [x] **P2 — URL consistency:** Canonicals and sitemap now use the clean URL form supported by Vercel `cleanUrls`.
- [ ] **P1 — Deployed forms:** Test the mobile testing signup and Drift feedback against the live private storage/email configuration. Local static interaction checks cannot prove delivery.

### 01 / Websites

- [x] Clear improvement/new-site/care positioning, guide prices and three explicitly fictional before/after examples. Each example switches versions at 390px without page overflow.
- [x] **P1 — Mobile menu:** The shared `data-nav-links` hook is present; recheck on a real mobile device.
- [ ] **P2 — Shared head/footer** as above. Review the example cards and pricing copy with the studio before approval.

### 02 / Apps & digital tools

- [x] The distinction from a brochure website is clear. The dashboard is labelled a concept, not a client product; custom pricing is correctly explained.
- [x] **P2 — Enquiry preselection:** Page CTAs use the neutral “App or digital tool” form value.
- [ ] **P2 — Shared head/footer** as above. Add real app proof only when a releasable example exists.

### 03 / Games & Interactive

- [x] The Drift prototype starts locally; game cards, work in progress, tester interest and guide pricing have clear separate roles.
- [x] **P1 — Game/store status:** Removed Monster Match's unverified Google Play CTA and release claim; public availability and final status still need studio confirmation.
- [ ] **P1 — Testing signup:** Confirm live storage, notification and consent handling before inviting players.
- [ ] **P2 — Shared head/footer** as above; verify embedded trailers on the deployed site.

### 04 / 3D & Animation

- [x] Scope, guide prices and custom-work CTA are present; the artwork file loads.
- [x] **P2 — Oversized hero:** The image now uses the shared aspect-ratio container without inheriting its source pixel height; verify visually at desktop and mobile sizes.
- [ ] **P2 — Shared head/footer** as above. Confirm pricing assumptions and asset examples with the studio.

### 05 / AI & Automation

- [x] Luna enters guided mode locally, and the page distinguishes website guidance from custom AI work and human quoting. Pricing stays custom by scope.
- [ ] **P1 — Live AI configuration:** Check the deployed assistant mode, failure state and privacy disclosure before claiming live AI replies.
- [ ] **P2 — Shared head/footer** as above.

### Projects, demos and utility pages

- [x] World War ToonZ, Monster Match, Emoji Match and Drift Protocol detail pages render without horizontal overflow at 390px/1440px. World War ToonZ's Steam listing confirms the title and Lockdown Studios publisher; Drift's one-level prototype starts and its target date is labelled a target, not a guaranteed release.
- [x] The three fictional industry demos disclose their status, use `noindex`, and their Before/After controls update the shown version and pressed state at 390px.
- [x] **P1 — 3D asset enquiry:** Asset CTAs use the existing `3D or animation` form value.
- [x] **P1 — Privacy publication:** The notice now describes guided-only Luna, public contact routes and a 12-month manual retention process. Studio owner must assign and perform reviews; legal sign-off is still prudent.
- [x] **P1 — Retired public files:** `learning.html` and the three saved YouTube HTML snapshots are excluded from Vercel deployment without deleting local originals.
- [ ] **P2 — Marketplace links:** Confirm all six Reallusion pack listings, ownership and availability with the studio before describing them as current catalogue items.
- [x] **P2 — Supplied visual previews:** Added on-site render galleries for five actual asset packs using the supplied studio folders, plus archive screenshot galleries on World War ToonZ and Emoji Match. The UFO listing remains without a local preview because no matching image was supplied. Marketplace availability still needs confirmation.
- [ ] **P2 — Drift feedback:** Verify live private submission/error behaviour and keyboard controls before release. The 404 page has a single clear heading and `noindex`; confirm the deployed 404 route behaves the same way.
