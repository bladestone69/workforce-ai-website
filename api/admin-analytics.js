import { adminConfigured, readAdmin } from './_admin.js';
import { analyticsConfigured, supabaseEndpoint, supabaseHeaders } from './_analytics.js';
import { setApiSecurityHeaders } from './_security.js';

export default async function handler(req, res) {
    setApiSecurityHeaders(res);
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!adminConfigured()) return res.status(503).json({ error: 'Studio access is not configured' });
    if (!await readAdmin(req)) return res.status(401).json({ error: 'Studio sign-in required' });
    if (!analyticsConfigured()) return res.status(200).json({ configured: false });
    try {
        const result = await fetch(supabaseEndpoint('/rest/v1/rpc/site_analytics_summary'), {
            method: 'POST', headers: supabaseHeaders(), body: JSON.stringify({ days_back: 30 }),
            signal: AbortSignal.timeout(7_000)
        });
        if (!result.ok) return res.status(503).json({ error: 'Visit report unavailable' });
        return res.status(200).json({ configured: true, report: await result.json() });
    } catch {
        return res.status(503).json({ error: 'Visit report unavailable' });
    }
}
