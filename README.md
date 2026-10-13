# Haven Design & Build LLC - Website

High-end, responsive website for Haven Design & Build LLC with a premium black + bronze visual system, local branded imagery, inquiry capture, and Stripe-ready payments.

## Current Site State

- Premium black + bronze theme across all pages
- Hero, featured projects, testimonials, services, inquire, and payments content updated
- Local branded assets in `images/` (logo + service/project imagery)
- Inquire page uses form submission workflow (no booking embed)
- Payments page keeps Stripe placeholder logic intact

## Project Structure

```
/Design-and-Renovation/
├── index.html
├── css/
│   └── styles.css
├── js/
│   └── app.js
├── images/
│   ├── Haven_transparent_logo.png
│   ├── Kitchen_remodel.jpg
│   ├── luxury_bathroom.png
│   ├── basement_finishing.jpg
│   ├── outdoor_living.jpg
│   └── modern_living.jpg
├── config.json
├── START_HERE.md
├── QUICKSTART.md
├── SETUP.md
└── README.md
```

## Quick Start

1. Open `index.html` in a browser.
2. Navigate Home / Services / Inquire / Payments.
3. Test inquiry form submission.
4. Test Stripe button behavior on Payments page.

For fast setup, use `START_HERE.md` and `QUICKSTART.md`.

## Key Integrations

### Inquiry Form (staged Resend review)

Formspree remains the active default, including native non-JavaScript submissions.
The disabled `POST /api/inquiry` replacement stores inquiries in a private,
Haven-only Vercel Blob store before sending a minimal Resend notification.

- Review and release gates: [`docs/resend-inquiry-cutover.md`](docs/resend-inquiry-cutover.md)
- Synthetic notification preview: [`review/inquiry-email.html`](review/inquiry-email.html)
- Offline checks: `npm ci --ignore-scripts`, `npm test`, `npm run check`
- No production routing, account configuration, storage or email tests have been changed.

### Stripe (Placeholder Logic Retained)

Stripe flow remains intentionally placeholder-based in `js/app.js`.

- Keep current button and handler unless implementing backend checkout.
- If moving to production Stripe, wire a real publishable key and server-side payment flow.

## Branding + Content Notes

- Active website logo: `images/Haven_transparent_logo.png`
- Old logo file intentionally removed from active markup
- Service/project imagery now uses local files in `images/`

## Deployment

The current frontend is static; the proposed Resend replacement requires Vercel Node.js functions, an approved private Blob connection and a shared rate limiter. A static-only host cannot run that endpoint.

## Pre-Launch Checklist

- [ ] Complete the staged inquiry cutover checklist before changing the current Formspree action
- [ ] Verify inquiry emails are received
- [ ] Confirm Stripe production flow (or keep as clearly labeled placeholder)
- [ ] Verify mobile navigation and forms on phone
- [ ] Validate all `images/` assets load in production
- [ ] Add analytics and legal pages if required

## Support

- Setup details: `SETUP.md`
- Fast bootstrapping: `START_HERE.md` and `QUICKSTART.md`
