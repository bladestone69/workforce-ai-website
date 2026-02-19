import { put } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const leadData = req.body;

        // Basic validation
        if (!leadData.name && !leadData.message) {
            return res.status(400).json({ success: false, error: "Missing required fields" });
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

        console.log('✅ Lead saved:', filename);

        return res.status(200).json({
            success: true,
            message: 'Lead saved successfully',
            filename: filename,
            url: blob.url
        });

    } catch (error) {
        console.error('❌ Error saving lead:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to save lead',
            details: error.message
        });
    }
}
