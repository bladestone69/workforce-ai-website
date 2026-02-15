// Vercel Serverless Function to get all conversations
// Save this as: api/get-conversations.js

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Get all session IDs (sorted by timestamp, newest first)
        const sessionIds = await kv.zrange('conversations:all', 0, -1, { rev: true });

        // Get summaries for all sessions
        const summaries = await Promise.all(
            sessionIds.map(async (sessionId) => {
                const summary = await kv.get(`summary:${sessionId}`);
                return summary;
            })
        );

        // Filter out any null values
        const validSummaries = summaries.filter(s => s !== null);

        return res.status(200).json({
            success: true,
            count: validSummaries.length,
            conversations: validSummaries
        });

    } catch (error) {
        console.error('❌ Error fetching conversations:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch conversations',
            details: error.message
        });
    }
}
