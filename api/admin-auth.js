import { del, get, put } from '@vercel/blob';
import { createHash, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import nodemailer from 'nodemailer';
import { adminConfigured, adminEmails, adminSessionPath, adminToken, readAdmin, setAdminCookie } from './_admin.js';
import { cleanString, rateLimit, requireJson, requireSameOrigin, setApiSecurityHeaders } from './_security.js';

const CODE_LIFETIME_MS = 10 * 60_000;
const SESSION_LIFETIME_MS = 8 * 60 * 60_000;

function codeDigest(salt, code) {
    return createHash('sha256').update(`${salt}:${code}`).digest('hex');
}

function validCode(challenge, code) {
    if (!/^\d{8}$/.test(code) || !/^[a-f0-9]{64}$/.test(challenge?.digest || '')) return false;
    const expected = Buffer.from(challenge.digest, 'hex');
    const actual = Buffer.from(codeDigest(challenge.salt, code), 'hex');
    return timingSafeEqual(expected, actual);
}

async function sendCode(email, code) {
    const transport = nodemailer.createTransport({
        host: 'smtp.gmail.com', port: 465, secure: true,
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
        connectionTimeout: 8_000, greetingTimeout: 8_000, socketTimeout: 10_000
    });
    await transport.sendMail({
        from: `Lockdown Studios Website <${process.env.GMAIL_USER}>`, to: email,
        subject: 'Your Lockdown Studios admin sign-in code',
        text: `Your sign-in code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`
    });
}

export default async function handler(req, res) {
    setApiSecurityHeaders(res);
    if (req.method === 'GET') {
        const email = await readAdmin(req);
        return email ? res.status(200).json({ authenticated: true, email })
            : res.status(401).json({ authenticated: false });
    }
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!requireSameOrigin(req, res) || !requireJson(req, res, 2_048)) return;
    if (!adminConfigured()) return res.status(503).json({ error: 'Studio access is not configured' });

    const action = cleanString(req.body?.action, 20);
    if (action === 'logout') {
        const path = adminSessionPath(adminToken(req));
        if (path) {
            try { await del(path); }
            catch { return res.status(503).json({ error: 'Sign-out could not complete. Please retry.' }); }
        }
        setAdminCookie(res, '', 0);
        return res.status(200).json({ authenticated: false });
    }
    if (!rateLimit(req, res, { namespace: `admin-${action}`, limit: 5, windowMs: 15 * 60_000 })) return;
    const email = cleanString(req.body?.email, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email address' });

    if (action === 'request') {
        const challengeId = randomUUID();
        if (adminEmails().has(email)) {
            const code = String(randomInt(0, 100_000_000)).padStart(8, '0');
            const salt = randomBytes(16).toString('hex');
            const path = `admin/challenges/${challengeId}.json`;
            try {
                await put(path, JSON.stringify({ email, salt, digest: codeDigest(salt, code), expiresAt: Date.now() + CODE_LIFETIME_MS }), {
                    access: 'private', contentType: 'application/json', addRandomSuffix: false
                });
                await sendCode(email, code);
            } catch {
                await del(path).catch(() => {});
                return res.status(503).json({ error: 'A sign-in code could not be sent right now' });
            }
        }
        return res.status(200).json({ challengeId, message: 'If this address has studio access, a sign-in code has been sent.' });
    }

    if (action === 'verify') {
        const challengeId = cleanString(req.body?.challengeId, 60);
        const code = cleanString(req.body?.code, 8);
        if (!/^[a-f0-9-]{36}$/.test(challengeId)) return res.status(401).json({ error: 'Invalid or expired sign-in code' });
        const path = `admin/challenges/${challengeId}.json`;
        try {
            const result = await get(path, { access: 'private', useCache: false });
            if (!result || result.statusCode !== 200 || !result.stream) return res.status(401).json({ error: 'Invalid or expired sign-in code' });
            const challenge = JSON.parse(await new Response(result.stream).text());
            if (challenge.email !== email || !adminEmails().has(email) || challenge.expiresAt <= Date.now()
                || !validCode(challenge, code)) return res.status(401).json({ error: 'Invalid or expired sign-in code' });
            await del(path);
            const token = randomBytes(32).toString('hex');
            await put(adminSessionPath(token), JSON.stringify({ email, expiresAt: Date.now() + SESSION_LIFETIME_MS }), {
                access: 'private', contentType: 'application/json', addRandomSuffix: false
            });
            setAdminCookie(res, token, SESSION_LIFETIME_MS / 1000);
            return res.status(200).json({ authenticated: true, email });
        } catch {
            return res.status(503).json({ error: 'Studio sign-in is temporarily unavailable' });
        }
    }
    return res.status(400).json({ error: 'Unknown action' });
}
