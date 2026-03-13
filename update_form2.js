const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf-8');

const targetHtml = `<div style="text-align: center;">\n                    <p style="font-size: 1.1rem; color: var(--color-text-secondary); margin-bottom: 2rem;">\n                        Whether you need a game, 3D assets, a website, an app, or an AI avatar - we've got you covered.\n                        Based in South Africa, serving clients worldwide.\n                    </p>\n                    <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">\n                        <a href="mailto:Admin@Lockdownstudio.com" class="btn-primary btn-large"\n                            style="text-decoration: none;">\n                            Send Email\n                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">\n                                <path d="M7.5 15L12.5 10L7.5 5" stroke="currentColor" stroke-width="2"\n                                    stroke-linecap="round" stroke-linejoin="round" />\n                            </svg>\n                        </a>\n                        <a href="tel:0107532383" class="btn-outline btn-large" style="text-decoration: none;">\n                            Call Us\n                        </a>\n                    </div>\n                </div>`;

const targetHtmlCRLF = targetHtml.replace(/\n/g, '\r\n');

const replaceHtml = `<div style="text-align: center;">
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

if (indexHtml.includes(targetHtml)) {
    fs.writeFileSync('index.html', indexHtml.replace(targetHtml, replaceHtml), 'utf-8');
    console.log("Updated index.html (LF)");
} else if (indexHtml.includes(targetHtmlCRLF)) {
    fs.writeFileSync('index.html', indexHtml.replace(targetHtmlCRLF, replaceHtml), 'utf-8');
    console.log("Updated index.html (CRLF)");
} else {
    console.log("Could not find target in index.html");
}

let scriptJs = fs.readFileSync('script.js', 'utf-8');

const targetJs = `// Form validation and interaction (for future forms)\nconst handleFormSubmit = (formId, callback) => {\n    const form = document.getElementById(formId);\n    if (form) {\n        form.addEventListener('submit', (e) => {\n            e.preventDefault();\n            if (callback) callback(new FormData(form));\n        });\n    }\n};`;
const targetJsCRLF = targetJs.replace(/\n/g, '\r\n');

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

if (scriptJs.includes(targetJs)) {
    fs.writeFileSync('script.js', scriptJs.replace(targetJs, replaceJs), 'utf-8');
    console.log("Updated script.js (LF)");
} else if (scriptJs.includes(targetJsCRLF)) {
    fs.writeFileSync('script.js', scriptJs.replace(targetJsCRLF, replaceJs), 'utf-8');
    console.log("Updated script.js (CRLF)");
} else {
    // Append to end if not found exactly
    if (!scriptJs.includes('contact-form')) {
        fs.writeFileSync('script.js', scriptJs + "\n" + replaceJs.substring(replaceJs.indexOf('// Contact Form submission')), 'utf-8');
        console.log("Appended to script.js");
    } else {
        console.log("Script.js already updated");
    }
}
