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

const serviceSelect = document.getElementById('contact-service');
const requestedService = new URLSearchParams(window.location.search).get('service');
const requestedEnquiry = new URLSearchParams(window.location.search).get('enquiry');

if (serviceSelect && requestedService) {
    const matchingOption = Array.from(serviceSelect.options).find(option => option.value === requestedService);
    if (matchingOption) serviceSelect.value = requestedService;
}

if (requestedEnquiry === 'call') {
    const contactFormElement = document.getElementById('contact-form');
    const phoneField = document.getElementById('contact-phone');
    const contactPreference = document.getElementById('contact-preference');
    const callRequiredLabel = document.querySelector('[data-call-required]');
    const messageField = document.getElementById('contact-message');
    const contactEyebrow = document.querySelector('#contact .contact-copy .eyebrow');
    const contactHeading = document.querySelector('#contact .contact-copy h2');
    const contactIntro = document.querySelector('#contact .contact-copy p');
    const messageLabel = document.querySelector('label[for="contact-message"]');
    const submitButton = document.querySelector('#contact-form button[type="submit"]');

    if (contactFormElement) contactFormElement.dataset.enquiryType = 'call';
    if (phoneField) phoneField.required = true;
    if (contactPreference) contactPreference.value = 'Phone call';
    if (callRequiredLabel) callRequiredLabel.textContent = '(required for a call)';
    const extraDetails = document.querySelector('#contact-form .contact-extra');
    if (extraDetails) extraDetails.open = true;
    if (contactEyebrow) contactEyebrow.textContent = 'Request a call';
    if (contactHeading) contactHeading.textContent = 'Choose a suitable time to talk.';
    if (contactIntro) contactIntro.textContent = 'Leave your contact details and a little context. We will email or call you to confirm a free 15-minute conversation.';
    if (messageLabel) messageLabel.textContent = 'What would you like to discuss?';
    if (submitButton) submitButton.textContent = 'Request My Call';
    if (messageField && !messageField.value) {
        messageField.placeholder = 'Tell us briefly what you would like to discuss.';
    }
}

document.querySelectorAll('[data-enquiry-service]').forEach(link => {
    link.addEventListener('click', () => {
        if (serviceSelect) serviceSelect.value = link.dataset.enquiryService || '';
    });
});

const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('contact-form-status');
const contactPreference = document.getElementById('contact-preference');
const contactPhone = document.getElementById('contact-phone');
const contactPhoneGroup = contactPhone?.closest('.contact-phone-field');
const contactPhoneNote = document.querySelector('[data-call-required]');
let enquirySavedWithoutNotification = false;

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
        source: 'website_project_enquiry'
    };

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

        if (!response.ok) throw new Error(result.error || 'The enquiry could not be sent.');

        if (result.notificationSent === false) {
            enquirySavedWithoutNotification = true;
            showFormStatus(result.message || `Your details were saved, but the notification failed. Please email Lockdownstudio021@gmail.com and quote ${result.reference}. Do not submit again.`, 'error');
        } else {
            contactForm.reset();
            syncPhonePreference();
            showFormStatus(
                payload.enquiryType === 'call'
                    ? 'Thank you. Your call request has been emailed to the studio.'
                    : 'Thank you. Your project enquiry has been emailed to the studio.',
                'success'
            );
        }
    } catch (error) {
        showFormStatus(`${error.message} You can also email Lockdownstudio021@gmail.com.`, 'error');
    } finally {
        if (submitButton) {
            submitButton.disabled = enquirySavedWithoutNotification;
            submitButton.textContent = enquirySavedWithoutNotification ? 'Enquiry saved' : originalLabel;
        }
    }
});

// Luna offers guided site answers in static previews and live AI when the server gate is ready.
import('./assistant.js?v=3').catch(() => {});

// Vercel Web Analytics records aggregate page views and referrers; no form data is sent.
if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    const analytics = document.createElement('script');
    analytics.defer = true;
    analytics.src = '/_vercel/insights/script.js';
    document.head.append(analytics);
}
