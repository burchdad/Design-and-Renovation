# Haven Design & Build - Setup Guide

This guide reflects the **current implementation** in the repository.

## 1. Local Run

Open `index.html` directly, or serve locally:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

## 2. Inquiry Form Setup (Formspree)

The inquiry form is active and submits via fetch in `js/app.js`.

1. Create a form at `https://formspree.io`.
2. Copy your form ID (`f/xxxxxxx`).
3. In `js/app.js`, replace the existing Formspree endpoint ID.
4. Submit a test inquiry from the Inquire page.

Expected fields sent:

- Full Name
- Email
- Phone
- Zip
- Project Description
- Service Interest
- Timestamp

## 3. Payments Setup (Stripe)

The current Stripe section is intentionally placeholder logic.

- UI and button are production-styled.
- JavaScript currently validates amount and shows integration guidance.

To fully enable Stripe:

1. Create Stripe account and products.
2. Implement secure backend endpoint for Payment Intents / Checkout Session.
3. Replace placeholder code in `PaymentHandler` inside `js/app.js`.

## 4. Images + Branding

The site now uses local assets in `images/`.

Required current assets:

- `images/Haven_transparent_logo.png`
- `images/modern_living.jpg`
- `images/Kitchen_remodel.jpg`
- `images/luxury_bathroom.png`
- `images/basement_finishing.jpg`
- `images/outdoor_living.jpg`

If replacing images:

1. Drop new files in `images/`.
2. Update references in `index.html` and `config.json`.
3. Keep naming consistent and avoid spaces when possible.

## 5. Theme + Typography

Theme and typography are configured in `css/styles.css`.

Current system includes:

- Premium black + bronze palette
- Heading display font (Playfair Display with fallbacks)
- Editorial card/section refinements

## 6. Current Functional Scope

Implemented pages:

- Home
- Services
- Inquire
- Payments

Not present in current UX:

- Calendar booking embed
- External booking flow inside Inquire page

## 7. Deployment

Static deployment options:

- Netlify
- Vercel
- GitHub Pages
- Any static host

Before deploying:

- Verify all image paths
- Verify form submission endpoint
- Smoke test on mobile + desktop

## 8. Troubleshooting

### Form submits fail

- Check Formspree endpoint in `js/app.js`
- Check browser console for network errors

### Images missing

- Confirm file exists in `images/`
- Confirm exact file name and case match

### Payments confusion

- Current Stripe logic is placeholder by design
- Add real backend flow for production charging
