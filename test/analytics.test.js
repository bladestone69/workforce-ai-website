import assert from 'node:assert/strict';
import test from 'node:test';
import { analyticsConfigured, pagePath, referrerHost } from '../api/_analytics.js';
import trackPage from '../api/track-page.js';
import adminAnalytics from '../api/admin-analytics.js';

function response() {
    return {
        statusCode: 200, headers: {}, payload: undefined,
        setHeader(name, value) { this.headers[name] = value; },
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.payload = payload; return this; },
        end() { return this; }
    };
}

test('visit paths are allowlisted and query strings are never saved', () => {
    assert.equal(pagePath('/index.html'), '/index');
    assert.equal(pagePath('/services'), '/services');
    assert.equal(pagePath('/examples/lodge.html'), '/examples/lodge');
    assert.equal(pagePath('/admin.html'), '');
    assert.equal(pagePath('/services?email=visitor@example.com'), '');
    assert.equal(pagePath('//evil.example'), '');
    assert.equal(referrerHost('https://example.org/path?private=value'), 'example.org');
    assert.equal(referrerHost('javascript:alert(1)'), '');
});

test('tracking remains off without explicit Supabase setup', async () => {
    const previous = process.env.SITE_ANALYTICS_ENABLED;
    delete process.env.SITE_ANALYTICS_ENABLED;
    try {
        assert.equal(analyticsConfigured(), false);
        const res = response();
        await trackPage({ method: 'POST', headers: {
            origin: 'https://www.lockdownstudios.com', 'content-type': 'application/json'
        }, body: { path: '/index.html' } }, res);
        assert.equal(res.statusCode, 204);
    } finally {
        if (previous === undefined) delete process.env.SITE_ANALYTICS_ENABLED;
        else process.env.SITE_ANALYTICS_ENABLED = previous;
    }
});

test('public tracking rejects cross-origin requests', async () => {
    const res = response();
    await trackPage({ method: 'POST', headers: {
        origin: 'https://attacker.example', 'content-type': 'application/json'
    }, body: { path: '/index.html' } }, res);
    assert.equal(res.statusCode, 403);
});

test('enabled tracking sends only bounded anonymous page fields to Supabase', async () => {
    const previous = {
        enabled: process.env.SITE_ANALYTICS_ENABLED,
        url: process.env.SUPABASE_URL,
        key: process.env.SUPABASE_SECRET_KEY,
        fetch: globalThis.fetch
    };
    process.env.SITE_ANALYTICS_ENABLED = 'true';
    process.env.SUPABASE_URL = 'https://example-project.supabase.co';
    process.env.SUPABASE_SECRET_KEY = 'sb_secret_test-only';
    let sent;
    globalThis.fetch = async (url, options) => {
        sent = { url, options };
        return { ok: true };
    };
    try {
        const res = response();
        await trackPage({ method: 'POST', headers: {
            origin: 'https://www.lockdownstudios.com', host: 'www.lockdownstudios.com',
            'content-type': 'application/json', 'x-forwarded-for': '203.0.113.77'
        }, body: {
            path: '/services.html', fromPath: '/index.html',
            referrer: 'https://search.example/private?visitor=1',
            email: 'must-not-be-saved@example.com'
        } }, res);
        assert.equal(res.statusCode, 204);
        assert.equal(sent.url, 'https://example-project.supabase.co/rest/v1/site_pageviews');
        assert.deepEqual(JSON.parse(sent.options.body), {
            path: '/services', from_path: '/index', referrer_host: 'search.example'
        });
        assert.equal(sent.options.headers.apikey, 'sb_secret_test-only');
    } finally {
        globalThis.fetch = previous.fetch;
        for (const [key, value] of [
            ['SITE_ANALYTICS_ENABLED', previous.enabled], ['SUPABASE_URL', previous.url],
            ['SUPABASE_SECRET_KEY', previous.key]
        ]) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});

test('visit reports require studio authentication before Supabase access', async () => {
    const res = response();
    await adminAnalytics({ method: 'GET', headers: {} }, res);
    assert.ok([401, 503].includes(res.statusCode));
    assert.equal(res.headers['Cache-Control'], 'no-store');
});
