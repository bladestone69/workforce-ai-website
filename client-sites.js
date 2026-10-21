const clientCarousel = document.querySelector('[data-client-carousel]');

if (clientCarousel) {
    const showcase = clientCarousel.querySelector('.client-showcase');
    const cards = [...clientCarousel.querySelectorAll('[data-client-site]')];
    const count = clientCarousel.querySelector('[data-client-count]');
    const status = clientCarousel.querySelector('[data-client-status]');
    const arrangement = [...cards];

    const selectCard = (card, restoreFocus = false) => {
        const position = arrangement.indexOf(card);
        if (position !== 1) {
            [arrangement[1], arrangement[position]] = [arrangement[position], arrangement[1]];
            arrangement.forEach((item) => showcase.append(item));
        }
        cards.forEach((item) => {
            const isActive = item === arrangement[1];
            item.classList.toggle('is-active', isActive);
            const button = item.querySelector('[data-client-select]');
            button.setAttribute('aria-pressed', String(isActive));
            const siteName = item.querySelector('h3').textContent;
            button.setAttribute('aria-label', isActive ? `${siteName} preview selected` : `Select ${siteName} preview`);
            button.querySelector('span').textContent = isActive ? 'Selected preview' : 'Show preview';
        });
        const selectedIndex = cards.indexOf(arrangement[1]);
        count.textContent = `${String(selectedIndex + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
        status.textContent = `${arrangement[1].querySelector('h3').textContent} selected.`;
        if (restoreFocus) card.querySelector('[data-client-select]').focus({ preventScroll: true });
    };

    const step = (direction) => {
        const current = cards.indexOf(arrangement[1]);
        selectCard(cards[(current + direction + cards.length) % cards.length]);
    };

    clientCarousel.querySelector('[data-client-prev]').addEventListener('click', () => step(-1));
    clientCarousel.querySelector('[data-client-next]').addEventListener('click', () => step(1));
    cards.forEach((card) => card.querySelector('[data-client-select]').addEventListener('click', () => selectCard(card, true)));
    selectCard(arrangement[1]);
}
