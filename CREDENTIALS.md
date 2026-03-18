# Integration Credentials & Setup

This file helps you track your integration credentials and setup progress.
**Keep this file PRIVATE** - don't share it publicly.

## ✅ Setup Checklist

### Email Service Setup
- [ ] Chosen email service: ________________
- [ ] Email service account created
- [ ] Email service credentials obtained
- [ ] Form ID/API key: ________________
- [ ] Email form tested successfully

**Current Status**: Not started
**Deadline**: Before launch

---

## 📧 Email Service Credentials

### Formspree (If using this)
- [ ] Account created at: https://formspree.io
- [ ] Form ID: `YOUR_FORMSPREE_ID`
- [ ] Email receiving submissions: ________________
- [ ] Test email received: Yes / No

**Update in `js/app.js` (line ~82)**:
```javascript
const response = await fetch('https://formspree.io/f/YOUR_FORMSPREE_ID', {
```

### EmailJS (Alternative)
- [ ] Account created at: https://www.emailjs.com
- [ ] Service ID: ________________
- [ ] Template ID: ________________
- [ ] User ID (Public Key): ________________

### Backend Service (Production)
- [ ] Service chosen: SendGrid / Resend / AWS SES
- [ ] API Key: ________________
- [ ] Endpoint URL: ________________

---

## 💳 Stripe Payment Setup

### Account Setup
- [ ] Stripe account created: https://stripe.com
- [ ] Email verified: ________________
- [ ] Account type: Standard / Express / Custom

### API Keys
- [ ] Publishable Key: `YOUR_STRIPE_PUBLISHABLE_KEY`
- [ ] Saved in: config.json
- [ ] ⚠️ NEVER commit Secret Key to version control

### Payment Link Setup
- [ ] Payment link created in Stripe dashboard
- [ ] Product name: "Haven Design Consultation"
- [ ] Price set: $__________
- [ ] Payment link URL: https://buy.stripe.com/YOUR_LINK
- [ ] Link added to Payments page: Yes / No
- [ ] Test payment completed: Yes / No

### Webhook Setup (Optional for advanced features)
- [ ] Webhook endpoint created
- [ ] Webhook signing secret: ________________
- [ ] Events subscribed: payment_intent.succeeded

---

## 📅 Calendly Setup

### Account Setup
- [ ] Calendly account created: https://calendly.com
- [ ] Calendar connected to: Google / Outlook / iCal
- [ ] Availability set: Yes / No
- [ ] Time zone verified: ________________

### Event Configuration
- [ ] Event type created: "Design Consultation"
- [ ] Duration: 30 / 45 / 60 minutes
- [ ] Booking buffer: __________ minutes
- [ ] Calendar URL: https://calendly.com/__________

### Embed Integration
- [ ] Calendly URL added to `index.html`
- [ ] Embed tested in browser: Yes / No
- [ ] Mobile embed verified: Yes / No

---

## 🔍 Google Analytics Setup (Optional)

- [ ] Analytics account created: https://analytics.google.com
- [ ] Property created for: ________________
- [ ] Measurement ID: G-__________
- [ ] Tracking code added to `index.html`: Yes / No
- [ ] Traffic being tracked: Yes / No

### Goals/Events to Track
- [ ] Form submission tracked
- [ ] Service page views tracked
- [ ] Payment page interaction tracked
- [ ] Navigation menu clicks tracked

---

## 🌐 Domain & Hosting

### Domain
- [ ] Domain chosen: ________________
- [ ] Domain registered at: GoDaddy / Namecheap / Google Domains
- [ ] Domain purchased for _____ years
- [ ] Auto-renewal enabled: Yes / No
- [ ] Domain email: ________________

### Hosting
- [ ] Hosting provider chosen: Netlify / Vercel / GoDaddy
- [ ] Hosting account created
- [ ] Hosting username: ________________
- [ ] FTP/SFTP credentials saved
- [ ] Website files uploaded: Yes / No

### SSL Certificate
- [ ] SSL certificate installed: Yes / No
- [ ] HTTPS enabled: Yes / No
- [ ] Certificate expiration date: ________________
- [ ] Auto-renewal configured: Yes / No

---

## ✉️ Backup Email Setup

- [ ] Work email address: ________________
- [ ] Backup email address: ________________
- [ ] Email forwarding configured: Yes / No
- [ ] Email backup tested: Yes / No

---

## 📱 Mobile Testing Checklist

- [ ] Tested on iPhone 13/14
- [ ] Tested on Android (Samsung/Google)
- [ ] Tested on iPad
- [ ] Tested on desktop (1920px)
- [ ] All forms work on mobile: Yes / No
- [ ] Navigation menu works on mobile: Yes / No
- [ ] Stripe redirect works on mobile: Yes / No
- [ ] Calendly loads on mobile: Yes / No
- [ ] Images load correctly: Yes / No
- [ ] Text is readable: Yes / No

---

## 🐛 Testing Scenarios

### Form Testing
- [ ] Submit form with all fields: ✓ Works / ✗ Fails
- [ ] Submit form with missing field: ✓ Validation works / ✗ Fails
- [ ] Invalid email rejection: ✓ Works / ✗ Fails
- [ ] Invalid phone rejection: ✓ Works / ✗ Fails
- [ ] Email received in inbox: ✓ Yes / ✗ No
- [ ] Form clearing after submit: ✓ Works / ✗ Fails

### Payment Testing
- [ ] Payment link accessible: ✓ Yes / ✗ No
- [ ] Payment amount editable: ✓ Yes / ✗ No
- [ ] Stripe session created: ✓ Yes / ✗ No
- [ ] Test payment successful: ✓ Yes / ✗ No
- [ ] Payment recorded in Stripe: ✓ Yes / ✗ No

### Navigation Testing
- [ ] Home page loads: ✓ Yes / ✗ No
- [ ] Services page loads: ✓ Yes / ✗ No
- [ ] Inquire page loads: ✓ Yes / ✗ No
- [ ] Payments page loads: ✓ Yes / ✗ No
- [ ] Mobile menu opens: ✓ Yes / ✗ No
- [ ] Mobile menu closes: ✓ Yes / ✗ No
- [ ] Navigation links active state: ✓ Works / ✗ Fails

---

## 📊 Post-Launch Monitoring

### Analytics
- [ ] Google Analytics receiving data: Yes / No
- [ ] Page views tracked: Yes / No
- [ ] Form submissions logged: Yes / No
- [ ] Goals configured: Yes / No

### Email Monitoring
- [ ] Inquiries being received: Yes / No
- [ ] Spam filter checked: Yes / No
- [ ] Email response time: __________ hours
- [ ] Failed emails monitored: Yes / No

### Uptime Monitoring
- [ ] Uptime monitor configured: Yes / No
- [ ] Downtime alerts enabled: Yes / No
- [ ] Contact list for alerts: ________________

---

## 🚨 Emergency Contacts

- [ ] Web hosting support phone: ________________
- [ ] Domain registrar support: ________________
- [ ] Email service support: ________________
- [ ] Stripe support: ________________

---

## 📝 Notes

Use this space to track progress, issues, or questions:

```
Date          | Note
--------------|------------------------------------------
MM/DD/YYYY   | Started website setup
             |
             |
             |
```

---

## 🎉 Launch Requirements

All of the following must be complete before launch:

- [ ] All forms tested and working
- [ ] Email service configured and tested
- [ ] Stripe payments configured and tested
- [ ] Calendly integrated and working
- [ ] SSL certificate installed (HTTPS)
- [ ] Domain configured and working
- [ ] Analytics tracking installed
- [ ] All pages proofread for typos
- [ ] All images optimized and loaded
- [ ] Mobile responsiveness verified
- [ ] Legal pages reviewed (Privacy Policy, Terms)
- [ ] Social media links updated
- [ ] Contact information verified
- [ ] Company email monitored
- [ ] Payment notifications configured

---

**Last Updated**: MM/DD/YYYY
**Launch Date**: MM/DD/YYYY
**Status**: 🔴 Not Started / 🟡 In Progress / 🟢 Complete
