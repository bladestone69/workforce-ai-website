import { put } from '@vercel/blob';

function getTwilioConfig() {
    const enabled = String(process.env.LEAD_SMS_ENABLED || 'true').toLowerCase() !== 'false';
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    const toNumber = process.env.LEAD_SMS_TO;
    const timeoutMsRaw = Number(process.env.LEAD_SMS_TIMEOUT_MS || 10000);
    const timeoutMs = Number.isFinite(timeoutMsRaw) && timeoutMsRaw > 0 ? timeoutMsRaw : 10000;

    const hasSender = Boolean(fromNumber || messagingServiceSid);
    const configured = Boolean(enabled && accountSid && authToken && toNumber && hasSender);

    return {
        configured,
        enabled,
        accountSid,
        authToken,
        fromNumber,
        messagingServiceSid,
        toNumber,
        timeoutMs
    };
}

function buildLeadSmsBody(leadData) {
    const name = String(leadData?.name || 'Unknown').trim() || 'Unknown';
    return `New lead: ${name}`;
}

async function sendLeadSmsAlert({ leadData }) {
    const config = getTwilioConfig();
    if (!config.enabled || !config.configured) {
        return { attempted: false, sent: false, reason: 'Twilio SMS not configured' };
    }

    const controller = new AbortController();
    const timeoutHandle = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
        const form = new URLSearchParams();
        form.set('To', config.toNumber);
        form.set('Body', buildLeadSmsBody(leadData));

        if (config.messagingServiceSid) {
            form.set('MessagingServiceSid', config.messagingServiceSid);
        } else {
            form.set('From', config.fromNumber);
        }

        const authHeader = `Basic ${Buffer.from(`${config.accountSid}:${config.authToken}`).toString('base64')}`;

        const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(config.accountSid)}/Messages.json`,
            {
                method: 'POST',
                headers: {
                    Authorization: authHeader,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: form.toString(),
                signal: controller.signal
            }
        );

        const responseText = await response.text();
        let payload = null;
        try {
            payload = JSON.parse(responseText);
        } catch {
            payload = null;
        }

        if (!response.ok) {
            const errorMessage = payload?.message || responseText || response.statusText;
            throw new Error(`Twilio SMS failed: ${response.status} ${errorMessage}`);
        }

        return {
            attempted: true,
            sent: true,
            sid: payload?.sid || null,
            status: response.status
        };
    } finally {
        clearTimeout(timeoutHandle);
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const leadData = req.body || {};

        // Basic validation
        if (!leadData.name && !leadData.message) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const safeName = (leadData.name || 'unknown').replace(/[^a-z0-9]/gi, '_').toLowerCase();

        // Save lead to Blob storage
        const filename = `leads/lead_${timestamp}_${safeName}.json`;

        const blob = await put(
            filename,
            JSON.stringify({
                ...leadData,
                receivedAt: new Date().toISOString()
            }),
            { access: 'public' }
        );

        console.log('Lead saved:', filename);

        let smsResult = { attempted: false, sent: false };
        try {
            smsResult = await sendLeadSmsAlert({ leadData });

            if (smsResult.sent) {
                console.log('Lead SMS alert sent:', smsResult.sid || '(no sid)');
            } else {
                console.log(smsResult.reason);
            }
        } catch (smsError) {
            console.error('Lead saved but SMS send failed:', smsError.message);
            smsResult = {
                attempted: true,
                sent: false,
                error: smsError.message
            };
        }

        return res.status(200).json({
            success: true,
            message: 'Lead saved successfully',
            filename,
            url: blob.url,
            smsAlert: {
                attempted: smsResult.attempted,
                sent: smsResult.sent
            }
        });
    } catch (error) {
        console.error('Error saving lead:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to save lead',
            details: error.message
        });
    }
}
