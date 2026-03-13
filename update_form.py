import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

target_regex = re.compile(r'<\s*div\s+style="text-align:\s+center;"\s*>\s*<\s*p\s+style="font-size:\s+1\.1rem;\s+color:\s+var\(--color-text-secondary\);\s+margin-bottom:\s+2rem;"\s*>\s*Whether\s+you\s+need\s+a\s+game,\s+3D\s+assets,\s+a\s+website,\s+an\s+app,\s+or\s+an\s+AI\s+avatar\s+-\s+we\'ve\s+got\s+you\s+covered\.\s*Based\s+in\s+South\s+Africa,\s+serving\s+clients\s+worldwide\.\s*<\s*/p\s*>\s*<\s*div\s+style="display:\s+flex;\s+gap:\s+1rem;\s+justify-content:\s+center;\s+flex-wrap:\s+wrap;"\s*>\s*<\s*a\s+href="mailto:Admin@Lockdownstudio\.com"\s+class="btn-primary\s+btn-large"\s*style="text-decoration:\s+none;"\s*>\s*Send\s+Email\s*<\s*svg\s+width="20"\s+height="20"\s+viewBox="0\s+0\s+20\s+20"\s+fill="none"\s*>\s*<\s*path\s+d="M7\.5\s+15L12\.5\s+10L7\.5\s+5"\s+stroke="currentColor"\s+stroke-width="2"\s*stroke-linecap="round"\s+stroke-linejoin="round"\s*/\s*>\s*<\s*/svg\s*>\s*<\s*/a\s*>\s*<\s*a\s+href="tel:0107532383"\s+class="btn-outline\s+btn-large"\s+style="text-decoration:\s+none;"\s*>\s*Call\s+Us\s*<\s*/a\s*>\s*<\s*/div\s*>\s*<\s*/div\s*>', re.MULTILINE | re.IGNORECASE)

replacement = """                <div style="text-align: center;">
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
                </div>"""

new_content = target_regex.sub(replacement, content)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Updated index.html:", new_content != content)

with open('script.js', 'r', encoding='utf-8') as f:
    js_content = f.read()

js_target = r"""const handleFormSubmit = \(formId, callback\) => \{
    const form = document\.getElementById\(formId\);
    if \(form\) \{
        form\.addEventListener\('submit', \(e\) => \{
            e\.preventDefault\(\);
            if \(callback\) callback\(new FormData\(form\)\);
        \}\);
    \}
\};"""

js_replacement = """const handleFormSubmit = (formId, callback) => {
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
}"""

js_new_content = re.sub(js_target, js_replacement, js_content, flags=re.MULTILINE)
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(js_new_content)
print("Updated script.js:", js_new_content != js_content)
