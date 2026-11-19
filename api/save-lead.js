import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { sendLeadNotification } from './_email.js';
import {
    cleanString,
    rateLimit,
    requireJson,
    requireMethod,
    requireSameOrigin,
    setApiSecurityHeaders
} from './_security.js';

const WEBSITE_PACKAGES = new Map([
    ['starter', 'Starter Improvement'],
    ['rescue', 'Website Rescue'],
    ['new-site', 'New Business Website'],
    ['unsure', 'Not sure yet']
]);

export const createLeadHandler = (store = put, notify = sendLeadNotification) => async function handler(req, res) {
    setApiSecurityHeaders(res);
    if (!requireMethod(req, res, 'POST')) return;
    if (!requireSameOrigin(req, res)) return;
    if (!requireJson(req, res, 16_384)) return;
    if (!rateLimit(req, res, { namespace: 'save-lead', limit: 5, windowMs: 10 * 60_000 })) return;

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(503).json({ error: 'Lead storage is not configured' });
    }
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        return res.status(503).json({ error: 'Enquiry email is not configured' });
    }

    const lead = {
        name: cleanString(req.body?.name, 120),
        email: cleanString(req.body?.email, 254),
        phone: cleanString(req.body?.phone, 40),
        company: cleanString(req.body?.company, 160),
        contactPreference: cleanString(req.body?.contactPreference, 40),
        bestTime: cleanString(req.body?.bestTime, 160),
        enquiryType: cleanString(req.body?.enquiryType, 20) || 'project',
        message: cleanString(req.body?.message, 4_000),
        service: cleanString(req.body?.service, 120),
        source: cleanString(req.body?.source, 80) || 'website',
        testingConsent: req.body?.testingConsent === true,
        sessionId: cleanString(req.body?.sessionId, 120),
        receivedAt: new Date().toISOString()
    };

    if (lead.enquiryType === 'spriteforge') {
        if (req.body?.launchConsent !== true) return res.status(400).json({error:'Consent required for launch updates'});
        Object.assign(lead, {service:'SpriteForge Studio', source:'spriteforge_preorder', contactPreference:'Email',
            message:'Requested SpriteForge launch notification. No purchase or payment.', launchConsent:true, consentVersion:'spriteforge-launch-v1'});
    }
    const isCall = lead.enquiryType === 'call';
    const requestedOffer = cleanString(req.body?.offer, 40);
    const isNovember = requestedOffer === 'black-friday' && lead.service === 'Website' &&
        ['project', 'call'].includes(lead.enquiryType);
    const isLuna = requestedOffer === 'luna-launch' && lead.service === 'Luna' && lead.enquiryType === 'project';
    const isNovemberQuote = isNovember && !isCall;
    if (isNovember || isLuna) lead.offer = requestedOffer;
    if (isNovemberQuote) {
        const packageId = cleanString(req.body?.websitePackage, 30);
        if (!WEBSITE_PACKAGES.has(packageId)) {
            return res.status(400).json({ error: 'Select a website option or choose Not sure yet' });
        }
        lead.websitePackage = WEBSITE_PACKAGES.get(packageId);
    }

    if (isCall) {
        lead.contactPreference = 'Phone call';
        if (!lead.name) return res.status(400).json({ error: 'Name is required for a callback' });
        if (!lead.service) lead.service = 'Other';
    } else if (!lead.name || !lead.email || (!isNovemberQuote && !lead.message) || !lead.service) {
        return res.status(400).json({ error: 'Name, email, service, and project details are required' });
    }
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
        return res.status(400).json({ error: 'Enter a valid email address' });
    }
    if ((lead.enquiryType === 'call' || ['Phone call', 'WhatsApp'].includes(lead.contactPreference)) && !lead.phone) {
        return res.status(400).json({ error: 'A phone number is required for phone or WhatsApp contact' });
    }
    if (lead.enquiryType === 'testing' && !lead.testingConsent) {
        return res.status(400).json({ error: 'Consent is required for testing pool signups' });
    }

    const reference = randomUUID();
    try {
        await store(
            `leads/${lead.receivedAt.slice(0, 10)}/${reference}.json`,
            JSON.stringify(lead),
            {
                access: 'private',
                addRandomSuffix: true,
                contentType: 'application/json'
            }
        );
    } catch {
        return res.status(503).json({ error: 'The enquiry could not be saved. Please email us directly.' });
    }

    try {
        await notify(lead, reference);
        return res.status(201).json({ success: true, reference, notificationSent: true });
    } catch {
        // The private lead record exists, but the studio may not see it until email is restored.
        return res.status(202).json({
            success: true,
            reference,
            notificationSent: false,
            message: `Your details were saved, but our email notification failed. Please email info@lockdownstudios.com and quote ${reference}. Do not submit the form again.`
        });
    }
};
export default createLeadHandler();
