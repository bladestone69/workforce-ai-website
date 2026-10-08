import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const secondaryPages = [
    'websites-apps', 'apps', 'games-interactive', '3d-animation', 'ai-automation',
    'world-war-toonz', 'monster-match', 'emoji-match', 'drift-protocol', '3d-models'
];

test('secondary pages use the shared public head and privacy footer', () => {
    for (const slug of secondaryPages) {
        const html = read(`${slug}.html`);
        assert.match(html, new RegExp(`rel="canonical" href="https://www\\.lockdownstudios\\.com/${slug}"`), slug);
        assert.match(html, /property="og:image"/, slug);
        assert.match(html, /rel="icon" href="images\/logo-mark\.png"/, slug);
        assert.match(html, /<footer[^>]*>[\s\S]*?<a href="privacy\.html">Privacy information<\/a>/, slug);
    }
});

test('secondary contact routes use valid neutral form options', () => {
    assert.doesNotMatch(read('apps.html'), /service=Web%20app#contact/);
    assert.match(read('apps.html'), /service=App%20or%20digital%20tool#contact/);
    assert.doesNotMatch(read('3d-models.html'), /service=3D%20art%20and%20visuals#contact/);
    assert.match(read('3d-models.html'), /service=3D%20or%20animation#contact/);
});

test('privacy notice is public and reflects guided-only Luna and manual retention', () => {
    const html = read('privacy.html');
    assert.doesNotMatch(html, /noindex|Draft for owner review|implementation draft/);
    assert.match(html, /Live AI chat is off for launch/);
    assert.match(html, /at least every 12 months/);
    assert.match(read('SECURITY_DEPLOYMENT.md'), /not an automatic expiry feature/);
});

test('public studio pages avoid redundant location copy', () => {
    for (const file of ['index.html', 'services.html', 'work.html', 'about.html', ...secondaryPages.map(slug => `${slug}.html`)]) {
        assert.doesNotMatch(read(file), /Johannesburg/i, file);
    }
    assert.match(read('index.html'), /images\/social-preview-clean\.png/);
});
