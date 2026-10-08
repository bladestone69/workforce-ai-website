/* Single-level web adaptation of the user-supplied Drift Protocol prototype.
   Keeps its zero-G thrust, momentum, wall bounce, three gates and dock goal. */
const demo = document.querySelector('[data-drift-demo]');

if (demo) {
    const canvas = demo.querySelector('[data-drift-canvas]');
    const ctx = canvas.getContext('2d');
    const startButton = demo.querySelector('[data-drift-start]');
    const message = demo.querySelector('[data-drift-message]');
    const timeLabel = demo.querySelector('[data-drift-time]');
    const bestLabel = demo.querySelector('[data-drift-best]');
    const W = 900;
    const H = 500;
    const R = 9;
    const THRUST = 0.28;
    const MAX_SPEED = 7.5;
    const BOUNCE = 0.44;
    const GREEN = '#78e8ef';
    const keys = new Set();
    const gates = [
        { x: 220, y: 0, w: 18, h: 260, hint: '↓' },
        { x: 440, y: 240, w: 18, h: 260, hint: '↑' },
        { x: 640, y: 0, w: 18, h: 260, hint: '↓' }
    ];
    const goal = { x: 820, y: 170, w: 55, h: 160 };
    let player = { x: 52, y: 300, vx: 0, vy: 0 };
    let trail = [];
    let passed = [false, false, false];
    let state = 'ready';
    let startedAt = 0;
    let elapsed = 0;
    let lastFrame = 0;
    let collisions = 0;
    let best = null;
    try {
        const stored = Number(localStorage.getItem('lockdown:drift-demo:best'));
        if (stored > 0 && Number.isFinite(stored)) best = stored;
    } catch { /* local storage is optional */ }

    const format = seconds => seconds == null ? '—' : `${seconds.toFixed(2)}s`;
    bestLabel.textContent = `Best ${format(best)}`;

    function reset() {
        player = { x: 52, y: 300, vx: 0, vy: 0 };
        trail = [];
        passed = [false, false, false];
        collisions = 0;
        startedAt = 0;
        elapsed = 0;
        keys.clear();
        state = 'playing';
        startButton.textContent = 'Restart run';
        timeLabel.textContent = '0.00s';
        message.textContent = 'Thrust through all three gates, then dock at the teal goal.';
        canvas.focus({ preventScroll: true });
    }

    function bounceRect(rect) {
        const closestX = Math.max(rect.x, Math.min(player.x, rect.x + rect.w));
        const closestY = Math.max(rect.y, Math.min(player.y, rect.y + rect.h));
        let dx = player.x - closestX;
        let dy = player.y - closestY;
        let distance = Math.hypot(dx, dy);
        let penetration;
        if (distance >= R) return;
        if (distance < 0.001) {
            const sides = [
                { d: player.x - rect.x, x: -1, y: 0 },
                { d: rect.x + rect.w - player.x, x: 1, y: 0 },
                { d: player.y - rect.y, x: 0, y: -1 },
                { d: rect.y + rect.h - player.y, x: 0, y: 1 }
            ];
            const nearest = sides.sort((a, b) => a.d - b.d)[0];
            dx = nearest.x;
            dy = nearest.y;
            distance = 1;
            penetration = nearest.d + R + 0.5;
        }
        const nx = dx / distance;
        const ny = dy / distance;
        player.x += nx * (penetration ?? (R - distance + 0.5));
        player.y += ny * (penetration ?? (R - distance + 0.5));
        const impact = player.vx * nx + player.vy * ny;
        if (impact < 0) {
            player.vx = (player.vx - 2 * impact * nx) * BOUNCE;
            player.vy = (player.vy - 2 * impact * ny) * BOUNCE;
            if (Math.abs(impact) > 1.5) collisions += 1;
        }
    }

    function update(now, delta) {
        if (state !== 'playing') return;
        const up = keys.has('up');
        const down = keys.has('down');
        const left = keys.has('left');
        const right = keys.has('right');
        if (!startedAt && (up || down || left || right)) startedAt = now;
        if (!startedAt) return;
        elapsed += delta / 60;
        timeLabel.textContent = format(elapsed);
        if (up) player.vy -= THRUST * delta;
        if (down) player.vy += THRUST * delta;
        if (left) player.vx -= THRUST * delta;
        if (right) player.vx += THRUST * delta;
        const speed = Math.hypot(player.vx, player.vy);
        if (speed > MAX_SPEED) {
            player.vx *= MAX_SPEED / speed;
            player.vy *= MAX_SPEED / speed;
        }
        player.x += player.vx * delta;
        player.y += player.vy * delta;
        player.x = Math.max(R, Math.min(W - R, player.x));
        player.y = Math.max(R, Math.min(H - R, player.y));
        if (player.x === R || player.x === W - R) player.vx *= -BOUNCE;
        if (player.y === R || player.y === H - R) player.vy *= -BOUNCE;
        gates.forEach(bounceRect);
        gates.forEach((gate, index) => {
            if (!passed[index] && player.x > gate.x + gate.w + R) passed[index] = true;
        });
        trail.unshift({ x: player.x, y: player.y });
        if (trail.length > 70) trail.pop();
        if (player.x + R > goal.x && player.x - R < goal.x + goal.w && player.y + R > goal.y && player.y - R < goal.y + goal.h) {
            state = 'complete';
            keys.clear();
            const newBest = best == null || elapsed < best;
            if (newBest) {
                best = elapsed;
                bestLabel.textContent = `Best ${format(best)}`;
                try { localStorage.setItem('lockdown:drift-demo:best', String(best)); } catch { /* optional */ }
            }
            message.textContent = `Docked in ${format(elapsed)} with ${collisions} hard collision${collisions === 1 ? '' : 's'}. ${newBest ? 'New best!' : 'Replay for a faster time.'}`;
            startButton.textContent = 'Replay level';
        }
    }

    function draw(now) {
        ctx.fillStyle = '#08151c';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(120,232,239,.075)';
        for (let x = 25; x < W; x += 28) for (let y = 25; y < H; y += 28) ctx.fillRect(x, y, 2, 2);
        ctx.strokeStyle = 'rgba(120,232,239,.12)';
        ctx.strokeRect(12, 12, W - 24, H - 24);
        ctx.fillStyle = 'rgba(120,232,239,.12)';
        ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
        ctx.strokeStyle = GREEN;
        ctx.lineWidth = 2;
        ctx.strokeRect(goal.x, goal.y, goal.w, goal.h);
        ctx.fillStyle = GREEN;
        ctx.font = '700 20px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('DOCK', goal.x + goal.w / 2, goal.y + goal.h / 2);
        gates.forEach((gate, index) => {
            ctx.fillStyle = passed[index] ? 'rgba(120,232,239,.15)' : '#17303a';
            ctx.fillRect(gate.x, gate.y, gate.w, gate.h);
            ctx.strokeStyle = passed[index] ? GREEN : '#4d7880';
            ctx.strokeRect(gate.x, gate.y, gate.w, gate.h);
            ctx.fillStyle = passed[index] ? GREEN : '#a3d5d8';
            ctx.font = '19px monospace';
            ctx.fillText(gate.hint, gate.x + gate.w / 2, gate.y === 0 ? gate.h + 24 : gate.y - 12);
        });
        trail.forEach((point, index) => {
            ctx.fillStyle = `rgba(120,232,239,${(1 - index / trail.length) * .4})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, Math.max(.6, 3.8 * (1 - index / trail.length)), 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.shadowColor = GREEN;
        ctx.shadowBlur = 18;
        ctx.fillStyle = '#08151c';
        ctx.beginPath(); ctx.arc(player.x, player.y, R, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = GREEN; ctx.lineWidth = 2; ctx.stroke();
        ctx.fillStyle = GREEN;
        ctx.beginPath(); ctx.arc(player.x, player.y, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#a7d1d5';
        ctx.font = '700 18px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`ECHO-7  /  GATES ${passed.filter(Boolean).length}/3`, 20, 33);
        if (state !== 'playing' || !startedAt) {
            ctx.fillStyle = 'rgba(5,17,24,.78)';
            ctx.fillRect(0, 0, W, H);
            ctx.fillStyle = GREEN;
            ctx.textAlign = 'center';
            ctx.font = '900 60px "Space Grotesk", sans-serif';
            ctx.fillText(state === 'complete' ? 'SIMULATION COMPLETE' : 'DRIFT PROTOCOL', W / 2, H / 2 - 10);
            ctx.fillStyle = '#d5eced';
            ctx.font = '21px monospace';
            ctx.fillText(state === 'complete' ? 'REPLAY TO BEAT YOUR TIME' : 'START · WASD / ARROWS / TOUCH DRAG', W / 2, H / 2 + 25);
        }
    }

    function frame(now) {
        const delta = Math.min(2, (now - (lastFrame || now)) / (1000 / 60));
        lastFrame = now;
        if (!document.hidden) {
            update(now, delta);
            draw(now);
        }
        requestAnimationFrame(frame);
    }

    const keyDirections = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right', w: 'up', a: 'left', s: 'down', d: 'right' };
    canvas.addEventListener('keydown', event => {
        const direction = keyDirections[event.key.toLowerCase()];
        if (!direction) return;
        event.preventDefault();
        keys.add(direction);
    });
    window.addEventListener('keyup', event => {
        const direction = keyDirections[event.key.toLowerCase()];
        if (direction) keys.delete(direction);
    });
    window.addEventListener('blur', () => keys.clear());
    startButton.addEventListener('click', reset);
    let touchOrigin = null;
    const touchDirections = ['up', 'down', 'left', 'right'];
    function clearTouch() {
        touchOrigin = null;
        touchDirections.forEach(direction => keys.delete(direction));
    }
    canvas.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse') return;
        event.preventDefault();
        canvas.setPointerCapture(event.pointerId);
        touchOrigin = { x: event.clientX, y: event.clientY };
    });
    canvas.addEventListener('pointermove', event => {
        if (!touchOrigin) return;
        touchDirections.forEach(direction => keys.delete(direction));
        const dx = event.clientX - touchOrigin.x;
        const dy = event.clientY - touchOrigin.y;
        if (Math.abs(dx) > 12) keys.add(dx > 0 ? 'right' : 'left');
        if (Math.abs(dy) > 12) keys.add(dy > 0 ? 'down' : 'up');
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) canvas.addEventListener(type, clearTouch);
    requestAnimationFrame(frame);
}
