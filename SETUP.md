# Haven Design & Build - Setup & Integration Guide

Welcome to the Haven Design & Build website! This guide will help you customize and set up the integrations needed to get the site fully operational.

## 🚀 Quick Start

1. **Open the website**: Open `index.html` in your browser to see the live site
2. **Mobile responsive**: Test on mobile devices - the site is fully responsive
3. **Navigation**: Click through Home, Services, Inquire, and Payments tabs

## 📧 Email Integration (Inquire Form)

The contact form currently uses **Formspree** (free service). Here's how to set it up:

### Option 1: Formspree (Recommended for beginners)
1. Go to https://formspree.io
2. Sign up for a free account
3. Create a new form endpoint
4. Copy your form ID (it looks like `f/xxxxxxxxxxxxx`)
5. In `js/app.js`, find this line (around line 82):
   ```javascript
   const response = await fetch('https://formspree.io/f/mnqnqvpk', {
   ```
6. Replace `mnqnqvpk` with your form ID
7. Test the form on the Inquire page

### Option 2: EmailJS (Client-side, no backend needed)
1. Go to https://www.emailjs.com
2. Sign up and get your API keys
3. Add this to the `<head>` of `index.html`:
   ```html
   <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/index.min.js"></script>
   ```
4. In `js/app.js`, replace the form submission with EmailJS code
5. Add your email template ID and service keys

### Option 3: Backend Solution (Production)
For production, consider using:
- **SendGrid**: https://sendgrid.com (Email API)
- **Resend**: https://resend.com (Modern email API for developers)
- **AWS SES**: https://aws.amazon.com/ses/ (Cost-effective)

## 💳 Stripe Payment Integration

### Step 1: Create Stripe Account
1. Go to https://dashboard.stripe.com
2. Sign up for a free account
3. Verify your email
4. Complete your account setup

### Step 2: Get Your Keys
1. In your Stripe dashboard, go to "Developers" → "API Keys"
2. Copy your **Publishable Key** (starts with `pk_live_` or `pk_test_`)
3. Keep your **Secret Key** private (for backend only)

### Step 3: Create Payment Product
1. In Stripe dashboard, go to "Products"
2. Click "Add product"
3. Name it "Haven Design Consultation"
4. Add a price (e.g., $500)
5. Copy the **Price ID**

### Step 4: Setup Payment Link (Easiest for now)
1. In Stripe, go to "Payment Links"
2. Create a new payment link with your product
3. Copy the payment link URL
4. In `index.html` (Payments page), update the button to link to your payment link:
   ```html
   <a href="https://buy.stripe.com/YOUR_LINK" class="btn btn-primary">Pay Now</a>
   ```

### Step 5: Full Stripe Integration (Advanced)
When you're ready for cart functionality:
1. Install Stripe.js in your project
2. Use Stripe Elements for custom payment forms
3. Set up a backend endpoint to create payment intents
4. Update `PaymentHandler` class in `js/app.js`

## 📅 Calendly Integration

### Step 1: Create Calendly Account
1. Go to https://calendly.com
2. Sign up for a free account
3. Set up your calendar and availability
4. Create an event type (e.g., "Design Consultation - 30 min")

### Step 2: Get Your Calendar URL
1. On your Calendly dashboard, click "Share"
2. Copy your Calendly URL (e.g., `https://calendly.com/your-username`)

### Step 3: Add to Website
In `index.html`, find the Calendly section and update:
```html
<iframe src="https://calendly.com/your-username" 
        style="width:100%; height:600px; border:none;" 
        frameborder="0"></iframe>
```

### Step 4: Customize Calendly Embed
1. In Calendly dashboard, go to Integrations
2. Click "Embed" and customize appearance
3. Copy the custom embed code if desired
4. Replace the iframe in the HTML

## 🔐 Production Deployment Checklist

Before launching publicly:

- [ ] Set up your email service and test form submissions
- [ ] Configure Stripe with real payment products
- [ ] Add your Calendly calendar link
- [ ] Update all placeholder text and images with real content
- [ ] Add your business logo (replace HAVEN text logo)
- [ ] Add real project photos to Services and Home pages
- [ ] Update copyright year and company details
- [ ] Set up SSL certificate (HTTPS)
- [ ] Test on mobile and desktop
- [ ] Test all forms and payment flows
- [ ] Set up analytics (Google Analytics, Meta Pixel, etc.)
- [ ] Create Privacy Policy and Terms of Service pages
- [ ] SEO optimization (meta tags, structured data)

## 📱 Mobile Optimization

The website is fully responsive with:
- Mobile-first design
- Hamburger menu for navigation on phones/tablets
- Touch-friendly buttons and forms
- Optimized images for all screen sizes
- Fast loading on mobile networks

Test on:
- iPhone (6+, 12, 13, 14)
- Android devices
- iPad and tablets
- Desktop (1920px+)

## 🎨 Customization Guide

### Colors
Update the color scheme in `css/styles.css`:
```css
:root {
    --black: #1a1a1a;
    --bronze: #C4A747;
    --bronze-light: #d4b557;
    --white: #ffffff;
}
```

### Typography
Update fonts in the body CSS rule:
```css
body {
    font-family: 'Your Font Family', sans-serif;
}
```

### Images
Replace placeholder images:
1. Save your images to an `images/` folder
2. Update `<img>` src attributes in `index.html`
3. Or use a service like Unsplash, Pexels for stock photos

## 🔧 Local Development

To test locally:
1. Use Python 3: `python -m http.server 8000`
2. Use Node.js: `npx http-server`
3. Use VS Code: Install "Live Server" extension
4. Open http://localhost:8000 in your browser

## 📊 Analytics Setup

Add Google Analytics (free):
1. Create account at https://analytics.google.com
2. Get your Measurement ID (starts with `G-`)
3. Add this to `<head>` in `index.html`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   <script>
     window.dataLayer = window.dataLayer || [];
     function gtag(){dataLayer.push(arguments);}
     gtag('js', new Date());
     gtag('config', 'G-XXXXXXXXXX');
   </script>
   ```

## 🐛 Troubleshooting

### Form submissions not working
- Check Formspree form ID is correct
- Ensure JavaScript is enabled in browser
- Check browser console for errors (F12)

### Stripe button not working
- Verify Stripe publishable key is correct
- Check that payment link URL is valid
- Ensure SSL/HTTPS in production

### Calendly not loading
- Verify calendar URL is correct
- Check for iframe blocking in browser extensions
- Ensure Calendly account is active

### Mobile menu not working
- Check hamburger icon appears on small screens
- Verify JavaScript file is loaded
- Clear browser cache and reload

## 📞 Support Resources

- Formspree Docs: https://formspree.io/docs
- Stripe Docs: https://stripe.com/docs
- Calendly Help: https://calendly.com/help
- HTML/CSS/JS Guides: https://developer.mozilla.org/

## 🚀 Next Steps

1. **Customize content**: Update all text, images, and company details
2. **Setup email**: Configure your preferred email service
3. **Setup Stripe**: Create payment products and links
4. **Setup Calendly**: Link your calendar
5. **Test everything**: Use the site as a customer would
6. **Deploy**: Upload files to your web host
7. **Monitor**: Track analytics and customer feedback

---

**Happy Building! 🎉**

For questions or feature requests, refer to the developer documentation in this guide.
