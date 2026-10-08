const countdown = document.querySelector('[data-drift-countdown]');

if (countdown) {
    const target = Date.parse(countdown.dataset.target);
    const parts = {
        days: countdown.querySelector('[data-days]'),
        hours: countdown.querySelector('[data-hours]'),
        minutes: countdown.querySelector('[data-minutes]'),
        seconds: countdown.querySelector('[data-seconds]')
    };
    const status = countdown.querySelector('[data-countdown-status]');

    function updateCountdown() {
        const remaining = Math.max(0, target - Date.now());
        const totalSeconds = Math.floor(remaining / 1000);
        parts.days.textContent = String(Math.floor(totalSeconds / 86_400));
        parts.hours.textContent = String(Math.floor(totalSeconds % 86_400 / 3_600)).padStart(2, '0');
        parts.minutes.textContent = String(Math.floor(totalSeconds % 3_600 / 60)).padStart(2, '0');
        parts.seconds.textContent = String(totalSeconds % 60).padStart(2, '0');
        status.textContent = remaining > 0
            ? 'Countdown to the current development target in South Africa time.'
            : 'The target date has arrived. Check back for a confirmed release update.';
    }

    if (Number.isFinite(target)) {
        updateCountdown();
        window.setInterval(updateCountdown, 1000);
    }
}

const feedbackForm = document.getElementById('drift-feedback-form');

if (feedbackForm) {
    const status = document.getElementById('drift-feedback-status');
    const submit = feedbackForm.querySelector('button[type="submit"]');

    feedbackForm.addEventListener('submit', async event => {
        event.preventDefault();
        let savedWithoutEmail = false;
        const fields = new FormData(feedbackForm);
        const ratingValue = fields.get('rating');
        const rating = ratingValue ? Number(ratingValue) : null;
        const liked = fields.get('liked') === 'on';
        const comment = String(fields.get('comment') || '').trim();
        const alias = String(fields.get('alias') || '').trim();
        if (rating === null && !liked && !comment) {
            status.textContent = 'Choose a rating, like the prototype or leave a comment first.';
            return;
        }

        submit.disabled = true;
        status.textContent = 'Sending feedback…';
        try {
            const response = await fetch('/api/save-game-feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ game: 'drift-protocol', rating, liked, comment, alias, website: fields.get('website') || '' })
            });
            const result = await response.json();
            if (!response.ok || !result.success) throw new Error(result.error || 'Submission failed');
            savedWithoutEmail = result.notificationSent === false;
            if (result.notificationSent !== false) feedbackForm.reset();
            status.textContent = result.notificationSent === false
                ? `Feedback saved, but our email alert failed. Please email Lockdownstudio021@gmail.com and quote ${result.reference}.`
                : 'Thank you. Your feedback has been sent privately to the development team.';
        } catch {
            status.textContent = 'Feedback could not be sent right now. Please try later or email Lockdownstudio021@gmail.com.';
        } finally {
            if (!savedWithoutEmail) submit.disabled = false;
        }
    });
}
