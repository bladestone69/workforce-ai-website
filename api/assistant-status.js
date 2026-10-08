import { setApiSecurityHeaders } from './_security.js';

export default function handler(req, res) {
    setApiSecurityHeaders(res);
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).json({ error: 'Method not allowed' });
    }
    return res.status(200).json({
        enabled: process.env.ASSISTANT_ENABLED === 'true'
            && Boolean(process.env.XAI_CHAT_API_KEY)
            && Boolean(process.env.XAI_CHAT_MODEL)
    });
}
