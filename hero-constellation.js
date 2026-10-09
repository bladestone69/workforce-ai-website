// The supplied Lockdown Studios flame mark, interpreted as a field of stars.
// This is decorative: all five services remain available as ordinary links below.
const hero = document.querySelector('.northstar-hero');
const canvas = hero?.querySelector('[data-constellation]');
const context = canvas?.getContext('2d');

if (hero && canvas && context) {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobileView = window.matchMedia('(max-width: 640px)');

    // Coordinates are local to a tall, narrow mark on the right side of the hero.
    // The first trail follows the teal outer flame; the second follows its pale inner curl.
    const trails = [
        {
            color: [105, 232, 225],
            points: [
                [0.59, 0.02], [0.47, 0.08], [0.36, 0.17], [0.29, 0.29],
                [0.22, 0.35], [0.14, 0.31], [0.1, 0.24], [0.08, 0.34],
                [0.14, 0.45], [0.26, 0.54], [0.42, 0.62], [0.61, 0.72],
                [0.74, 0.84], [0.74, 0.96], [0.86, 0.89], [0.95, 0.77],
                [0.99, 0.63], [0.96, 0.49], [0.86, 0.36], [0.72, 0.23],
                [0.62, 0.13], [0.59, 0.02]
            ]
        },
        {
            color: [208, 236, 237],
            points: [
                [0.12, 0.45], [0.1, 0.57], [0.14, 0.7], [0.23, 0.82],
                [0.35, 0.91], [0.5, 0.97], [0.64, 0.98], [0.73, 0.94],
                [0.71, 0.85], [0.62, 0.77], [0.48, 0.7], [0.35, 0.64],
                [0.23, 0.55], [0.17, 0.46]
            ]
        },
        {
            color: [170, 214, 219],
            points: [[0.15, 0.75], [0.21, 0.87], [0.31, 0.95], [0.43, 0.99]]
        }
    ];

    const labels = [
        { text: 'WEBSITES', trail: 0, star: 2 },
        { text: 'APPS & DIGITAL TOOLS', trail: 0, star: 5 },
        { text: 'GAMES & INTERACTIVE', trail: 0, star: 7 },
        { text: '3D & ANIMATION', trail: 1, star: 5 },
        { text: 'AI & AUTOMATION', trail: 0, star: 17 }
    ];

    // A little extra depth around the mark, without drawing another fixed diagram.
    let seed = 72831;
    const random = () => {
        seed = (seed * 16807) % 2147483647;
        return (seed - 1) / 2147483646;
    };
    const backgroundStars = Array.from({ length: 54 }, () => ({
        x: random(),
        y: random(),
        size: 0.7 + random() * 1.2,
        alpha: 0.18 + random() * 0.37
    }));
    const nearbyStars = Array.from({ length: 66 }, () => ({
        x: -0.24 + random() * 1.48,
        y: -0.12 + random() * 1.24,
        size: 0.65 + random() * 1.05,
        alpha: 0.2 + random() * 0.35
    }));

    let width = 0;
    let height = 0;
    let mark = { left: 0, top: 0, width: 0, height: 0 };
    let activeLabel = -1;
    let pointer = null;
    let queued = false;
    let tapTimer;

    function coordinate([x, y]) {
        return [mark.left + x * mark.width, mark.top + y * mark.height];
    }

    function drawPath(trail, index) {
        trail.points.forEach((point, pointIndex) => {
            const [x, y] = coordinate(point);
            const namedStar = labels.some(label => label.trail === index && label.star === pointIndex);
            context.beginPath();
            context.arc(x, y, namedStar ? 2.9 : 1.55, 0, Math.PI * 2);
            context.fillStyle = `rgba(${trail.color.join(',')}, ${namedStar ? 0.88 : 0.58})`;
            context.fill();
            const next = trail.points[pointIndex + 1];
            if (next) {
                const [nextX, nextY] = coordinate(next);
                context.beginPath();
                context.arc((x + nextX) / 2, (y + nextY) / 2, 0.85, 0, Math.PI * 2);
                context.fillStyle = `rgba(${trail.color.join(',')}, 0.34)`;
                context.fill();
            }
        });
    }

    function drawConnections() {
        if (!pointer || reducedMotion.matches) return;
        const nearby = trails.flatMap(trail => trail.points.map(point => coordinate(point)))
            .map(([x, y]) => ({ x, y, distance: Math.hypot(x - pointer.x, y - pointer.y) }))
            .filter(star => star.distance < 160)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 4);
        nearby.forEach(star => {
            context.beginPath();
            context.moveTo(pointer.x, pointer.y);
            context.lineTo(star.x, star.y);
            context.lineWidth = 1;
            context.strokeStyle = `rgba(120, 232, 239, ${0.4 * (1 - star.distance / 160)})`;
            context.stroke();
        });
    }

    function drawLabel(label) {
        const [starX, starY] = coordinate(trails[label.trail].points[label.star]);
        const labelToLeft = starX > width * 0.78;
        const textWidth = context.measureText(label.text).width;
        const boxWidth = textWidth + 22;
        const boxX = labelToLeft ? starX - boxWidth - 18 : starX + 18;
        const boxY = Math.max(12, Math.min(height - 38, starY - 16));

        context.strokeStyle = 'rgba(135, 242, 239, 0.76)';
        context.lineWidth = 1;
        context.beginPath();
        context.arc(starX, starY, 10, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = 'rgba(7, 27, 35, 0.94)';
        context.fillRect(boxX, boxY, boxWidth, 30);
        context.strokeStyle = 'rgba(120, 232, 239, 0.7)';
        context.strokeRect(boxX + 0.5, boxY + 0.5, boxWidth - 1, 29);
        context.fillStyle = '#d8fbf8';
        context.fillText(label.text, boxX + 11, boxY + 19);
    }

    function draw() {
        queued = false;
        if (mobileView.matches) return;
        context.clearRect(0, 0, width, height);
        backgroundStars.forEach(star => {
            context.beginPath();
            context.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
            context.fillStyle = `rgba(185, 232, 235, ${star.alpha})`;
            context.fill();
        });
        nearbyStars.forEach(star => {
            const [x, y] = coordinate([star.x, star.y]);
            context.beginPath();
            context.arc(x, y, star.size, 0, Math.PI * 2);
            context.fillStyle = `rgba(171, 225, 230, ${star.alpha})`;
            context.fill();
        });
        trails.forEach(drawPath);
        drawConnections();
        if (activeLabel >= 0) {
            context.font = '700 11px "Space Grotesk", sans-serif';
            context.textBaseline = 'alphabetic';
            drawLabel(labels[activeLabel]);
        }
    }

    function scheduleDraw() {
        if (queued) return;
        queued = true;
        requestAnimationFrame(draw);
    }

    function resize() {
        if (mobileView.matches) {
            activeLabel = -1;
            pointer = null;
            return;
        }
        const bounds = hero.getBoundingClientRect();
        width = Math.max(1, bounds.width);
        height = Math.max(1, bounds.height);
        const scale = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        context.setTransform(scale, 0, 0, scale, 0, 0);

        const markHeight = Math.min(height * 0.81, width < 700 ? 360 : 520);
        mark = {
            width: markHeight * 0.67,
            height: markHeight,
            left: width - markHeight * 0.67 - Math.max(34, width * (width < 700 ? 0.09 : 0.115)),
            top: (height - markHeight) / 2
        };
        scheduleDraw();
    }

    function nearestLabel(x, y) {
        const threshold = window.innerWidth < 700 ? 48 : 75;
        let nearest = -1;
        let nearestDistance = threshold;
        labels.forEach((label, index) => {
            const [starX, starY] = coordinate(trails[label.trail].points[label.star]);
            const distance = Math.hypot(starX - x, starY - y);
            if (distance < nearestDistance) {
                nearest = index;
                nearestDistance = distance;
            }
        });
        return nearest;
    }

    hero.addEventListener('pointermove', event => {
        if (mobileView.matches || event.pointerType === 'touch') return;
        const bounds = hero.getBoundingClientRect();
        pointer = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
        const nextLabel = nearestLabel(pointer.x, pointer.y);
        activeLabel = nextLabel;
        scheduleDraw();
    }, { passive: true });

    hero.addEventListener('pointerleave', () => {
        activeLabel = -1;
        pointer = null;
        scheduleDraw();
    });

    hero.addEventListener('pointerdown', event => {
        if (mobileView.matches || event.pointerType !== 'touch') return;
        const bounds = hero.getBoundingClientRect();
        activeLabel = nearestLabel(event.clientX - bounds.left, event.clientY - bounds.top);
        pointer = null;
        scheduleDraw();
        clearTimeout(tapTimer);
        tapTimer = setTimeout(() => { activeLabel = -1; scheduleDraw(); }, 2500);
    }, { passive: true });

    reducedMotion.addEventListener('change', () => { activeLabel = -1; pointer = null; scheduleDraw(); });
    mobileView.addEventListener('change', resize);
    new ResizeObserver(resize).observe(hero);
}
