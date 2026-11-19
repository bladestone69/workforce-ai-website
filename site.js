const header = document.querySelector('[data-site-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navLinks = document.querySelector('[data-nav-links]');
let projectMenuToggle;
let projectSubmenu;
let projectsLink;

function closeProjectMenu() {
    if (!projectMenuToggle || !projectSubmenu) return;
    projectSubmenu.hidden = true;
    projectMenuToggle.setAttribute('aria-expanded', 'false');
    projectsLink?.setAttribute('aria-expanded', 'false');
}

function openProjectMenu() {
    if (!projectMenuToggle || !projectSubmenu) return;
    projectSubmenu.hidden = false;
    projectMenuToggle.setAttribute('aria-expanded', 'true');
    projectsLink?.setAttribute('aria-expanded', 'true');
}

function updateHeader() {
    header?.classList.toggle('is-scrolled', window.scrollY > 16);
}

function closeMenu() {
    closeProjectMenu();
    if (!menuToggle || !navLinks) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    navLinks.classList.remove('is-open');
    header?.classList.remove('menu-active');
    document.body.classList.remove('menu-open');
}

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

menuToggle?.addEventListener('click', () => {
    const shouldOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(shouldOpen));
    navLinks?.classList.toggle('is-open', shouldOpen);
    header?.classList.toggle('menu-active', shouldOpen);
    document.body.classList.toggle('menu-open', shouldOpen);
});

navLinks?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));

// Projects is a direct link. Hover/focus reveals categories on desktop; the
// separate mobile control keeps that direct destination available on touch.
projectsLink = navLinks?.querySelector('a[href="work.html"]');
if (projectsLink) {
    const wrapper = document.createElement('div');
    wrapper.className = 'nav-project-item';
    navLinks.insertBefore(wrapper, projectsLink);
    wrapper.appendChild(projectsLink);

    projectMenuToggle = document.createElement('button');
    projectMenuToggle.type = 'button';
    projectMenuToggle.className = 'nav-project-toggle';
    projectMenuToggle.setAttribute('aria-label', 'Show project categories');
    projectMenuToggle.setAttribute('aria-expanded', 'false');
    projectMenuToggle.setAttribute('aria-controls', 'project-shortcuts');
    projectMenuToggle.textContent = 'Categories';
    projectsLink.setAttribute('aria-haspopup', 'true');
    projectsLink.setAttribute('aria-expanded', 'false');

    projectSubmenu = document.createElement('div');
    projectSubmenu.id = 'project-shortcuts';
    projectSubmenu.className = 'nav-project-submenu';
    projectSubmenu.hidden = true;
    for (const [label, href] of [
        ['Games', 'work.html#games'],
        ['Prototypes & in development', 'work.html#prototypes'],
        ['Interactive demos', 'work.html#demos'],
        ['Digital & 3D assets', 'work.html#assets'],
        ['AI services ↗', 'ai-automation.html']
    ]) {
        const link = document.createElement('a');
        link.href = href;
        link.textContent = label;
        link.addEventListener('click', closeMenu);
        projectSubmenu.appendChild(link);
    }
    wrapper.append(projectMenuToggle, projectSubmenu);
    projectMenuToggle.addEventListener('click', () => {
        if (projectSubmenu.hidden) openProjectMenu();
        else closeProjectMenu();
    });
    wrapper.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse' && window.innerWidth > 900) openProjectMenu();
    });
    wrapper.addEventListener('pointerleave', event => {
        if (event.pointerType === 'mouse' && window.innerWidth > 900) closeProjectMenu();
    });
    wrapper.addEventListener('focusin', () => {
        if (window.innerWidth > 900) openProjectMenu();
    });
    wrapper.addEventListener('focusout', event => {
        if (!wrapper.contains(event.relatedTarget)) closeProjectMenu();
    });
    wrapper.addEventListener('keydown', event => {
        if (event.key === 'Escape' && !projectSubmenu.hidden) {
            projectsLink.focus();
            closeProjectMenu();
        }
    });
    document.addEventListener('click', event => {
        if (!wrapper.contains(event.target)) closeProjectMenu();
    });
}

window.addEventListener('resize', () => {
    if (window.innerWidth > 900) closeMenu();
});

const starHero = document.querySelector('[data-star-hero]');
const starField = document.querySelector('[data-star-field]');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (starField) {
    const layers = Array.from(starField.querySelectorAll('[data-star-layer]'));
    const layerCounts = [34, 30, 24, 14];
    let seed = 24681357;
    const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };

    layers.forEach((layer, layerIndex) => {
        for (let index = 0; index < layerCounts[layerIndex]; index += 1) {
            const star = document.createElement('span');
            const size = (0.8 + random() * (layerIndex + 1) * 0.85).toFixed(2);
            star.className = 'star';
            star.style.setProperty('--star-left', `${(random() * 100).toFixed(2)}%`);
            star.style.setProperty('--star-top', `${(random() * 100).toFixed(2)}%`);
            star.style.setProperty('--star-size', `${size}px`);
            star.style.setProperty('--star-opacity', (0.28 + random() * 0.62).toFixed(2));
            star.style.setProperty('--star-speed', `${(2.2 + random() * 4.4).toFixed(2)}s`);
            star.style.setProperty('--star-delay', `${(-random() * 5).toFixed(2)}s`);
            layer.appendChild(star);
        }
    });
}

if (starHero && !prefersReducedMotion) {
    let animationFrame;
    const updateStarPosition = event => {
        const x = (event.clientX / window.innerWidth - 0.5) * 2;
        const y = (event.clientY / window.innerHeight - 0.5) * 2;
        cancelAnimationFrame(animationFrame);
        animationFrame = requestAnimationFrame(() => {
            starHero.style.setProperty('--star-x', x.toFixed(3));
            starHero.style.setProperty('--star-y', y.toFixed(3));
        });
    };

    starHero.addEventListener('pointermove', updateStarPosition);
    starHero.addEventListener('pointerleave', () => {
        starHero.style.setProperty('--star-x', '0');
        starHero.style.setProperty('--star-y', '0');
    });
}

document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeMenu();
});

document.querySelectorAll('.service-detail').forEach(card => {
    const front = card.querySelector('.service-front');
    const pricing = card.querySelector('.service-pricing');
    const toggles = card.querySelectorAll('[data-pricing-toggle]');

    if (!front || !pricing || toggles.length < 2) return;

    toggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const showPricing = !card.classList.contains('is-pricing');
            card.classList.toggle('is-pricing', showPricing);
            front.setAttribute('aria-hidden', String(showPricing));
            pricing.setAttribute('aria-hidden', String(!showPricing));
            front.inert = showPricing;
            pricing.inert = !showPricing;

            requestAnimationFrame(() => {
                const nextTarget = showPricing
                    ? pricing.querySelector('h2')
                    : front.querySelector('[data-pricing-toggle]');
                if (showPricing && nextTarget) nextTarget.tabIndex = -1;
                nextTarget?.focus({ preventScroll: true });
                if (showPricing) {
                    card.scrollIntoView({
                        behavior: prefersReducedMotion ? 'auto' : 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    });
});

const contactParams = new URLSearchParams(window.location.search);
const requestedService = contactParams.get('service');
const isCallback = contactParams.get('enquiry') === 'call';
const requestedOffer = contactParams.get('offer');
const activeOffer = requestedOffer === 'aura-launch' && requestedService === 'Aura'
    ? 'aura-launch'
    : requestedOffer === 'black-friday' && requestedService === 'Website' &&
      document.documentElement.classList.contains('black-friday-active') ? 'black-friday' : '';
const contactForm = document.getElementById('contact-form');
const serviceSelect = document.getElementById('contact-service');
const formStatus = document.getElementById('contact-form-status');
const contactPreference = document.getElementById('contact-preference');
const contactPhone = document.getElementById('contact-phone');
const contactPhoneGroup = contactPhone?.closest('.contact-phone-field');
const contactPhoneNote = document.querySelector('[data-call-required]');
const contactEmail = document.getElementById('contact-email');
const contactMessage = document.getElementById('contact-message');
const websitePackage = document.getElementById('contact-package');
const isNovemberQuote = activeOffer === 'black-friday' && !isCallback;

function setContactCopy(eyebrow, heading, intro, button) {
    document.querySelector('#contact .contact-copy .eyebrow').textContent = eyebrow;
    document.querySelector('#contact .contact-copy h2').textContent = heading;
    document.querySelector('#contact .contact-copy p').textContent = intro;
    contactForm.querySelector('button[type="submit"]').textContent = button;
}

function restoreContactDefaults() {
    if (!contactForm) return;
    if (Array.from(serviceSelect.options).some(option => option.value === requestedService)) {
        serviceSelect.value = requestedService;
    } else if (isCallback) {
        serviceSelect.value = 'Other';
    }
    if (isCallback) contactPreference.value = 'Phone call';
}

if (contactForm && isCallback) {
    contactForm.dataset.enquiryType = 'call';
    for (const field of [contactEmail, contactMessage, serviceSelect, contactPreference]) {
        field.required = false;
        field.closest('.field-group').hidden = true;
    }
    contactEmail.disabled = true;
    contactMessage.disabled = true;
    contactForm.querySelector('.contact-extra').hidden = true;
    contactForm.querySelector('.contact-extra input[name="bestTime"]').disabled = true;
    document.getElementById('contact-call-time-group').hidden = false;
    document.getElementById('contact-call-time').disabled = false;
    setContactCopy(
        'Request a call', 'Let’s talk about your project.',
        activeOffer === 'black-friday'
            ? 'Ask us about the November website offer. Leave your name and number for a free 15-minute call.'
            : 'Leave your name and number for a free 15-minute call.',
        'Request My Call'
    );
} else if (contactForm && isNovemberQuote) {
    document.getElementById('contact-package-group').hidden = false;
    websitePackage.disabled = false;
    serviceSelect.closest('.field-group').hidden = true;
    contactMessage.required = false;
    contactMessage.placeholder = 'Share your website URL or tell us what you need (optional).';
    contactForm.querySelector('label[for="contact-message"]').textContent = 'Anything we should know? (optional)';
    setContactCopy(
        'November website offer', 'Get a quote for your website.',
        'Improvements from R1,500. The offer runs until 30 November 2026 for new clients; we’ll confirm your price once we know the scope.',
        'Request My November Quote'
    );
} else if (contactForm && activeOffer === 'aura-launch') {
    serviceSelect.closest('.field-group').hidden = true;
    contactMessage.placeholder = 'What could Aura help you with?';
    setContactCopy(
        'Aura launch special', 'See what Aura can do for your business.',
        'Tell us what you’d like Aura to help with and we’ll get back to you with launch details.',
        'Ask About Aura'
    );
}

restoreContactDefaults();

document.querySelectorAll('[data-enquiry-service]').forEach(link => {
    link.addEventListener('click', () => {
        if (serviceSelect && !isCallback && !isNovemberQuote && !activeOffer) {
            serviceSelect.value = link.dataset.enquiryService || '';
        }
    });
});

let enquirySavedWithoutNotification = false;
let enquiryInFlight = false;

function syncPhonePreference() {
    if (!contactForm || !contactPreference || !contactPhone || !contactPhoneGroup) return;
    const isCallRequest = contactForm.dataset.enquiryType === 'call';
    const needsPhone = isCallRequest || contactPreference.value === 'Phone call' || contactPreference.value === 'WhatsApp';
    contactPhoneGroup.hidden = !needsPhone;
    contactPhone.required = needsPhone;
    if (!needsPhone) contactPhone.value = '';
    if (contactPhoneNote) {
        contactPhoneNote.textContent = isCallRequest
            ? '(required for a call)'
            : contactPreference.value === 'WhatsApp'
                ? '(required for WhatsApp)'
                : '(required for a phone call)';
    }
}

contactPreference?.addEventListener('change', syncPhonePreference);
syncPhonePreference();

function showFormStatus(message, type) {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status is-visible is-${type}`;
}

contactForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (enquirySavedWithoutNotification) return;
    if (enquiryInFlight) return;

    if (!contactForm.reportValidity()) return;

    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalLabel = submitButton?.textContent || 'Send Project Brief';
    const formData = new FormData(contactForm);
    const payload = {
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        company: formData.get('company'),
        contactPreference: formData.get('contactPreference'),
        bestTime: formData.get('bestTime'),
        enquiryType: contactForm.dataset.enquiryType || 'project',
        service: formData.get('service'),
        message: formData.get('message'),
        offer: activeOffer,
        websitePackage: formData.get('websitePackage'),
        source: 'website_project_enquiry'
    };

    enquiryInFlight = true;
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Sending…';
    }

    try {
        const response = await fetch('/api/save-lead', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        let result = {};
        try {
            result = await response.json();
        } catch {
            result = {};
        }

        if (!response.ok || result.success !== true) throw new Error(result.error || 'The enquiry could not be sent.');

        // Fire only after the server has saved the enquiry. Do not send contact details to Tag Manager.
        window.dataLayer?.push({
            event: 'studio_enquiry_saved',
            enquiry_type: payload.enquiryType,
            service: payload.service,
            ...(activeOffer ? { offer: activeOffer } : {}),
            ...(payload.websitePackage ? { website_package: payload.websitePackage } : {}),
            notification_sent: result.notificationSent === true
        });

        if (result.notificationSent === false) {
            enquirySavedWithoutNotification = true;
            showFormStatus(result.message || `Your details were saved, but the notification failed. Please email info@lockdownstudios.com and quote ${result.reference}. Do not submit again.`, 'error');
        } else {
            contactForm.reset();
            restoreContactDefaults();
            syncPhonePreference();
            showFormStatus(
                payload.enquiryType === 'call'
                    ? 'Thank you. Your call request has been emailed to the studio.'
                    : isNovemberQuote ? 'Thank you. Your November quote request has been emailed to the studio.'
                    : activeOffer === 'aura-launch' ? 'Thank you. Your Aura enquiry has been emailed to the studio.'
                    : 'Thank you. Your project enquiry has been emailed to the studio.',
                'success'
            );
        }
    } catch (error) {
        showFormStatus(`${error.message} You can also email info@lockdownstudios.com.`, 'error');
    } finally {
        enquiryInFlight = false;
        if (submitButton) {
            submitButton.disabled = enquirySavedWithoutNotification;
            submitButton.textContent = enquirySavedWithoutNotification ? 'Enquiry saved' : originalLabel;
        }
    }
});

// Luna offers guided site answers in static previews and live AI when the server gate is ready.
import('./assistant.js?v=3').catch(() => {});

// Aggregate page counts and on-site routes only; no IDs, query strings, or form fields.
if (!['localhost', '127.0.0.1'].includes(window.location.hostname) && navigator.doNotTrack !== '1') {
    let previous = null;
    let referringOrigin = '';
    try {
        const referrer = new URL(document.referrer);
        referringOrigin = referrer.origin;
        if (referrer.origin === window.location.origin) previous = referrer.pathname;
    } catch { /* Direct visit. */ }
    fetch('/api/track-page', {
        method: 'POST', credentials: 'same-origin', keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: window.location.pathname, fromPath: previous, referrer: referringOrigin })
    }).catch(() => {});
}
