// Haven Design & Build - App JavaScript

/**
 * Meta Tag Manager for SEO
 */
class MetaTagManager {
    constructor() {
        this.pageMetadata = {
            home: {
                title: 'Haven Design & Build LLC - Luxury Home Renovations',
                description: 'Transform your home with expert design and craftsmanship. Luxury kitchens, bathrooms, and full-home renovations built to last.',
                ogTitle: 'Haven Design & Build LLC - Luxury Home Renovations',
                ogDescription: 'Transform your home with expert design and craftsmanship. Luxury kitchens, bathrooms, and full-home renovations built to last.',
                ogImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&h=630&q=80',
                url: 'https://www.designhavenbuild.com/'
            },
            services: {
                title: 'Design & Build Services - Haven Design & Build LLC',
                description: 'Explore our comprehensive renovation services: kitchen remodels, bathroom renovations, basement finishing, and outdoor living spaces.',
                ogTitle: 'Premium Home Renovation Services - Haven Design & Build',
                ogDescription: 'Kitchen, bathroom, basement, and outdoor living renovation services delivered with luxury finishes and expert craftsmanship.',
                ogImage: 'https://www.designhavenbuild.com/images/Kitchen_remodel.jpg',
                url: 'https://www.designhavenbuild.com/services'
            },
            inquire: {
                title: 'Get a Quote - Haven Design & Build LLC',
                description: 'Request a free consultation and quote for your home renovation project. Tell us about your vision.',
                ogTitle: 'Request a Quote - Haven Design & Build LLC',
                ogDescription: 'Get a free consultation for your luxury home renovation. Our team will discuss your project and provide a detailed quote.',
                ogImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&h=630&q=80',
                url: 'https://www.designhavenbuild.com/inquire'
            },
            faq: {
                title: 'FAQ - Renovation Questions Answered | Haven Design & Build',
                description: 'Frequently asked questions about kitchen renovations, bathroom remodels, timelines, costs, and our renovation process.',
                ogTitle: 'Renovation FAQ - Questions About Kitchens & Bathrooms',
                ogDescription: 'Find answers to common questions about home renovations, timelines, pricing, and our design process.',
                ogImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&h=630&q=80',
                url: 'https://www.designhavenbuild.com/faq'
            },
            payments: {
                title: 'Payment Options - Haven Design & Build LLC',
                description: 'Flexible payment solutions for your home renovation project. Multiple payment methods and financing options available.',
                ogTitle: 'Payment Options - Haven Design & Build LLC',
                ogDescription: 'Flexible payment plans and multiple payment methods for your renovation project.',
                ogImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&h=630&q=80',
                url: 'https://www.designhavenbuild.com/payments'
            }
        };
    }

    updateMetaTags(page) {
        const metadata = this.pageMetadata[page];
        if (!metadata) return;

        // Update title
        document.title = metadata.title;
        
        // Update meta description
        let descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) descMeta.setAttribute('content', metadata.description);

        // Update og:title
        this.updateOrCreateMetaTag('property', 'og:title', metadata.ogTitle);
        
        // Update og:description
        this.updateOrCreateMetaTag('property', 'og:description', metadata.ogDescription);
        
        // Update og:image
        this.updateOrCreateMetaTag('property', 'og:image', metadata.ogImage);
        
        // Update og:url
        this.updateOrCreateMetaTag('property', 'og:url', metadata.url);
        
        // Update canonical
        let canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) canonical.setAttribute('href', metadata.url);

        // Update Twitter card tags
        this.updateOrCreateMetaTag('property', 'twitter:title', metadata.ogTitle);
        this.updateOrCreateMetaTag('property', 'twitter:description', metadata.ogDescription);
        this.updateOrCreateMetaTag('property', 'twitter:image', metadata.ogImage);
        this.updateOrCreateMetaTag('property', 'twitter:url', metadata.url);
    }

    updateOrCreateMetaTag(attribute, attributeValue, content) {
        let meta = document.querySelector(`meta[${attribute}="${attributeValue}"]`);
        if (meta) {
            meta.setAttribute('content', content);
        } else {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, attributeValue);
            meta.setAttribute('content', content);
            document.head.appendChild(meta);
        }
    }
}

/**
 * Navigation and Page Management
 */
class NavigationManager {
    constructor() {
        this.hamburger = document.getElementById('hamburger');
        this.navMenu = document.getElementById('navMenu');
        this.navLinks = document.querySelectorAll('.nav-link');
        this.metaTagManager = new MetaTagManager();
        this.init();
    }

    init() {
        // Hamburger menu toggle
        this.hamburger.addEventListener('click', () => this.toggleMenu());

        // Navigation link clicks
        this.navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page);
                this.closeMenu();
            });
        });
    }

    toggleMenu() {
        this.hamburger.classList.toggle('active');
        this.navMenu.classList.toggle('active');
    }

    closeMenu() {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
    }

    navigateTo(page) {
        // Hide all pages
        const pages = document.querySelectorAll('.page');
        pages.forEach(p => p.style.display = 'none');

        // Show selected page
        const selectedPage = document.getElementById(page);
        if (selectedPage) {
            selectedPage.style.display = 'block';

            // Update active nav link
            this.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('data-page') === page) {
                    link.classList.add('active');
                }
            });

            // Update meta tags for SEO
            this.metaTagManager.updateMetaTags(page);

            // Scroll to top
            window.scrollTo(0, 0);
        }
    }
}

/**
 * Form Handler for Inquiry/Contact Form
 */
class FormHandler {
    constructor() {
        this.form = document.getElementById('inquireForm');
        this.messageDiv = document.getElementById('formMessage');
        this.init();
    }

    init() {
        if (this.form) {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Get form data
        const formData = new FormData(this.form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            zip: formData.get('zip'),
            description: formData.get('description'),
            service: formData.get('service') || 'Not specified',
            timestamp: new Date().toLocaleString()
        };

        // Try to send email using FormSubmit service (free alternative)
        try {
            // Disable submit button
            const submitBtn = this.form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            // Option 1: Using FormSubmit.co (free email service)
            const response = await fetch('https://formspree.io/f/mnqnqvpk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    zip: data.zip,
                    service: data.service,
                    description: data.description,
                    timestamp: data.timestamp
                })
            });

            if (response.ok) {
                this.showMessage(
                    'Success! Your inquiry has been submitted. We\'ll contact you within 24 hours.',
                    'success'
                );
                this.form.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Inquiry';
            } else {
                this.showMessage(
                    'There was an issue submitting your inquiry. Please try again or contact us directly.',
                    'error'
                );
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Inquiry';
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage(
                'Connection error. Please check your internet and try again.',
                'error'
            );
            const submitBtn = this.form.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Inquiry';
        }
    }

    showMessage(message, type) {
        this.messageDiv.textContent = message;
        this.messageDiv.className = `form-message ${type}`;
        this.messageDiv.style.display = 'block';

        // Hide message after 5 seconds
        setTimeout(() => {
            this.messageDiv.style.display = 'none';
        }, 5000);
    }
}

/**
 * Stripe Payment Handler
 */
class PaymentHandler {
    constructor() {
        this.stripeButton = document.getElementById('stripeButton');
        this.paymentAmount = document.getElementById('paymentAmount');
        this.init();
    }

    init() {
        if (this.stripeButton) {
            this.stripeButton.addEventListener('click', () => this.handlePaymentClick());
        }
    }

    handlePaymentClick() {
        const amount = this.paymentAmount.value;

        if (!amount || amount <= 0) {
            alert('Please enter a valid payment amount');
            return;
        }

        // Note: Replace 'YOUR_STRIPE_PUBLISHABLE_KEY' with your actual Stripe publishable key
        // and implement proper Stripe integration

        alert(`Payment feature coming soon!\n\nAmount: $${amount}\n\nTo integrate Stripe:\n1. Get your Stripe keys from dashboard.stripe.com\n2. Replace the placeholder in the code with your publishable key\n3. Set up a payment endpoint on your backend`);

        // Example of how to integrate Stripe:
        // const stripe = Stripe('YOUR_STRIPE_PUBLISHABLE_KEY');
        // stripe.redirectToCheckout({
        //     sessionId: 'YOUR_SESSION_ID'
        // });
    }
}

/**
 * Email Integration Setup
 */
function setupEmailIntegration() {
    // This guide will help set up email for the contact form:
    console.log(`
    ========== EMAIL INTEGRATION SETUP ==========
    
    Current Implementation Uses: Formspree (formspree.io)
    - Free for up to 50 submissions/month
    - More options available for higher volumes
    
    To activate:
    1. Go to https://formspree.io
    2. Sign up and create a new form
    3. Copy your form ID (looks like: f/xxxxx)
    4. Replace 'mnqnqvpk' in the fetch URL with your ID
    5. Test the form
    
    Alternative Email Services:
    - EmailJS (emailjs.com) - Client-side only
    - SendGrid (sendgrid.com) - Requires backend
    - Resend (resend.com) - Modern API
    - AWS SES - Cost-effective for production
    
    ============================================
    `);
}

/**
 * Main App Initialization
 */
document.addEventListener('DOMContentLoaded', function() {
    // Initialize navigation
    const navigation = new NavigationManager();

    // Initialize form handler
    const formHandler = new FormHandler();

    // Initialize payment handler
    const paymentHandler = new PaymentHandler();

    // Setup email integration info
    setupEmailIntegration();

    // Set home as default page
    navigation.navigateTo('home');

    // Close mobile menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            document.getElementById('hamburger').classList.remove('active');
            document.getElementById('navMenu').classList.remove('active');
        }
    });

    console.log('✅ Haven Design & Build website initialized');
});

/**
 * Utility Functions
 */

/**
 * Validates email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validates phone format
 */
function isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validates zip code format
 */
function isValidZip(zip) {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip.replace(/\s/g, ''));
}

/**
 * Smooth scroll to element
 */
function smoothScroll(element) {
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}
