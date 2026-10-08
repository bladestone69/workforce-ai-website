# Release readiness — 5 October 2026

This is a local implementation checkpoint, not evidence that the production deployment is ready. Do not publish solely because local static pages load.

## Completed locally

- The Services index is a concise four-route guide instead of repeating the detailed service pages in flip cards.
- The homepage and service hero artwork take less vertical space at tablet and phone widths.
- The enquiry API now distinguishes storage failure from notification failure. If a lead is saved but Gmail fails, the visitor receives a reference and is asked to email the studio instead of resubmitting.
- `npm test`, `npm run check`, and local HTTP checks for the main pages pass.
- The optional AI assistant remains disabled by default.

## Required before production release

1. **Approve commercial copy:** confirm all website, game and 3D starting prices, package boundaries, care-plan terms, third-party costs and any statements about deliverables.
2. **Set up and test lead delivery:** verify private Vercel Blob and the Gmail App Password variables in the intended production project. Send a project enquiry and call request, verify both arrive at `Lockdownstudio021@gmail.com`, and confirm the saved lead is private. Test a notification failure and the reference-number fallback.
3. **Review privacy and security:** finalise the retention period and privacy notice; protect previews using real credentials; add a platform rate limit for `/api/save-lead`; check function logs and redirects. Use `SECURITY_DEPLOYMENT.md` for the full checklist.
4. **Review every page on actual devices:** at least one narrow phone, tablet and desktop. Check navigation, text contrast, keyboard focus, form validation, images, layout overflow, and reduced-motion behavior.
5. **Approve public proof:** only publish a website case study, testimonial, team detail, or result once its owner has approved the facts and media. The service illustrations are labelled as illustrations, not client work.
6. **Keep the assistant off for this release** unless provider/model, budget, distributed rate limit, privacy wording, answer tests and human handoff are approved and tested in the deployed environment.

## Post-release, not a launch blocker

- Obtain a permissioned website case study and add it to Projects and Websites & Apps.
- Establish enquiry and service-selection measurement before claiming a conversion improvement.
- Consolidate the older `site.css` rules and Northstar overlay once the final page designs are signed off.
- Audit legacy pages and external project links against actual traffic and availability.
