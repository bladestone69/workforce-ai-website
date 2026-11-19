import assert from 'node:assert/strict';
import test from 'node:test';

import saveLead, { createLeadHandler } from '../api/save-lead.js';
import saveGameFeedback from '../api/save-game-feedback.js';
import { createGameFeedbackMessage, createLeadMessage } from '../api/_email.js';
import { requireJson, requireSameOrigin } from '../api/_security.js';

function response() {
    return {
        statusCode: 200,
        headers: {},
        payload: undefined,
        setHeader(name, value) {
            this.headers[name] = value;
        },
        status(code) {
            this.statusCode = code;
            return this;
        },
        json(payload) {
            this.payload = payload;
            return this;
        }
    };
}

function request(overrides = {}) {
    return {
        method: 'POST',
        headers: {
            origin: 'https://www.lockdownstudios.com',
            'content-type': 'application/json',
            'x-forwarded-for': '203.0.113.10'
        },
        body: {},
        ...overrides
    };
}

test('same-origin guard accepts the production site', () => {
    const res = response();
    assert.equal(requireSameOrigin(request(), res), true);
    assert.equal(res.statusCode, 200);
});

test('same-origin guard rejects an unapproved site', () => {
    const res = response();
    const req = request({ headers: { origin: 'https://attacker.example' } });
    assert.equal(requireSameOrigin(req, res), false);
    assert.equal(res.statusCode, 403);
});

test('JSON guard rejects non-JSON bodies', () => {
    const res = response();
    const req = request({ headers: { 'content-type': 'text/plain' } });
    assert.equal(requireJson(req, res), false);
    assert.equal(res.statusCode, 415);
});

test('lead storage fails closed without a private Blob connection', async () => {
    const original = process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    const res = response();
    await saveLead(request({ body: { name: 'Test visitor' } }), res);
    assert.equal(res.statusCode, 503);
    assert.deepEqual(res.payload, { error: 'Lead storage is not configured' });
    if (original === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
    else process.env.BLOB_READ_WRITE_TOKEN = original;
});

test('phone and WhatsApp enquiries require a reachable phone number', async () => {
    const previous = {
        blob: process.env.BLOB_READ_WRITE_TOKEN,
        user: process.env.GMAIL_USER,
        password: process.env.GMAIL_APP_PASSWORD
    };
    process.env.BLOB_READ_WRITE_TOKEN = 'test-only';
    process.env.GMAIL_USER = 'studio@example.com';
    process.env.GMAIL_APP_PASSWORD = 'test-only';
    try {
        for (const [index, preference] of ['Phone call', 'WhatsApp'].entries()) {
            const res = response();
            await saveLead(request({
                headers: {
                    origin: 'https://www.lockdownstudios.com',
                    'content-type': 'application/json',
                    'x-forwarded-for': `203.0.113.${20 + index}`
                },
                body: {
                    name: 'Test visitor',
                    email: 'visitor@example.com',
                    service: 'Website',
                    message: 'Please contact me',
                    contactPreference: preference
                }
            }), res);
            assert.equal(res.statusCode, 400);
            assert.match(res.payload.error, /phone number/i);
        }
    } finally {
        for (const [key, value] of Object.entries({
            BLOB_READ_WRITE_TOKEN: previous.blob,
            GMAIL_USER: previous.user,
            GMAIL_APP_PASSWORD: previous.password
        })) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});

test('campaign enquiry storage and studio notification work with minimal fields', async t => {
    for (const [key, value] of Object.entries({
        BLOB_READ_WRITE_TOKEN: 'test-only',
        GMAIL_USER: 'studio@example.com',
        GMAIL_APP_PASSWORD: 'test-only'
    })) {
        const previous = process.env[key];
        process.env[key] = value;
        t.after(() => {
            if (previous === undefined) delete process.env[key];
            else process.env[key] = previous;
        });
    }
    const stored = [];
    const mailed = [];
    const handler = createLeadHandler({
        save: async (_path, data, options) => {
            assert.equal(options.access, 'private');
            stored.push(JSON.parse(data));
        },
        notify: async (lead, reference) => {
            mailed.push(createLeadMessage(lead, reference));
            if (lead.name === 'Notification failure') throw new Error('Test-only SMTP failure');
        }
    });
    let ip = 100;
    async function submit(body) {
        const req = request({ body });
        req.headers['x-forwarded-for'] = `203.0.113.${ip++}`;
        const res = response();
        await handler(req, res);
        return res;
    }
    const call = { name: 'QA Callback', phone: '0123456789', service: 'Website', enquiryType: 'call', offer: 'black-friday' };
    const quote = { name: 'QA Quote', email: 'qa@example.com', service: 'Website', offer: 'black-friday', websitePackage: 'starter' };
    const aura = { name: 'QA Aura', email: 'qa@example.com', service: 'Aura', offer: 'aura-launch', message: 'Demo enquiry' };

    for (const payload of [call, quote, aura]) {
        const result = await submit(payload);
        assert.equal(result.statusCode, 201);
        assert.equal(result.payload.notificationSent, true);
    }
    assert.equal(stored[0].contactPreference, 'Phone call');
    assert.equal(stored[0].email, '');
    assert.equal(stored[0].message, '');
    assert.equal(mailed[0].replyTo, undefined);
    assert.match(mailed[0].html, /Call QA Callback at 0123456789\./);
    assert.equal(stored[1].websitePackage, 'Starter Improvement');
    assert.match(mailed[1].html, /Starter Improvement/);
    assert.match(mailed[2].subject, /Aura launch special/);

    for (const invalid of [
        { ...call, phone: '' },
        { ...call, email: 'not-an-email' },
        { ...quote, websitePackage: 'injected' },
        { ...quote, offer: '' },
        { ...quote, enquiryType: 'testing' }
    ]) assert.equal((await submit(invalid)).statusCode, 400);
    assert.equal(stored.length, 3);

    const savedWithoutMail = await submit({ ...call, name: 'Notification failure' });
    assert.equal(savedWithoutMail.statusCode, 202);
    assert.equal(savedWithoutMail.payload.notificationSent, false);
    assert.match(savedWithoutMail.payload.message, /Do not submit the form again/);
    assert.equal(stored.length, 4);
});

test('email notification targets the configured studio address and escapes lead details', () => {
    const originalUser = process.env.GMAIL_USER;
    const originalRecipient = process.env.CONTACT_TO_EMAIL;
    process.env.GMAIL_USER = 'Lockdownstudio021@gmail.com';
    process.env.CONTACT_TO_EMAIL = 'Lockdownstudio021@gmail.com';

    try {
        const message = createLeadMessage({
            name: '<Marcel>',
            email: 'visitor@example.com',
            phone: '0123456789',
            company: 'Example Lodge',
            contactPreference: 'Phone call',
            bestTime: 'Weekdays at 14:00',
            enquiryType: 'call',
            service: 'Website or web app',
            message: '<script>alert(1)</script>',
            receivedAt: '2026-09-17T10:00:00.000Z'
        }, 'lead-reference');

        assert.equal(message.to, 'Lockdownstudio021@gmail.com');
        assert.equal(message.replyTo, 'visitor@example.com');
        assert.match(message.subject, /Call request/);
        assert.doesNotMatch(message.html, /<script>/);
        assert.match(message.html, /&lt;script&gt;/);
    } finally {
        if (originalUser === undefined) delete process.env.GMAIL_USER;
        else process.env.GMAIL_USER = originalUser;
        if (originalRecipient === undefined) delete process.env.CONTACT_TO_EMAIL;
        else process.env.CONTACT_TO_EMAIL = originalRecipient;
    }
});

test('testing pool signups require explicit contact consent', async () => {
    const previous = {
        blob: process.env.BLOB_READ_WRITE_TOKEN,
        user: process.env.GMAIL_USER,
        password: process.env.GMAIL_APP_PASSWORD
    };
    process.env.BLOB_READ_WRITE_TOKEN = 'test-only';
    process.env.GMAIL_USER = 'studio@example.com';
    process.env.GMAIL_APP_PASSWORD = 'test-only';
    try {
        const res = response();
        await saveLead(request({ body: {
            name: 'Tester',
            email: 'tester@example.com',
            enquiryType: 'testing',
            service: 'Mobile game testing pool',
            message: 'Android device'
        } }), res);
        assert.equal(res.statusCode, 400);
        assert.match(res.payload.error, /Consent/);
    } finally {
        for (const [key, value] of Object.entries({
            BLOB_READ_WRITE_TOKEN: previous.blob,
            GMAIL_USER: previous.user,
            GMAIL_APP_PASSWORD: previous.password
        })) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});

test('testing pool email is clearly distinguished from project enquiries', () => {
    const message = createLeadMessage({
        name: 'Tester',
        email: 'tester@example.com',
        enquiryType: 'testing',
        testingConsent: true,
        service: 'Mobile game testing pool',
        message: 'Android',
        receivedAt: '2026-10-06T10:00:00.000Z'
    }, 'test-reference');
    assert.match(message.subject, /Mobile testing pool signup/);
    assert.match(message.html, /Testing contact consent/);
});

test('game feedback rejects cross-origin submissions', async () => {
    const res = response();
    await saveGameFeedback(request({ headers: {
        origin: 'https://attacker.example',
        'content-type': 'application/json'
    } }), res);
    assert.equal(res.statusCode, 403);
});

test('game feedback requires private storage before accepting input', async () => {
    const original = process.env.BLOB_READ_WRITE_TOKEN;
    delete process.env.BLOB_READ_WRITE_TOKEN;
    try {
        const res = response();
        await saveGameFeedback(request({ body: { game: 'drift-protocol', liked: true } }), res);
        assert.equal(res.statusCode, 503);
    } finally {
        if (original === undefined) delete process.env.BLOB_READ_WRITE_TOKEN;
        else process.env.BLOB_READ_WRITE_TOKEN = original;
    }
});

test('game feedback email escapes comments and is private to the studio', () => {
    const message = createGameFeedbackMessage({
        rating: 5,
        liked: true,
        alias: '<Tester>',
        comment: '<script>alert(1)</script>',
        receivedAt: '2026-10-06T10:00:00.000Z'
    }, 'feedback-reference');
    assert.equal(message.to, process.env.CONTACT_TO_EMAIL || process.env.GMAIL_USER || 'Lockdownstudio021@gmail.com');
    assert.match(message.subject, /Drift Protocol/);
    assert.doesNotMatch(message.html, /<script>/);
    assert.match(message.html, /&lt;script&gt;/);
});
