import { guidedAnswer } from './luna-answers.js';

// Text-only website concierge. No chat transcript is persisted by this UI.
async function startWebsiteAssistant() {
    let liveAvailable = false;
    try {
        const response = await fetch('/api/assistant-status', { cache: 'no-store' });
        if (response.ok) liveAvailable = Boolean((await response.json())?.enabled);
    } catch {
        // Static previews have no API. Luna remains available as a guided site-facts helper.
    }

    const launcher = document.createElement('button');
    launcher.type = 'button';
    launcher.className = 'assistant-launcher';
    launcher.textContent = 'Ask Luna';
    launcher.setAttribute('aria-controls', 'website-assistant');
    launcher.setAttribute('aria-expanded', 'false');

    const panel = document.createElement('section');
    panel.id = 'website-assistant';
    panel.className = 'assistant-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Luna, Lockdown Studios AI assistant');
    panel.hidden = true;

    const header = document.createElement('div');
    header.className = 'assistant-head';
    const title = document.createElement('div');
    title.textContent = 'Luna · Lockdown Studios';
    const modeBadge = document.createElement('span');
    modeBadge.className = 'assistant-mode';
    modeBadge.textContent = liveAvailable ? 'Live AI' : 'Guided answers';
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.setAttribute('aria-label', 'Close assistant');
    header.append(title, modeBadge, close);

    const log = document.createElement('div');
    log.className = 'assistant-log';
    log.setAttribute('role', 'log');
    log.setAttribute('aria-live', 'polite');
    log.setAttribute('aria-relevant', 'additions text');

    function addMessage(text, role, link) {
        const item = document.createElement('p');
        item.className = `assistant-message assistant-${role}`;
        item.textContent = text;
        if (link?.href) {
            const destination = document.createElement('a');
            destination.href = link.href;
            destination.textContent = link.label;
            item.append(document.createElement('br'), destination);
        }
        log.appendChild(item);
        log.scrollTop = log.scrollHeight;
    }
    addMessage(liveAvailable
        ? 'Hi, I’m Luna, the studio’s AI guide. I can explain our services and starting website prices. A person will confirm any quote or project details.'
        : 'Hi, I’m Luna in guided mode. I can share approved site facts about our services and prices, but I’m not generating live AI replies in this preview. A person will confirm any quote.', 'bot');

    const suggestions = document.createElement('div');
    suggestions.className = 'assistant-suggestions';
    for (const question of ['Which website option fits me?', 'Can you make a game?', 'How do I get a quote?']) {
        const suggestion = document.createElement('button');
        suggestion.type = 'button';
        suggestion.textContent = question;
        suggestions.appendChild(suggestion);
    }

    const form = document.createElement('form');
    form.className = 'assistant-form';
    const label = document.createElement('label');
    label.htmlFor = 'assistant-question';
    label.textContent = 'Your question';
    const input = document.createElement('input');
    input.id = 'assistant-question';
    input.name = 'question';
    input.maxLength = 500;
    input.required = true;
    input.autocomplete = 'off';
    input.placeholder = 'Ask about our services…';
    const send = document.createElement('button');
    send.type = 'submit';
    send.textContent = 'Send';
    form.append(label, input, send);

    const foot = document.createElement('p');
    foot.className = 'assistant-foot';
    foot.append('Please do not enter private details in chat. ');
    const human = document.createElement('a');
    human.href = 'index.html#contact';
    human.textContent = 'Talk to a person';
    const privacy = document.createElement('a');
    privacy.href = 'privacy.html';
    privacy.textContent = 'Privacy';
    foot.append(human, ' · ', privacy);
    panel.append(header, log, suggestions, form, foot);
    document.body.append(launcher, panel);

    const heroTrigger = document.querySelector('[data-assistant-open]');
    const heroStatus = document.querySelector('[data-luna-status]');
    const heroNote = document.querySelector('[data-luna-note]');
    if (heroTrigger) {
        heroTrigger.disabled = false;
        heroTrigger.addEventListener('click', () => setOpen(true, heroTrigger));
    }
    if (heroStatus) heroStatus.textContent = liveAvailable ? 'Live AI ready' : 'Guided mode ready';
    if (heroNote) heroNote.textContent = liveAvailable
        ? 'Text chat only. Please do not share private details.'
        : 'Guided site answers are available. Live AI needs server configuration. Please do not share private details.';

    let returnFocus = launcher;
    function setOpen(open, trigger = launcher) {
        if (open) returnFocus = trigger;
        panel.hidden = !open;
        launcher.setAttribute('aria-expanded', String(open));
        if (open) input.focus();
        else returnFocus.focus();
    }
    launcher.addEventListener('click', () => setOpen(panel.hidden));
    close.addEventListener('click', () => setOpen(false));
    panel.addEventListener('keydown', event => {
        if (event.key === 'Escape') setOpen(false);
    });
    suggestions.addEventListener('click', event => {
        if (event.target instanceof HTMLButtonElement) {
            input.value = event.target.textContent || '';
            input.focus();
        }
    });
    form.addEventListener('submit', async event => {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const question = input.value.trim();
        if (question.length < 2) return;
        addMessage(question, 'user');
        input.value = '';
        if (!liveAvailable) {
            const answer = guidedAnswer(question);
            addMessage(answer.text, 'bot', answer);
            return;
        }
        input.disabled = true;
        send.disabled = true;
        send.textContent = 'Thinking…';
        try {
            const response = await fetch('/api/assistant-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: question })
            });
            const result = await response.json();
            if (response.ok && typeof result.answer === 'string') addMessage(result.answer, 'bot');
            else throw new Error('Live assistant unavailable');
        } catch {
            liveAvailable = false;
            modeBadge.textContent = 'Guided answers';
            if (heroStatus) heroStatus.textContent = 'Guided mode ready';
            if (heroNote) heroNote.textContent = 'Live AI is unavailable; Luna can still guide you using approved site facts.';
            const answer = guidedAnswer(question);
            addMessage(`Live AI is unavailable right now. ${answer.text}`, 'bot', answer);
        } finally {
            input.disabled = false;
            send.disabled = false;
            send.textContent = 'Send';
            input.focus();
        }
    });
}

startWebsiteAssistant();
