import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const examples = [
    ['lodge.html', 'lodge.jpg'],
    ['trades.html', 'repairs.jpg'],
    ['practice.html', 'advisory.jpg']
];

for (const [page, photo] of examples) {
    test(`${page} is a complete, locally linked before-and-after demo`, () => {
        const file = path.join(root, 'examples', page);
        const html = fs.readFileSync(file, 'utf8');
        assert.match(html, /data-demo-view="before"/);
        assert.match(html, /data-demo-view="after"/);
        assert.match(html, /data-demo-version="before"/);
        assert.match(html, /data-demo-version="after"/);
        assert.match(html, /Fictional business/);
        assert.equal(html.split(`images/${photo}`).length - 1 >= 2, true);
        assert.equal(fs.existsSync(path.join(root, 'examples', 'images', photo)), true);
        for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
            const local = ref.split(/[?#]/)[0];
            if (!local || /^(?:https?:|mailto:|tel:)/.test(local)) continue;
            assert.equal(fs.existsSync(path.resolve(path.dirname(file), local)), true, `${page}: ${local}`);
        }
    });
}

test('3D service body does not inherit the legacy clipped image-container class', () => {
    const html = fs.readFileSync(path.join(root, '3d-animation.html'), 'utf8');
    assert.match(html, /class="ns-service-page service-three-d"/);
    assert.doesNotMatch(html, /class="ns-service-page service-visual"/);
});

test('Games hero has one replayable Drift Protocol level', () => {
    const html = fs.readFileSync(path.join(root, 'games-interactive.html'), 'utf8');
    const script = fs.readFileSync(path.join(root, 'drift-demo.js'), 'utf8');
    assert.match(html, /data-drift-demo/);
    assert.match(html, /data-drift-canvas/);
    assert.match(html, /drift-demo\.js/);
    assert.match(script, /ECHO-7|Echo-7|ECHO/);
    assert.equal((script.match(/hint:/g) || []).length, 3);
});

test('studio game cards and project pages share image-led presentation', () => {
    const games = fs.readFileSync(path.join(root, 'games-interactive.html'), 'utf8');
    assert.match(games, /class="game-wip-card" href="drift-protocol\.html"/);
    assert.match(games, /class="game-wip-card game-wip-card--pop"/);
    assert.match(games, /<h3>PopItUp<\/h3>/);
    assert.equal(fs.existsSync(path.join(root, 'images/studio/popitup-background.png')), true);
    assert.equal((games.match(/class="game-card-art"/g) || []).length, 3);
    for (const page of ['world-war-toonz.html', 'monster-match.html', 'emoji-match.html', 'drift-protocol.html']) {
        const html = fs.readFileSync(path.join(root, page), 'utf8');
        assert.match(html, /class="game-project-overlay"/);
        assert.match(html, /class="game-project-art/);
        assert.match(html, /work\.html#/);
    }
});

test('Projects catalogue routes owned work, demos and services to their relevant pages', () => {
    const html = fs.readFileSync(path.join(root, 'work.html'), 'utf8');
    const styles = fs.readFileSync(path.join(root, 'northstar.css'), 'utf8');
    assert.match(html, /class="page-hero services-hero project-index-hero"/);
    assert.doesNotMatch(html, /class="project-index-feature"/);
    for (const id of ['games', 'prototypes', 'demos', 'assets']) assert.match(html, new RegExp(`id="${id}"`));
    for (const href of ['world-war-toonz.html', 'monster-match.html', 'emoji-match.html', 'drift-protocol.html', '3d-models.html', 'examples/lodge.html', 'examples/trades.html', 'examples/practice.html']) {
        assert.match(html, new RegExp(`href="${href.replaceAll('.', '\\.')}"`));
    }
    assert.match(html, /fictional businesses/i);
    assert.match(html, /AI services ↗/);
    assert.match(html, /class="project-jump-external"/);
    assert.match(html, /rel="canonical" href="https:\/\/www\.lockdownstudios\.com\/work"/);
    assert.match(html, /href="privacy\.html">Privacy information/);
    assert.match(styles, /\.project-jump-links a \{[^}]*min-height: 44px/);
    assert.match(styles, /\.project-assets-grid figure \{ width: min\(100%, 420px\)/);
    for (const image of ['lodge.jpg', 'repairs.jpg', 'advisory.jpg']) {
        assert.match(html, new RegExp(`examples/images/${image}`));
        assert.equal(fs.existsSync(path.join(root, 'examples/images', image)), true);
    }
    assert.equal(fs.existsSync(path.join(root, 'images/studio/assets-render-wireframe.png')), true);
});

test('Projects navigation keeps a direct link and reveals category routes on hover or focus', () => {
    const script = fs.readFileSync(path.join(root, 'site.js'), 'utf8');
    const styles = fs.readFileSync(path.join(root, 'northstar.css'), 'utf8');
    assert.match(script, /querySelector\('a\[href="work\.html"\]'\)/);
    assert.match(script, /wrapper\.addEventListener\('pointerenter'/);
    assert.match(script, /wrapper\.addEventListener\('focusin'/);
    assert.match(script, /wrapper\.addEventListener\('keydown'/);
    assert.match(script, /\['Games', 'work\.html#games'\]/);
    assert.doesNotMatch(script, /\['All projects', 'work\.html'\]/);
    assert.match(styles, /\.nav-project-toggle \{ display: none;/);
    assert.match(styles, /\.nav-project-toggle\{display:block;width:auto\}/);
});

test('About provides concrete studio work and the shared privacy and social routes', () => {
    const html = fs.readFileSync(path.join(root, 'about.html'), 'utf8');
    assert.match(html, /rel="canonical" href="https:\/\/www\.lockdownstudios\.com\/about"/);
    assert.match(html, /property="og:image"/);
    assert.match(html, /href="privacy\.html">Privacy information/);
    for (const page of ['world-war-toonz.html', 'monster-match.html', 'drift-protocol.html']) {
        assert.match(html, new RegExp(`class="principle" href="${page.replaceAll('.', '\\.') }"`));
    }
    assert.match(html, /studio-owned projects, not examples presented as client results/i);
});

test('Contact prevents a duplicate submission when a lead was saved but email failed', () => {
    const script = fs.readFileSync(path.join(root, 'site.js'), 'utf8');
    assert.match(script, /if \(enquirySavedWithoutNotification\) return;/);
    assert.match(script, /if \(result\.notificationSent === false\) \{\s*enquirySavedWithoutNotification = true;/);
    assert.match(script, /submitButton\.disabled = enquirySavedWithoutNotification;/);
});

test('Drift Protocol page has its own art, playable course, date and private feedback form', () => {
    const html = fs.readFileSync(path.join(root, 'drift-protocol.html'), 'utf8');
    assert.match(html, /drift-protocol-hero\.png/);
    assert.equal(fs.existsSync(path.join(root, 'images/studio/drift-protocol-hero.png')), true);
    assert.match(html, /2027-01-31T00:00:00\+02:00/);
    assert.match(html, /data-drift-demo/);
    assert.match(html, /id="drift-feedback-form"/);
    assert.match(html, /comments are not published/);
});

test('Luna hero only enables chat through the server-gated assistant', () => {
    const html = fs.readFileSync(path.join(root, 'ai-automation.html'), 'utf8');
    const assistant = fs.readFileSync(path.join(root, 'assistant.js'), 'utf8');
    assert.match(html, /data-assistant-open disabled/);
    assert.match(assistant, /liveAvailable = Boolean/);
    assert.match(assistant, /guidedAnswer\(question\)/);
    assert.match(assistant, /heroTrigger\.disabled = false/);
});

test('Home and Services present five routes with privacy and social metadata', () => {
    const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const services = fs.readFileSync(path.join(root, 'services.html'), 'utf8');
    const constellation = fs.readFileSync(path.join(root, 'hero-constellation.js'), 'utf8');
    assert.match(home, /Five ways to work/);
    assert.match(services, /five clear routes/);
    assert.equal((home.match(/class="service-card"/g) || []).length, 5);
    assert.equal((services.match(/class="ns-services-card"/g) || []).length, 5);
    assert.equal((constellation.match(/\{ text: '[^']+', trail:/g) || []).length, 5);
    assert.match(home, /href="privacy\.html">Privacy information/);
    assert.match(home, /rel="canonical" href="https:\/\/www\.lockdownstudios\.com\/"/);
    assert.match(home, /property="og:image"/);
    assert.equal(fs.existsSync(path.join(root, 'images/social-preview.png')), true);
});

test('Services has balanced routes and a neutral app enquiry path', () => {
    const home = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
    const services = fs.readFileSync(path.join(root, 'services.html'), 'utf8');
    const styles = fs.readFileSync(path.join(root, 'northstar.css'), 'utf8');
    assert.match(home, /option value="App or digital tool"/);
    assert.match(services, /service=App%20or%20digital%20tool#contact/);
    assert.match(services, /rel="canonical" href="https:\/\/www\.lockdownstudios\.com\/services"/);
    assert.match(services, /property="og:image"/);
    assert.match(services, /href="privacy\.html">Privacy information/);
    assert.match(styles, /\.services-page \.ns-services-card \{ grid-column: span 2; \}/);
    assert.doesNotMatch(styles, /\.services-page \.ns-services-card:last-child \{ grid-column: 1 \/ -1; \}/);
    assert.match(styles, /@media\(max-width:900px\) \{\s*\.assistant-launcher/);
});
