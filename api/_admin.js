import { createHash } from 'node:crypto';
import { get } from '@vercel/blob';

export const ADMIN_COOKIE = 'ls_admin';

export function adminEmails() {
    return new Set((process.env.ADMIN_EMAILS || process.env.GMAIL_USER || '')
        .split(',').map(value => value.trim().toLowerCase()).filter(Boolean));
}

export function adminConfigured() {
    return Boolean(process.env.ADMIN_ENABLED === 'true' && process.env.BLOB_READ_WRITE_TOKEN && process.env.GMAIL_USER
        && process.env.GMAIL_APP_PASSWORD && adminEmails().size);
}

export function adminToken(req) {
    const raw = req.headers?.cookie || '';
    const match = raw.match(/(?:^|;\s*)ls_admin=([a-f0-9]{64})(?:;|$)/);
    return match?.[1] || '';
}

export function adminSessionPath(token) {
    if (!/^[a-f0-9]{64}$/.test(token)) return '';
    return `admin/sessions/${createHash('sha256').update(token).digest('hex')}.json`;
}

export async function readAdmin(req) {
    if (!adminConfigured()) return null;
    const path = adminSessionPath(adminToken(req));
    if (!path) return null;
    try {
        const result = await get(path, { access: 'private', useCache: false });
        if (!result || result.statusCode !== 200 || !result.stream) return null;
        const session = JSON.parse(await new Response(result.stream).text());
        if (!adminEmails().has(session.email) || !Number.isFinite(session.expiresAt)
            || session.expiresAt <= Date.now()) return null;
        return session.email;
    } catch {
        return null;
    }
}

export function setAdminCookie(res, token, maxAge) {
    const parts = [`${ADMIN_COOKIE}=${token}`, 'HttpOnly', 'Secure', 'SameSite=Strict', 'Path=/', `Max-Age=${maxAge}`];
    res.setHeader('Set-Cookie', parts.join('; '));
}
