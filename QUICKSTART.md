# 🚀 Quick Start Guide - Haven Design & Build Website

**Welcome Micah!** Here's everything you need to get started with your new website.

## 📋 What You Have

A complete, professional website featuring:
- ✅ Responsive design (works on all devices)
- ✅ 4 main sections: Home, Services, Inquire, Payments
- ✅ Contact form with email notifications
- ✅ Online payment integration (Stripe)
- ✅ Consultation booking (Calendly)
- ✅ Black & bronze luxury color scheme
- ✅ Gallery of services with descriptions
- ✅ Testimonials section
- ✅ Mobile hamburger menu

## 🎯 First Steps (Do These Now)

### 1. View Your Website
Open `index.html` in your web browser to see it live. Click through all the pages to familiarize yourself.

### 2. Update Company Info
Edit these files with your information:
- Change email address (currently placeholder)
- Update phone number
- Add your address
- Update copyright year if needed

### 3. Choose Your Email Service
Decide how inquiries will reach you:
- **Easiest**: Formspree (https://formspree.io) - Free for 50/month
- **Alternative**: EmailJS (https://www.emailjs.com)
- **Production**: SendGrid, Resend, AWS SES

Follow instructions in [SETUP.md](SETUP.md) for your choice.

### 4. Setup Stripe Payments
- Create account at https://stripe.com
- Create a payment link
- Add the link to the Payments page
- See [SETUP.md](SETUP.md) for details

### 5. Setup Calendly Calendar
- Create account at https://calendly.com
- Link your calendar (Google, Outlook, etc.)
- Set your availability
- Add your calendar URL to the Inquire page

## 📁 File Descriptions

```
index.html          → Main website (open this!)
css/styles.css      → Styling (black/bronze theme)
js/app.js           → Navigation and forms
config.json         → Easy customization
SETUP.md            → Detailed setup guide
DEPLOYMENT.md       → How to launch live
CREDENTIALS.md      → Track your setup progress
README.md           → Project overview
```

## 💡 Quick Customization

### Change Logo Text
In `index.html`, find:
```html
<div class="logo">
    <h1>HAVEN</h1>
    <p>Design & Build LLC</p>
</div>
```

### Change Colors
In `css/styles.css`, find:
```css
:root {
    --bronze: #C4A747;  /* Change this */
    --black: #1a1a1a;   /* Change this */
}
```

### Update Company Email
In `js/app.js`, update your email service form ID.

### Add Your Photos
Replace image URLs with your own project photos:
```html
<img src="your-photo-url.jpg" alt="Project name">
```

## 🌐 Getting Online (3 Options)

### Option 1: Netlify (Free, Easiest)
1. Go to https://netlify.com
2. Drag & drop your project folder
3. Done! Your site is live
4. Add custom domain later

### Option 2: GoDaddy
1. Buy domain + hosting
2. Use File Manager to upload files
3. Point domain to hosting
4. Your site is live

### Option 3: GitHub Pages
1. Create GitHub account
2. Upload files to `username.github.io` repository
3. Your site is live on GitHub Pages

**Recommendation**: Start with Netlify (easiest, free).

## ✉️ Email Setup (Important!)

Your contact form won't work until you set up email. Two easiest options:

### Formspree (Recommended)
1. Go to https://formspree.io
2. Click "Start"
3. Enter your email address
4. Create form
5. Copy the "Form ID" (looks like `f/xxxxx`)
6. In `js/app.js`, change this line (around line 82):
   ```javascript
   const response = await fetch('https://formspree.io/f/YOUR_ID', {
   ```
7. Replace `YOUR_ID` with your form ID
8. Test the form on your website

### EmailJS (Alternative)
1. Go to https://www.emailjs.com
2. Sign up
3. Create email template
4. Get API keys
5. Update `js/app.js` with your keys
6. Test the form

## 💳 Payment Setup (Optional at First)

Can set up later, but here are the basics:

### Stripe Simple Way
1. https://stripe.com → Create account
2. Dashboard → "Payment Links"
3. Create a link for your service
4. Copy the link
5. In Payments page, update button to link there

### Stripe Full Integration
Want a custom payment form? See [SETUP.md](SETUP.md) for advanced setup.

## 📅 Calendar Setup (Nice to Have)

### Calendly
1. https://calendly.com → Create account
2. Schedule your availability
3. Create "Design Consultation" event type
4. Get your calendar URL
5. Update in `index.html` - find Calendly embed and update the iframe src

## 🧪 Test Your Website

Before going live, test:
- ✅ All 4 pages load
- ✅ Mobile menu opens/closes
- ✅ Contact form submits
- ✅ Payment link works
- ✅ Images load properly
- ✅ Links go to correct pages
- ✅ On mobile phone (see if responsive)

## 📱 Mobile Test

1. Open your website on your phone
2. Verify all text is readable
3. Verify buttons are clickable
4. Test the hamburger menu
5. Fill out form on mobile
6. Click payment link on mobile

## 🎨 Photo Tips

**Good project photos should:**
- Show the finished work clearly
- Have good lighting
- Be high quality (1200x800px or larger)
- Highlight details and craftsmanship
- Include before/after if possible

**Where to get photos:**
- Your own project photos (best!)
- Unsplash.com (free stock photos)
- Pexels.com (free stock photos)
- Pixabay.com (free stock photos)

Replace the placeholder URLs with your image URLs.

## 🔐 Important Security Notes

- Keep your email service password private
- Never share Stripe Secret Key
- Use HTTPS when deployed (automatic with Netlify/Vercel)
- Don't commit passwords to Git
- Keep backups of your files

## 📞 Support Resources

- **Website Help**: See [SETUP.md](SETUP.md)
- **Deployment**: See [DEPLOYMENT.md](DEPLOYMENT.md)
- **Troubleshooting**: Check browser console (F12 key)

## 🎯 30-Day Launch Plan

### Week 1: Setup
- [ ] View website locally
- [ ] Choose email service
- [ ] Create email service account
- [ ] Update company info

### Week 2: Integration
- [ ] Setup Stripe
- [ ] Setup Calendly
- [ ] Configure email form
- [ ] Test all features

### Week 3: Content
- [ ] Add your project photos
- [ ] Update all text/descriptions
- [ ] Customize colors if desired
- [ ] Add social media links

### Week 4: Launch
- [ ] Choose hosting (Netlify)
- [ ] Deploy website
- [ ] Setup custom domain
- [ ] Monitor first inquiries

## 💬 Example Workflows

### Someone visiting your site:
1. Opens havendesignandbuild.com
2. Sees hero + featured projects
3. Clicks "Services" to explore offerings
4. Clicks "Inquire" to submit project details
5. Gets taken to contact form + can book calendar time
6. Can also pay deposit via Stripe

### You (after they inquire):
1. Receive email with their info
2. Review their project
3. Respond with your estimate
4. Send Calendly link if needed
5. Collect payment via Stripe if desired

## 🚀 You're Ready!

Everything is set up and ready to go. The website works perfectly now - you just need to:
1. Add your photos
2. Setup email service
3. Deploy to web

Follow [SETUP.md](SETUP.md) and [DEPLOYMENT.md](DEPLOYMENT.md) for next steps.

---

## 🤔 Common Questions

**Q: Can I change the colors?**
A: Yes! Edit `css/styles.css` - look for `:root { }` section

**Q: Where do I add my logo image?**
A: Replace the text logo in the navbar with an `<img>` tag

**Q: How do I add more services?**
A: Duplicate a service section in `index.html`

**Q: How do I add more testimonials?**
A: Add more testimonial divs in the testimonials section

**Q: Can this work offline?**
A: Yes, open `index.html` locally - but inquiry forms won't work without internet

**Q: Is this mobile friendly?**
A: Yes! 100% responsive. Test it!

**Q: What if I break something?**
A: Just open this file again or download the original

---

**Good luck, Micah! 🎉 Your site is going to be amazing!**

*"Designing, Building & Repairing your home, one detail at a time."*
