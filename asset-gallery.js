const assetDialog = document.getElementById('asset-preview-dialog');

if (assetDialog) {
    const base = 'images/assets/packs/';
    const objects = {
        lamps: { name: 'Lamps Asset Pack', count: 5 },
        bedroom: { name: 'Bedroom Asset Pack', count: 2 },
        fighters: { name: 'UFC / MMA Fighter Pack', count: 7 },
        scrubs: { name: 'Medical Scrubs', count: 2 },
        dining: { name: 'Dining Table Set', count: 4 }
    };
    const title = document.getElementById('asset-preview-title');
    const image = document.getElementById('asset-preview-image');
    const caption = document.getElementById('asset-preview-caption');
    const angleList = document.getElementById('asset-preview-angles');
    const close = assetDialog.querySelector('[data-asset-close]');
    let activeObject = null;
    let activeIndex = 0;
    let opener = null;

    function showView(index) {
        if (!activeObject) return;
        activeIndex = (index + activeObject.count) % activeObject.count;
        const slug = Object.keys(objects).find(key => objects[key] === activeObject);
        image.src = `${base}${slug}-${String(activeIndex + 1).padStart(2, '0')}.webp`;
        image.alt = `${activeObject.name}, studio render ${activeIndex + 1} of ${activeObject.count}`;
        caption.textContent = `Studio render ${activeIndex + 1} of ${activeObject.count}`;
        for (const [buttonIndex, button] of [...angleList.children].entries()) {
            button.setAttribute('aria-pressed', String(buttonIndex === activeIndex));
        }
    }

    function openPreview(slug, button) {
        activeObject = objects[slug];
        if (!activeObject) return;
        opener = button;
        title.textContent = activeObject.name;
        angleList.replaceChildren();
        Array.from({ length: activeObject.count }, (_, index) => index).forEach(index => {
            const angle = document.createElement('button');
            angle.type = 'button';
            angle.textContent = String(index + 1);
            angle.setAttribute('aria-label', `Show render ${index + 1} of ${activeObject.name}`);
            angle.addEventListener('click', () => showView(index));
            angleList.append(angle);
        });
        showView(0);
        assetDialog.showModal();
        close.focus();
    }

    document.querySelectorAll('[data-asset-preview]').forEach(button => {
        button.addEventListener('click', () => openPreview(button.dataset.assetPreview, button));
    });
    close.addEventListener('click', () => assetDialog.close());
    assetDialog.addEventListener('click', event => {
        if (event.target === assetDialog) assetDialog.close();
    });
    assetDialog.addEventListener('keydown', event => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            showView(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });
    assetDialog.addEventListener('close', () => {
        image.removeAttribute('src');
        activeObject = null;
        opener?.focus();
    });
}
