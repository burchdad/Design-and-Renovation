# Start Here - Haven Design & Build

Use this file for the fastest way to verify and launch the current site.

## 1. Verify Current Build (5-10 min)

1. Open `index.html`.
2. Confirm pages render:
   - Home
   - Services
   - Inquire
   - Payments
3. Confirm logo and local images load from `images/`.

## 2. Wire Inquiry Form (10 min)

1. Create Formspree form.
2. Replace form ID in `js/app.js`.
3. Submit test inquiry from Inquire page.

## 3. Validate Payment Experience (5 min)

1. Open Payments page.
2. Enter amount and click Stripe button.
3. Confirm expected placeholder behavior.

If you want live charging, implement backend Stripe flow later.

## 4. Branding Assets Already in Place

Current active files:

- `images/Haven_transparent_logo.png`
- `images/modern_living.jpg`
- `images/Kitchen_remodel.jpg`
- `images/luxury_bathroom.png`
- `images/basement_finishing.jpg`
- `images/outdoor_living.jpg`

## 5. Deploy

Deploy as static site to Netlify/Vercel/GitHub Pages.

## 6. Final Pre-Launch Checks

- [ ] Inquiry form submits successfully
- [ ] Mobile nav and buttons work
- [ ] All local images render on production URL
- [ ] Payment messaging is clear to clients
