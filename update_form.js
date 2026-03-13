const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf-8');

const targetHtml = `                <div style="text-align: center;">
                    <p style="font-size: 1.1rem; color: var(--color-text-secondary); margin-bottom: 2rem;">
                        Whether you need a game, 3D assets, a website, an app, or an AI avatar - we've got you covered.
                        Based in South Africa, serving clients worldwide.
                    </p>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                        <a href="mailto:Admin@Lockdownstudio.com" class="btn-primary btn-large"
                            style="text-decoration: none;">
                            Send Email
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </a>
                        <a href="tel:0107532383" class="btn-outline btn-large" style="text-decoration: none;">
                            Call Us
                        </a>
                    </div>
                </div>`;

const replaceHtml = `                <div style="text-align: center;">
                    <p style="font-size: 1.1rem; color: var(--color-text-secondary); margin-bottom: 2rem;">
                        Whether you need a game, 3D assets, a website, an app, or an AI avatar - we've got you covered.
                        Based in South Africa, serving clients worldwide.
                    </p>
                    <div style="max-width: 500px; margin: 0 auto; background: rgba(99, 102, 241, 0.05); padding: 2rem; border-radius: 1rem; text-align: left;">
                        <h4 style="font-size: 1.25rem; margin-bottom: 1.5rem; text-align: center; font-weight: 600;">Leave your details</h4>
                        <form id="contact-form" style="display: flex; flex-direction: column; gap: 1rem;">
                            <div>
                                <label for="contact-name" style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--color-text-secondary);">Name</label>
                                <input type="text" id="contact-name" name="name" required style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--color-border); background: var(--color-bg-darker); color: var(--color-text-primary); outline: none;">
                            </div>
                            <div>
                                <label for="contact-email" style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--color-text-secondary);">Email</label>
                                <input type="email" id="contact-email" name="email" required style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--color-border); background: var(--color-bg-darker); color: var(--color-text-primary); outline: none;">
                            </div>
                            <div>
                                <label for="contact-phone" style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--color-text-secondary);">Phone (Optional)</label>
                                <input type="tel" id="contact-phone" name="phone" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--color-border); background: var(--color-bg-darker); color: var(--color-text-primary); outline: none;">
                            </div>
                            <div>
                                <label for="contact-message" style="display: block; margin-bottom: 0.5rem; font-size: 0.9rem; color: var(--color-text-secondary);">Message (Optional)</label>
                                <textarea id="contact-message" name="message" rows="4" style="width: 100%; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid var(--color-border); background: var(--color-bg-darker); color: var(--color-text-primary); resize: vertical; outline: none;"></textarea>
                            </div>
                            <button type="submit" class="btn-primary" style="justify-content: center; margin-top: 0.5rem;">
                                Submit Details
                            </button>
                            <div id="contact-form-message" style="display: none; text-align: center; margin-top: 1rem; font-size: 0.9rem; font-weight: 500;"></div>
                        </form>
                    </div>
                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-top: 2rem;">
                        <a href="mailto:Admin@Lockdownstudio.com" class="btn-outline btn-large" style="text-decoration: none;">
                            Email Us
                        </a>
                        <a href="tel:0107532383" class="btn-outline btn-large" style="text-decoration: none;">
                            Call Us
                        </a>
                    </div>
                </div>`;

const targetHtmlRegex = new RegExp(targetHtml.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*'));
if (targetHtmlRegex.test(indexHtml)) {
    indexHtml = indexHtml.replace(targetHtmlRegex, replaceHtml);
    fs.writeFileSync('index.html', indexHtml, 'utf-8');
    console.log("Updated index.html");
} else {
    console.log("Could not find target in index.html");
}

let scriptJs = fs.readFileSync('script.js', 'utf-8');

const targetJs = `// Form validation and interaction (for future forms)
const handleFormSubmit = (formId, callback) => {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (callback) callback(new FormData(form));
        });
    }
};`;

const replaceJs = `// Form validation and interaction (for future forms)
const handleFormSubmit = (formId, callback) => {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (callback) callback(new FormData(form));
        });
    }
};

// Contact Form submission handling
const contactForm = document.getElementById('contact-form');
const contactFormMessage = document.getElementById('contact-form-message');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerText;
        submitBtn.innerText = 'Submitting...';
        submitBtn.disabled = true;
        
        const formData = new FormData(contactForm);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            message: formData.get('message'),
            source: 'contact_form'
        };
        
        try {
            const response = await fetch('/api/save-lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            let result = {};
            try {
                result = await response.json();
            } catch (err) {}
            
            contactFormMessage.style.display = 'block';
            if (response.ok && (result.success || !result.error)) {
                contactFormMessage.style.color = '#10B981'; 
                contactFormMessage.innerText = 'Thank you! Your details have been saved.';
                contactForm.reset();
            } else {
                contactFormMessage.style.color = '#EF4444'; 
                contactFormMessage.innerText = result.error || 'Failed to submit. Please try again later.';
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            contactFormMessage.style.display = 'block';
            contactFormMessage.style.color = '#EF4444';
            contactFormMessage.innerText = 'An error occurred. Please try again later.';
        } finally {
            submitBtn.innerText = originalBtnText;
            submitBtn.disabled = false;
        }
    });
}`;

const targetJsRegex = new RegExp(targetJs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s*'));
if (targetJsRegex.test(scriptJs)) {
    scriptJs = scriptJs.replace(targetJsRegex, replaceJs);
    fs.writeFileSync('script.js', scriptJs, 'utf-8');
    console.log("Updated script.js");
} else {
    // If not found via regex precisely, append to bottom
    if (!scriptJs.includes('contact-form')) {
        scriptJs += "\n" + replaceJs.substring(replaceJs.indexOf('// Contact Form submission'));
        fs.writeFileSync('script.js', scriptJs, 'utf-8');
        console.log("Appended to script.js");
    } else {
        console.log("Script.js already updated");
    }
}
