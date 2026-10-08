import { analyticsConfigured, pagePath, referrerHost, supabaseEndpoint, supabaseHeaders } from './_analytics.js';
import { rateLimit, requireJson, requireSameOrigin, setApiSecurityHeaders } from './_security.js';

export default async function handler(req, res) {
    setApiSecurityHeaders(res);
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    if (!requireSameOrigin(req, res) || !requireJson(req, res, 512)) return;
    if (!analyticsConfigured()) return res.status(204).end();
    if (!rateLimit(req, res, { namespace: 'site-pageview', limit: 60, windowMs: 60 * 60_000 })) return;

    const path = pagePath(req.body?.path);
    const fromPath = pagePath(req.body?.fromPath) || null;
    const referrer = referrerHost(req.body?.referrer);
    if (!path) return res.status(400).json({ error: 'Unknown page' });
    const siteHosts = new Set(['lockdownstudios.com', 'www.lockdownstudios.com', String(req.headers?.host || '').split(':')[0].toLowerCase()]);
    const externalHost = referrer && !siteHosts.has(referrer) ? referrer : null;

    try {
        const result = await fetch(supabaseEndpoint('/rest/v1/site_pageviews'), {
            method: 'POST', headers: supabaseHeaders({ Prefer: 'return=minimal' }),
            body: JSON.stringify({ path, from_path: fromPath, referrer_host: externalHost }),
            signal: AbortSignal.timeout(5_000)
        });
        if (!result.ok) return res.status(503).json({ error: 'Tracking unavailable' });
        return res.status(204).end();
    } catch {
        return res.status(503).json({ error: 'Tracking unavailable' });
    }
}
