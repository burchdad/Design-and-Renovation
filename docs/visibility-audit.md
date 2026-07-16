# Haven Design & Build Visibility Audit

Audit date: 2026-07-15  
Site: https://www.designhavenbuild.com/  
Repository: burchdad/Design-and-Renovation

## Implementation Summary

- Framework: static multi-page HTML/CSS/JS site with Vercel serverless API functions in `/api/`.
- Routing: root `index.html` hash sections plus folder-based public pages for services, areas, comparison, resources, and admin.
- Deployment: Vercel static hosting/API functions; `vercel.json` now defines preferred host redirect and noindex headers for private/utility routes.
- Forms: Formspree endpoint `https://formspree.io/f/xlgvyvkp`.
- Admin/support: `/admin/` is protected by API-backed session login and forwards support tickets to Mission Control through environment variables.

## Critical Findings

- Homepage JSON-LD duplicated the business entity and included `Review` and `AggregateRating` schema without public source URLs. Owner confirmed the visible testimonials are real on 2026-07-15, so they remain visible and are recorded in `data/business-info.json`; review/rating schema remains off until source URLs or stronger provenance are supplied.
- Public payment section displayed unfinished implementation instructions. Replaced with Jobber/Stripe invoice-link guidance and removed checkout-activation placeholder language.
- `config.json` contained placeholder phone, address, Formspree, Stripe, analytics, social, and domain values. Replaced confirmed values and blanked unconfirmed URLs.

## High Impact Findings

- No reusable business-information source existed. Added `data/business-info.json` for confirmed NAP, social profiles, service areas, payment schedule, and owner-confirmation gaps.
- Missing `/areas/` service-area hub. Added a distinct hub that links Marietta, Cobb County, and greater Atlanta pages.
- Missing branded 404. Added `404.html` with noindex and links to services, service areas, quote form, and contact.
- Existing image grid was labeled as featured projects even though repo evidence does not prove those are completed Haven projects. Reframed as service/finish inspiration.
- `robots.txt` did not explicitly exclude `/api/`, `/visibility/`, or unpublished project architecture. Updated.

## Medium Impact Findings

- Service pages have unique titles, descriptions, canonicals, breadcrumbs, FAQ schema, and service schema, but they remain relatively concise. They should be expanded over time with real project examples and owner-approved details.
- Area pages exist for Marietta, Cobb County, and greater Atlanta. No additional city pages should be added until service area is confirmed.
- Resources architecture was missing. Added a resource index and two initial high-intent guides.
- Project case-study architecture is prepared only as a noindex entry point. Real case studies need approved project facts/photos before indexing.

## Optional Findings

- `llms.txt`, GBP action templates, review templates, and backlink templates already support AEO/GEO workflows.
- Larger local ranking improvements require external work: Google Business Profile, citations, reviews, backlinks, Search Console, Bing Webmaster Tools, and real project photos.
- Image files are visually useful but several are large. A later pass should generate responsive WebP/AVIF variants if the hosting/build workflow supports it.

## Business Name Consistency

Primary canonical name should be `Haven Design & Build LLC`. The repo still contains older contextual references to `Design Haven Build` mainly in alt/QR wording and repository/project naming. No evidence found that `Design Haven Build` is the intended public legal brand.

## Owner Confirmation Needed

- Public street address and ZIP, if approved.
- Google Business Profile URL.
- Verified latitude/longitude.
- Business hours.
- Public source URLs for owner-confirmed testimonials if Review schema should be added later.
- License, insurance, warranty, financing, association, and certification details.
- Approved reusable Jobber/Stripe payment URL if one should be displayed publicly.
- Genuine project photos/details for indexed case studies.
