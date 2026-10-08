import assert from 'node:assert/strict';
import test from 'node:test';

import chat from '../api/assistant-chat.js';
import status from '../api/assistant-status.js';
import { guidedAnswer } from '../luna-answers.js';

function response() {
    return {
        statusCode: 200,
        headers: {},
        payload: undefined,
        setHeader(name, value) { this.headers[name] = value; },
        status(code) { this.statusCode = code; return this; },
        json(payload) { this.payload = payload; return this; }
    };
}

function request(message = 'What do you build?') {
    return {
        method: 'POST',
        headers: {
            origin: 'https://www.lockdownstudios.com',
            'content-type': 'application/json',
            'x-forwarded-for': '203.0.113.30'
        },
        body: { message }
    };
}

test('assistant is off until enabled with a server key and model', () => {
    const res = response();
    status({ method: 'GET' }, res);
    assert.equal(res.payload.enabled, false);
    assert.equal(res.headers['Cache-Control'], 'no-store');
});

test('guided Luna gives bounded approved answers without a provider', () => {
    assert.match(guidedAnswer('How much does a website cost?').text, /R12,500/);
    assert.equal(guidedAnswer('Can you make a game?').href, 'games-interactive.html');
    assert.equal(guidedAnswer('How do I get a quote?').href, 'index.html#contact');
    assert.match(guidedAnswer('Will you guarantee my launch date?').text, /specific quote|availability|technical decision/);
});

test('disabled chat fails closed', async () => {
    const res = response();
    await chat(request(), res);
    assert.equal(res.statusCode, 503);
});

test('chat rejects cross-origin traffic before provider access', async () => {
    const res = response();
    const req = request();
    req.headers.origin = 'https://attacker.example';
    await chat(req, res);
    assert.equal(res.statusCode, 403);
});

test('chat validates question length', async () => {
    const old = { enabled: process.env.ASSISTANT_ENABLED, key: process.env.XAI_CHAT_API_KEY, model: process.env.XAI_CHAT_MODEL };
    process.env.ASSISTANT_ENABLED = 'true';
    process.env.XAI_CHAT_API_KEY = 'test-key';
    process.env.XAI_CHAT_MODEL = 'test-model';
    try {
        const res = response();
        await chat(request('x'), res);
        assert.equal(res.statusCode, 400);
    } finally {
        if (old.enabled === undefined) delete process.env.ASSISTANT_ENABLED; else process.env.ASSISTANT_ENABLED = old.enabled;
        if (old.key === undefined) delete process.env.XAI_CHAT_API_KEY; else process.env.XAI_CHAT_API_KEY = old.key;
        if (old.model === undefined) delete process.env.XAI_CHAT_MODEL; else process.env.XAI_CHAT_MODEL = old.model;
    }
});

test('chat sends only server-owned context and returns a bounded answer', async () => {
    const old = { enabled: process.env.ASSISTANT_ENABLED, key: process.env.XAI_CHAT_API_KEY, model: process.env.XAI_CHAT_MODEL, fetch: globalThis.fetch };
    process.env.ASSISTANT_ENABLED = 'true';
    process.env.XAI_CHAT_API_KEY = 'test-key';
    process.env.XAI_CHAT_MODEL = 'test-model';
    let sent;
    globalThis.fetch = async (url, options) => {
        sent = { url, options };
        return { ok: true, json: async () => ({ choices: [{ message: { content: 'We build websites, games, 3D and AI tools.' } }] }) };
    };
    try {
        const res = response();
        await chat(request('What do you build?'), res);
        assert.equal(res.statusCode, 200);
        assert.match(res.payload.answer, /websites/);
        assert.equal(sent.url, 'https://api.x.ai/v1/chat/completions');
        const body = JSON.parse(sent.options.body);
        assert.equal(body.messages.length, 2);
        assert.equal(body.messages[1].content, 'What do you build?');
        assert.match(body.messages[0].content, /Approved facts/);
    } finally {
        if (old.enabled === undefined) delete process.env.ASSISTANT_ENABLED; else process.env.ASSISTANT_ENABLED = old.enabled;
        if (old.key === undefined) delete process.env.XAI_CHAT_API_KEY; else process.env.XAI_CHAT_API_KEY = old.key;
        if (old.model === undefined) delete process.env.XAI_CHAT_MODEL; else process.env.XAI_CHAT_MODEL = old.model;
        globalThis.fetch = old.fetch;
    }
});
