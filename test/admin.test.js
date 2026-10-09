import assert from 'node:assert/strict';
import test from 'node:test';

import { adminConfigured, adminEmails, adminSessionPath, adminToken, setAdminCookie } from '../api/_admin.js';
import adminAuth from '../api/admin-auth.js';
import adminLeads, { leadReferenceFromPath } from '../api/admin-leads.js';

function response() {
    return {
        statusCode: 200, headers: {}, payload: undefined,
        setHeader(name, value) { this.headers[name] = value; },
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.payload = payload; return this; }
    };
}

function withAdminEnvironment(callback) {
    const keys = ['ADMIN_ENABLED', 'BLOB_READ_WRITE_TOKEN', 'GMAIL_USER', 'GMAIL_APP_PASSWORD', 'ADMIN_EMAILS'];
    const prior = Object.fromEntries(keys.map(key => [key, process.env[key]]));
    process.env.ADMIN_ENABLED = 'false';
    process.env.BLOB_READ_WRITE_TOKEN = 'test-token';
    process.env.GMAIL_USER = 'Studio@Example.com';
    process.env.GMAIL_APP_PASSWORD = 'test-password';
    delete process.env.ADMIN_EMAILS;
    return Promise.resolve().then(callback).finally(() => {
        for (const key of keys) {
            if (prior[key] === undefined) delete process.env[key];
            else process.env[key] = prior[key];
        }
    });
}

test('admin requires an explicit enabled flag and studio configuration', async () => {
    await withAdminEnvironment(() => {
        assert.equal(adminConfigured(), false);
        process.env.ADMIN_ENABLED = 'true';
        assert.equal(adminConfigured(), true);
        assert.deepEqual([...adminEmails()], ['studio@example.com']);
        delete process.env.GMAIL_APP_PASSWORD;
        assert.equal(adminConfigured(), false);
    });
});

test('admin session cookie is strict, secure, and not readable by scripts', () => {
    const res = response();
    setAdminCookie(res, 'a'.repeat(64), 600);
    assert.match(res.headers['Set-Cookie'], /HttpOnly; Secure; SameSite=Strict; Path=\/; Max-Age=600/);
    assert.equal(adminToken({ headers: { cookie: `other=x; ls_admin=${'a'.repeat(64)}; last=y` } }), 'a'.repeat(64));
    assert.equal(adminToken({ headers: { cookie: 'ls_admin=bad' } }), '');
    assert.equal(adminSessionPath('bad'), '');
    assert.match(adminSessionPath('a'.repeat(64)), /^admin\/sessions\/[a-f0-9]{64}\.json$/);
});

test('private enquiry API fails closed while admin is disabled', async () => {
    await withAdminEnvironment(async () => {
        const res = response();
        await adminLeads({ method: 'GET', headers: {} }, res);
        assert.equal(res.statusCode, 503);
        assert.equal(res.headers['Cache-Control'], 'no-store');
    });
});

test('admin accepts private lead filenames with Vercel Blob suffixes', () => {
    const reference = 'e5e44d0a-9bde-4ed4-bf6b-3a423baec783';
    assert.equal(leadReferenceFromPath(`leads/2026-10-08/${reference}.json`), reference);
    assert.equal(leadReferenceFromPath(`leads/2026-10-08/${reference}-NoOVGDVcqSPc7VYCUAGnTzLTG2qEM2.json`), reference);
    assert.equal(leadReferenceFromPath(`leads/2026-10-08/${reference}-x.json`), '');
    assert.equal(leadReferenceFromPath(`public/${reference}.json`), '');
});

test('admin sign-in fails closed while admin is disabled', async () => {
    await withAdminEnvironment(async () => {
        const res = response();
        await adminAuth({ method: 'POST', headers: {
            origin: 'https://www.lockdownstudios.com',
            'content-type': 'application/json'
        }, body: { action: 'request', email: 'studio@example.com' } }, res);
        assert.equal(res.statusCode, 503);
    });
});
