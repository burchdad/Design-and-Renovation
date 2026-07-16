# Admin Access Security

Updated: 2026-07-15

## Final Admin Route

- Route: `/admin/`
- Public footer label: `Owner Login`
- Footer placement: bottom-most footer utility row, visually understated, `rel="nofollow"`.
- Main navigation, mobile menu, hero sections, QR links, sitemap, public schema, resources, service pages, and area pages do not promote the admin route.

## Authentication Method

- The owner login uses a server-side password hash check in `api/admin-login.js`.
- The password hash is read from `HAVEN_ADMIN_PASSWORD_HASH` or `ADMIN_PASSWORD_HASH` when supplied, with the existing fallback hash retained for continuity.
- Login errors use generic wording: `Unable to sign in with those credentials.`
- Login attempts are rate-limited in memory per client IP window.

## Session Protection

- Successful login creates a signed server-side session token.
- Session cookie: `haven_admin_session`
- Cookie protections: `HttpOnly`, `SameSite=Lax`, eight-hour expiration, and `Secure` in Vercel production.
- Session validation happens server-side in `isAdminRequest()`.

## Protected Requests

- Admin-origin support requests must include a valid admin session.
- Unauthenticated requests with `source: "admin"` are rejected by `api/support-ticket.js`.
- Public website-helper requests remain available as public support/inquiry routing and are sanitized separately.
- Submitted text is trimmed and length-limited before forwarding.

## Image Upload Protections

- This repository currently has no public image upload, deletion, or replacement API.
- Because no upload endpoint exists, arbitrary file upload, image deletion, image replacement, file type validation, file size validation, and path traversal protections are not applicable yet.
- If an image editor/upload feature is added later, it must require server-side authentication, file type validation, file size limits, fixed storage paths, filename normalization, and path traversal prevention before deployment.

## Noindex Implementation

- `admin/index.html` includes:
  - `<meta name="robots" content="noindex, nofollow, noarchive, nosnippet">`
- API JSON responses set:
  - `X-Robots-Tag: noindex, nofollow, noarchive, nosnippet`
- `vercel.json` sets strong `X-Robots-Tag` headers for `/admin/`, `/api/`, `/visibility/`, and the noindex project placeholder.

## Sitemap Exclusion

- `sitemap.xml` does not include `/admin/`, API routes, support routes, or authenticated editor routes.
- The only public reference is the nofollow `Owner Login` footer utility link.

## Validation Results

- `scripts/validate-admin-access.js` checks owner-login footer placement, nofollow, sitemap exclusion, JSON-LD exclusion, admin noindex, generic login errors, and admin write authentication checks.
- Local unauthenticated admin-origin write request expectation: `POST /api/support-ticket` with `source: "admin"` returns `401`.

## Remaining Owner Setup

- Keep the production admin password hash in Vercel environment variables.
- Rotate the owner password if it has been shared broadly.
- Add a proper password reset flow only if email delivery and token expiration are implemented server-side.
- Public source URLs for testimonials are still needed before adding Review or AggregateRating schema.

## Deployment Fields To Fill After Push

- Deployment commit SHA:
- Vercel deployment URL:
- Production deployment status:
