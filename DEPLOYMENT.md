# Deployment Guide - Haven Design & Build

Complete guide to deploy your website to production.

## Option 1: Netlify (Easiest - Recommended)

### Step 1: Prepare Files
1. Make sure all files are in your workspace:
   - `index.html`
   - `css/styles.css`
   - `js/app.js`
   - All other necessary files

### Step 2: Create Netlify Account
1. Go to [netlify.com](https://netlify.com)
2. Click "Sign up" and create account
3. Verify your email

### Step 3: Deploy
1. Drag and drop your entire project folder into Netlify
2. Your site will be live at: `your-random-name.netlify.app`
3. Netlify generates SSL automatically ✓

### Step 4: Add Custom Domain
1. Go to "Domain settings"
2. Click "Add domain"
3. Enter your domain (e.g., `havendesignandbuild.com`)
4. Update your domain registrar's nameservers to Netlify's
5. Wait 24-48 hours for DNS propagation

### Step 5: Configure
1. Update form submission endpoint in `js/app.js`
2. Add your Formspree ID
3. Redeploy by pushing code changes

**Pros**: Free, easy, fast, automatic HTTPS
**Cons**: Limited backend capabilities

---

## Option 2: Vercel

### Step 1: Create Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up using GitHub
3. Authorize Vercel to access your GitHub

### Step 2: Connect Repository
1. Upload your code to GitHub in a new repository
2. In Vercel, click "New Project"
3. Import your repository
4. Click "Deploy"

### Step 3: Your Site is Live
- Vercel creates a live preview URL
- Each git push deploys automatically
- SSL certificate added automatically

**Pros**: Fast, easy, auto-deployments with Git
**Cons**: Requires GitHub account

---

## Option 3: GoDaddy (With Existing Domain)

### Step 1: Set Up Hosting
1. Go to [godaddy.com](https://godaddy.com)
2. Purchase hosting plan ($2-10/month)
3. Choose "Website Builder" or "Web Hosting"

### Step 2: Upload Files
1. Log in to GoDaddy
2. Go to File Manager or use FTP client (Filezilla)
3. Upload all files to `public_html/` folder

### Step 3: Configure
1. Point your domain to the hosting
2. Create email addresses through GoDaddy
3. SSL certificate: GoDaddy provides free AutoSSL

**Pros**: All in one place, domain + hosting
**Cons**: Slower support, higher pricing

---

## Option 4: GitHub Pages (Free)

### Step 1: Create Repository
1. Go to [github.com](https://github.com)
2. Create new repo named `YourUsername.github.io`
3. Upload all files

### Step 2: Enable Pages
1. Go to Settings → Pages
2. Select main branch as source
3. Your site live at: `YourUsername.github.io`

### Step 3: Add Custom Domain
1. In GitHub, go to Pages settings
2. Add CNAME with your domain
3. Update domain registrar to point to GitHub

**Pros**: Free, simple, good for portfolio
**Cons**: Limited for dynamic features

---

## Post-Deployment Checklist

### Before Going Live
- [ ] All links working (test each page)
- [ ] Forms submitting correctly
- [ ] Payment link functional
- [ ] Calendly calendar loading
- [ ] Images loading properly
- [ ] Mobile responsive (test on phone)
- [ ] Loading time acceptable (< 3 seconds)
- [ ] No console errors (check F12)
- [ ] SSL certificate active (green lock icon)
- [ ] Metadata and title tags correct

### After Going Live
- [ ] Analytics tracking (Google Analytics)
- [ ] Search engines indexed (submit sitemap)
- [ ] Monitor uptime (UptimeRobot, StatusCake)
- [ ] Setup email notifications for form submissions
- [ ] Test form submissions daily for first week
- [ ] Monitor payment processing
- [ ] Check analytics for traffic patterns
- [ ] Review and respond to inquiries promptly

---

## Performance Optimization

### Image Optimization
```bash
# Install ImageOptim or use online tools
- Compress images before uploading
- Use WebP format where supported
- Size: < 500KB per image
```

### Caching
- Netlify/Vercel cache automatically
- Content cached for 1 year for assets
- HTML cached for shorter periods

### CDN
- Netlify/Vercel use global CDN
- Your site loads fast worldwide
- No additional setup needed

---

## SSL Certificate (HTTPS)

### Automatic (Recommended)
- Netlify: ✓ Automatic
- Vercel: ✓ Automatic
- GitHub Pages: ✓ Automatic
- GoDaddy: ✓ Included (AutoSSL)

### Manual
If needed, use Let's Encrypt (free):
1. Install Certbot
2. Run renewal scheduler
3. Configure your server

---

## Email Configuration

### Option 1: Formspree (Easiest)
- Form data goes to Formspree servers
- Formspree forwards to your email
- Free for 50 submissions/month

### Option 2: Backend Email API
- Deploy a backend service (Node.js, Python, etc.)
- Integrate with SendGrid, AWS SES, etc.
- More control, slightly more complex

### Option 3: Email Service with Site
- Use EmailJS (client-side only)
- Configure directly in JavaScript
- No backend needed

---

## Monitoring & Maintenance

### Daily
- [ ] Check email for new inquiries
- [ ] Respond to inquiries within 24 hours

### Weekly
- [ ] Review analytics
- [ ] Check for 404 errors
- [ ] Monitor uptime

### Monthly
- [ ] Check SSL certificate expiration
- [ ] Review mobile usability
- [ ] Test forms and payments
- [ ] Update project portfolio photos
- [ ] Backup your code

### Quarterly
- [ ] Performance audit
- [ ] SEO optimization review
- [ ] Update testimonials if needed
- [ ] Review analytics trends

---

## Troubleshooting Deployment Issues

### Site Not Loading
1. Check DNS propagation (dns-checker.com)
2. Verify domain is pointing correctly
3. Check hosting provider status page
4. Clear browser cache
5. Try different browser

### Form Not Working
1. Verify email service is configured
2. Check form ID in `js/app.js`
3. Test in incognito mode
4. Check browser console for errors

### Stripe Payment Not Working
1. Verify payment link is correct
2. Test payment link in incognito mode
3. Check Stripe dashboard for errors
4. Ensure SSL certificate is active

### Calendly Not Loading
1. Check Calendly URL is correct
2. Verify calendar is published
3. Check for iframe blocking
4. Try different browser

---

## Rollback / Trouble Recovery

### If Something Goes Wrong
1. Netlify/Vercel: Rollback to previous deployment
2. GoDaddy: Restore from backup
3. GitHub Pages: Revert last commit
4. Worst case: Re-upload all files

### Backup Strategy
- Git commits serve as version history
- Daily automatic backups (Netlify/Vercel)
- Export your database/configs monthly
- Keep local copy of all files

---

## Analytics Setup

### Google Search Console
1. Go to [google.com/webmasters](https://search.google.com/search-console)
2. Add property with your domain
3. Upload and verify
4. Submit sitemap

### Google Analytics
1. Create property in [analytics.google.com](https://analytics.google.com)
2. Get Measurement ID (G-XXXXX)
3. Add tracking code to `index.html`
4. Wait 24 hours for data to appear

### Sitemap (Optional)
Generate and submit sitemap for better SEO:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://havendesignandbuild.com/</loc>
    <lastmod>2026-03-18</lastmod>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://havendesignandbuild.com/#services</loc>
    <lastmod>2026-03-18</lastmod>
    <priority>0.8</priority>
  </url>
</urlset>
```

---

## Security Best Practices

- [ ] Keep SSL certificate updated
- [ ] Use strong passwords for all accounts
- [ ] Enable two-factor authentication
- [ ] Never commit secrets to Git
- [ ] Monitor for DDoS attacks
- [ ] Validate all form inputs
- [ ] Keep dependencies updated
- [ ] Regular security audits

---

## Cost Breakdown

| Service        | Cost          | Notes                    |
|---------------|---------------|-------------------------|
| Domain        | $10-15/year   | GoDaddy, Namecheap, etc. |
| Hosting       | Free-$10/mo   | Netlify free, Vercel free|
| Email Service | Free-$30/mo   | Formspree free           |
| Stripe Fees   | 2.9% + $0.30  | Per transaction          |
| Analytics     | Free          | Google Analytics         |
| SSL           | Free          | Automatic with hosting   |
| **Total**     | **$10-50/mo** | Typical range            |

---

## Need Help?

- **Netlify Support**: https://netlify.com/support
- **Vercel Support**: https://vercel.com/support
- **GoDaddy Support**: https://godaddy.com/help
- **Stripe Support**: https://stripe.com/help
- **MDN Docs**: https://developer.mozilla.org/

---

## Quick Deployment Commands

### Using Git (for Netlify/Vercel)
```bash
# Initialize Git repository
git init

# Add files
git add .

# Commit changes
git commit -m "Initial Haven Design & Build website"

# Push to GitHub
git push origin main
```

---

**🎉 Congratulations on launching your website!**

Monitor your analytics and gather customer feedback to continuously improve your site.

