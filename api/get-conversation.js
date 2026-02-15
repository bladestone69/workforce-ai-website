// Vercel Serverless Function to get specific conversation
// Save this as: api/get-conversation.js

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { sessionId } = req.query;

        if (!sessionId) {
            return res.status(400).json({
                success: false,
                error: 'Session ID is required'
            });
        }

        // Get full conversation data
        const conversation = await kv.get(`conversation:${sessionId}`);

        if (!conversation) {
            return res.status(404).json({
                success: false,
                error: 'Conversation not found'
            });
        }

        return res.status(200).json({
            success: true,
            conversation
        });

    } catch (error) {
        console.error('❌ Error fetching conversation:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch conversation',
            details: error.message
        });
    }
}
