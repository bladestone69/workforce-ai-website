import { get, list } from '@vercel/blob';
import { adminConfigured, readAdmin } from './_admin.js';
import { setApiSecurityHeaders } from './_security.js';

export function leadReferenceFromPath(pathname) {
    // Blob may append a mixed-case random suffix before .json when saving a lead.
    const match = /^leads\/\d{4}-\d{2}-\d{2}\/([a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12})(?:-[A-Za-z0-9]{6,32})?\.json$/.exec(pathname);
    return match?.[1] || '';
}

async function readLead(blob) {
    const reference = leadReferenceFromPath(blob.pathname);
    if (blob.size > 32_768 || !reference) return null;
    try {
        const result = await get(blob.pathname, { access: 'private' });
        if (!result || result.statusCode !== 200 || !result.stream) return null;
        const lead = JSON.parse(await new Response(result.stream).text());
        return {
            reference,
            receivedAt: lead.receivedAt || blob.uploadedAt,
            name: lead.name || '', email: lead.email || '', phone: lead.phone || '',
            company: lead.company || '', contactPreference: lead.contactPreference || '',
            bestTime: lead.bestTime || '', enquiryType: lead.enquiryType || 'project',
            service: lead.service || '', message: lead.message || '', source: lead.source || '',
            testingConsent: lead.testingConsent === true
        };
    } catch {
        return null;
    }
}

export default async function handler(req, res) {
    setApiSecurityHeaders(res);
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (!adminConfigured()) return res.status(503).json({ error: 'Studio access is not configured' });
    if (!await readAdmin(req)) return res.status(401).json({ error: 'Studio sign-in required' });
    try {
        const metadata = [];
        let cursor;
        let hasMore = false;
        for (let page = 0; page < 4; page++) {
            const result = await list({ prefix: 'leads/', limit: 250, cursor });
            metadata.push(...result.blobs);
            hasMore = result.hasMore;
            if (!hasMore || !result.cursor) break;
            cursor = result.cursor;
        }
        const selected = metadata.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)).slice(0, 60);
        const leads = [];
        for (let index = 0; index < selected.length; index += 10) {
            leads.push(...(await Promise.all(selected.slice(index, index + 10).map(readLead))).filter(Boolean));
        }
        return res.status(200).json({ leads, showing: leads.length, moreThanShown: hasMore || metadata.length > selected.length });
    } catch {
        return res.status(503).json({ error: 'Enquiries are temporarily unavailable' });
    }
}
