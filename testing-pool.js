const testingForm = document.getElementById('testing-pool-form');

if (testingForm) {
    const status = document.getElementById('testing-pool-status');
    const submit = testingForm.querySelector('button[type="submit"]');

    testingForm.addEventListener('submit', async event => {
        event.preventDefault();
        let savedWithoutEmail = false;
        if (!testingForm.reportValidity()) return;
        const fields = new FormData(testingForm);
        const name = String(fields.get('name') || '').trim();
        const email = String(fields.get('email') || '').trim();
        const platform = String(fields.get('platform') || '').trim();
        const device = String(fields.get('device') || '').trim();
        const consent = fields.get('consent') === 'on';
        if (!name || !email || !platform || !consent) return;

        submit.disabled = true;
        status.textContent = 'Sending your details…';
        try {
            const response = await fetch('/api/save-lead', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    email,
                    enquiryType: 'testing',
                    service: 'Mobile game testing pool',
                    source: 'games_testing_pool',
                    testingConsent: true,
                    message: `Mobile platform: ${platform}\nDevice: ${device || 'Not supplied'}\nConsent: Contact me about mobile game testing.`
                })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || 'Could not submit your details.');
            savedWithoutEmail = result.notificationSent === false;
            if (result.notificationSent !== false) testingForm.reset();
            status.textContent = result.notificationSent === false
                ? `Your details were saved, but our email alert failed. Please email Lockdownstudio021@gmail.com and quote ${result.reference}.`
                : 'Thanks! You are on our testing interest list. We’ll email if a suitable test opens.';
        } catch {
            status.textContent = 'We could not submit your details. Please email Lockdownstudio021@gmail.com with “Mobile testing pool” in the subject.';
        } finally {
            if (!savedWithoutEmail) submit.disabled = false;
        }
    });
}
