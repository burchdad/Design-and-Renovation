# Haven Design & Build LLC - Website

A professional, modern, and fully responsive landing page and portfolio for a high-end design and renovation company.

## 🏠 Features

- **Responsive Design**: Works perfectly on mobile, tablet, and desktop
- **Modern UI/UX**: Clean, professional design with black and bronze color scheme
- **Service Portfolio**: Showcase kitchen remodels, bathroom renovations, basement finishing, and outdoor living
- **Contact Form**: Integrated inquiry form with email notifications
- **Payment Integration**: Stripe payment integration for deposits and payments
- **Calendar Scheduling**: Calendly integration for booking consultations
- **Mobile Menu**: Touch-friendly hamburger menu for mobile devices
- **Project Gallery**: Display featured projects and testimonials

## 📁 Project Structure

```
/Design-and-Renovation/
├── index.html              # Main website file
├── css/
│   └── styles.css          # All styling (mobile responsive)
├── js/
│   └── app.js              # Navigation, forms, integrations
├── config.json             # Easy customization configuration
├── SETUP.md                # Detailed setup guide
└── README.md               # This file
```

## 🚀 Quick Start

1. **View the site**: Open `index.html` in any web browser
2. **Navigate**: Use top navigation to switch between pages:
   - **Home**: Featured projects and testimonials
   - **Services**: Detailed service offerings
   - **Inquire**: Contact form and consultation booking
   - **Payments**: Payment options and online payment

## 🔧 Customization

All easy customization options are in `config.json`:
- Company information
- Color scheme
- Integration keys (Email, Stripe, Calendly)
- Services and testimonials
- Social media links

For detailed setup instructions, see [SETUP.md](SETUP.md)

## 📧 Email Integration

The contact form uses **Formspree** (free service). To activate:

1. Go to [formspree.io](https://formspree.io)
2. Create a new form
3. Copy your form ID
4. Update `js/app.js` with your form ID (line ~82)

**Alternative email services**: EmailJS, SendGrid, Resend, AWS SES

## 💳 Stripe Payment Integration

To accept online payments:

1. Create a [Stripe account](https://stripe.com)
2. Get your Publishable Key from Dashboard
3. Create a Payment Link for your product
4. Update the payment link URL in the Payments page

See [SETUP.md](SETUP.md) for detailed Stripe setup instructions.

## 📅 Calendly Integration

To enable booking:

1. Create a [Calendly account](https://calendly.com)
2. Set up your availability
3. Copy your calendar URL
4. Update the Calendly embed in `index.html`

## 📱 Mobile Responsive

The website is fully responsive with:
- Mobile-first design approach
- Hamburger navigation menu for small screens
- Touch-optimized buttons and forms
- Optimized images for all screen sizes
- Tested on iPhone, Android, iPad, and desktop

## 🎨 Design System

### Colors
- **Primary**: Black (#1a1a1a) - Professional, sophisticated
- **Accent**: Bronze (#C4A747) - Luxury, premium feel
- **Secondary**: Various grays for hierarchy

### Typography
- Modern, clean font stack
- Optimized line heights for readability
- Hierarchy through font sizes and weights

### Components
- Responsive grid layouts
- Smooth animations and transitions
- Accessible form inputs
- Visual feedback on interactions

## 🌐 Deployment

This is a **static website** - no backend required. Deploy to:

- **Netlify** (drag & drop, free)
- **Vercel** (optimized for modern web)
- **GitHub Pages** (free from GitHub)
- **GoDaddy** (traditional hosting)
- **Any web host** (just upload files via FTP)

**Recommended**: Netlify or Vercel for free, fast hosting with HTTPS.

## ✅ Deployment Checklist

Before going live:

- [ ] Update all company information
- [ ] Add real project photos
- [ ] Setup email service (Formspree, EmailJS, etc.)
- [ ] Setup Stripe account and payment links
- [ ] Configure Calendly calendar
- [ ] Test contact form submissions
- [ ] Test payment functionality
- [ ] Test on mobile and desktop
- [ ] Setup SSL certificate (HTTPS)
- [ ] Add analytics tracking (Google Analytics, etc.)
- [ ] Create Privacy Policy page
- [ ] Setup email backups and monitoring

## 🔐 Security Notes

- Contact form submissions go to your email service
- No sensitive data is stored locally
- Use HTTPS in production
- Keep API keys private
- Never commit `.env` files or secrets to version control

## 📞 Support

See [SETUP.md](SETUP.md) for:
- Detailed integration guides
- Troubleshooting
- API documentation links
- Best practices

## 📊 Analytics

To track visitors, add Google Analytics:
1. Create account at [analytics.google.com](https://analytics.google.com)
2. Get your Measurement ID
3. Add tracking code to `<head>` in `index.html`

## 🎯 Features Coming Soon

- Blog section for project updates
- Video gallery with before/after tours
- Client testimonial videos
- Advanced scheduling system
- Multi-language support

## 📄 License

This website template is ready for production use by Haven Design & Build LLC.

## 🤝 Contributing

To suggest improvements or report issues, contact the development team.

---

**Built with ❤️ for Haven Design & Build LLC**

*"Designing, Building & Repairing your home, one detail at a time."*
