import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const exists = file => existsSync(new URL(`../${file}`, import.meta.url));

test('real asset pack renders are locally previewable without substituting concept art', () => {
    const page = read('3d-models.html');
    const gallery = read('asset-gallery.js');
    assert.doesNotMatch(page, /Landing Site Essentials|landing-site\//);
    assert.match(page, /We do not have matching preview artwork/);
    assert.match(page, /id="asset-preview-dialog"/);
    assert.equal((page.match(/data-asset-preview="/g) || []).length, 5);
    assert.match(gallery, /showModal\(\)/);
    assert.match(gallery, /ArrowRight/);
    for (const [slug, count] of [['lamps', 5], ['bedroom', 2], ['fighters', 7], ['scrubs', 2], ['dining', 4]]) {
        assert.match(page, new RegExp(`data-asset-preview="${slug}"`));
        for (let number = 1; number <= count; number++) {
            assert.ok(exists(`images/assets/packs/${slug}-${String(number).padStart(2, '0')}.webp`), slug);
        }
    }
});

test('game detail galleries use the supplied game captures', () => {
    for (const [file, prefix] of [['world-war-toonz.html', 'wwt'], ['emoji-match.html', 'emoji']]) {
        const page = read(file);
        assert.match(page, /studio-game-gallery-grid/);
        for (const number of prefix === 'wwt' ? ['01', '05', '09'] : ['02', '03', '06']) {
            const image = `images/studio/gameplay/${prefix}-${number}.webp`;
            assert.match(page, new RegExp(image.replaceAll('.', '\\.')));
            assert.ok(exists(image));
        }
    }
});
