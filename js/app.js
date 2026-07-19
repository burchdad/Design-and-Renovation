// Haven Design & Build - App JavaScript

/**
 * Meta Tag Manager for SEO
 */
class MetaTagManager {
    constructor() {
        this.baseUrl = 'https://www.designhavenbuild.com/';
        this.pageMetadata = {
            home: {
                title: 'Haven Design & Build LLC | Marietta GA Renovation Contractor',
                description: 'Marietta renovation contractor for kitchens, bathrooms, basements, decks, outdoor living, and commercial build-outs across Cobb County and greater Atlanta.',
                ogTitle: 'Haven Design & Build LLC | Marietta Renovation Contractor',
                ogDescription: 'Residential and commercial design-build remodeling in Marietta, Cobb County, and greater Atlanta.',
                ogImage: 'https://www.designhavenbuild.com/images/modern_living.jpg',
                url: 'https://www.designhavenbuild.com/'
            },
            services: {
                title: 'Renovation Services in Marietta GA | Haven Design & Build LLC',
                description: 'Kitchen remodeling, bathroom remodeling, basement finishing, decks, outdoor living, and commercial renovation services in Marietta and Cobb County.',
                ogTitle: 'Renovation Services in Marietta GA | Haven Design & Build',
                ogDescription: 'Kitchen, bathroom, basement, deck, outdoor living, and commercial renovation services in Marietta, Cobb County, and greater Atlanta.',
                ogImage: 'https://www.designhavenbuild.com/images/Kitchen_remodel.jpg',
                url: 'https://www.designhavenbuild.com/#services'
            },
            inquire: {
                title: 'Request a Renovation Quote | Haven Design & Build LLC',
                description: 'Request a renovation quote for a residential or commercial project in Marietta, Cobb County, or the greater Atlanta area.',
                ogTitle: 'Request a Quote - Haven Design & Build LLC',
                ogDescription: 'Get a free consultation for your residential or commercial renovation. Our team will discuss your project and next steps.',
                ogImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&h=630&q=80',
                url: 'https://www.designhavenbuild.com/#inquire'
            },
            faq: {
                title: 'Renovation FAQ | Marietta Remodeling Questions Answered',
                description: 'Answers about kitchen remodeling, bathroom renovations, decks, basement finishing, commercial renovation, timelines, payment schedule, and service areas.',
                ogTitle: 'Renovation FAQ | Haven Design & Build LLC',
                ogDescription: 'Answers about Marietta-area remodeling, commercial renovation, decks, timelines, pricing, and how to start.',
                ogImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&h=630&q=80',
                url: 'https://www.designhavenbuild.com/#faq'
            },
            payments: {
                title: 'Payment Options - Haven Design & Build LLC',
                description: 'Payment options for Haven Design & Build renovation projects, including the typical 40%, 30%, 30% project payment schedule.',
                ogTitle: 'Payment Options - Haven Design & Build LLC',
                ogDescription: 'Payment options and the typical 40%, 30%, 30% schedule for renovation projects.',
                ogImage: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&h=630&q=80',
                url: 'https://www.designhavenbuild.com/#payments'
            },
            connect: {
                title: 'QR Code & Social Links - Haven Design & Build LLC',
                description: 'Connect with Haven Design & Build online, open the inquiry form, visit payment options, or find social media pages.',
                ogTitle: 'Connect With Haven Design & Build LLC',
                ogDescription: 'Scan the website QR code or visit Haven Design & Build social pages, inquiry form, and payment tab.',
                ogImage: 'https://www.designhavenbuild.com/images/Haven_transparent_logo.png',
                url: 'https://www.designhavenbuild.com/#connect'
            },
            thanks: {
                title: 'Thank You - Haven Design & Build LLC',
                description: 'Thank you for contacting Haven Design & Build. We will review your renovation inquiry and follow up soon.',
                ogTitle: 'Thank You - Haven Design & Build LLC',
                ogDescription: 'Your Haven Design & Build inquiry has been received.',
                ogImage: 'https://www.designhavenbuild.com/images/Haven_transparent_logo.png',
                url: 'https://www.designhavenbuild.com/#thanks'
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
        this.pageLinks = document.querySelectorAll('[data-page]');
        this.metaTagManager = new MetaTagManager();
        this.init();
    }

    init() {
        // Hamburger menu toggle
        this.hamburger.addEventListener('click', () => this.toggleMenu());

        // Navigation link clicks
        this.pageLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.getAttribute('data-page');
                this.navigateTo(page, true);
                this.closeMenu();
            });
        });

        window.addEventListener('hashchange', () => {
            this.navigateTo(this.getPageFromHash(), false);
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

    getPageFromHash() {
        const page = window.location.hash.replace('#', '');
        return document.getElementById(page) ? page : 'home';
    }

    navigateTo(page, updateHash = false) {
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

            if (updateHash) {
                history.pushState(null, '', page === 'home' ? '#home' : `#${page}`);
            }

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
            projectType: formData.get('projectType') || 'Not specified',
            timestamp: new Date().toLocaleString()
        };

        if (!isValidEmail(data.email)) {
            this.showMessage('Please enter a valid email address.', 'error');
            return;
        }

        if (!isValidPhone(data.phone)) {
            this.showMessage('Please enter a valid phone number.', 'error');
            return;
        }

        if (!isValidZip(data.zip)) {
            this.showMessage('Please enter a valid ZIP code.', 'error');
            return;
        }

        // Submit inquiry using Formspree
        try {
            // Disable submit button
            const submitBtn = this.form.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            formData.set('_subject', `New Haven inquiry - ${data.service}`);
            formData.set('_replyto', data.email);
            formData.set('timestamp', data.timestamp);

            const response = await fetch(this.form.action, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData
            });

            if (response.ok) {
                trackAnalyticsEvent('generate_lead', {
                    service_interest: data.service,
                    project_type: data.projectType,
                    zip_code: data.zip
                });
                this.showMessage(
                    'Success! Your inquiry has been submitted. We\'ll contact you within 24 hours.',
                    'success'
                );
                this.form.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Inquiry';
                window.location.hash = 'thanks';
            } else {
                this.showMessage(
                    'There was an issue submitting your inquiry. Please email micah@designhavenbuild.com directly.',
                    'error'
                );
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Inquiry';
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage(
                'Connection error. Please email micah@designhavenbuild.com directly.',
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
        this.paymentLink = '';
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
            alert('Enter the amount shown on your approved quote or invoice, then use the secure payment link sent with that quote or invoice.');
            return;
        }

        if (this.paymentLink) {
            window.location.href = this.paymentLink;
            return;
        }

        alert(`Amount entered: $${amount}\n\nPlease use the secure Jobber/Stripe-powered payment link sent with your approved quote or invoice. If you need that link resent, contact Haven Design & Build through the inquiry form or email micah@designhavenbuild.com.`);
    }
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

    document.querySelectorAll('[data-analytics-event]').forEach((element) => {
        element.addEventListener('click', () => {
            trackAnalyticsEvent(element.getAttribute('data-analytics-event'), {
                event_label: element.getAttribute('data-analytics-label') || element.textContent.trim()
            });
        });
    });

    // Set initial page from hash or home
    navigation.navigateTo(navigation.getPageFromHash());

    // Close mobile menu on window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            document.getElementById('hamburger').classList.remove('active');
            document.getElementById('navMenu').classList.remove('active');
        }
    });

    console.info('Haven Design & Build website initialized');
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

function trackAnalyticsEvent(eventName, parameters = {}) {
    if (!eventName || typeof window.gtag !== 'function') return;
    window.gtag('event', eventName, {
        event_category: 'conversion_path',
        ...parameters
    });
}

/**
 * Smooth scroll to element
 */
function smoothScroll(element) {
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}
