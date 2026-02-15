// Vercel Serverless Function to save conversations
// Save this as: api/save-conversation.js

import { kv } from '@vercel/kv';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const conversationData = req.body;

        // Generate unique key
        const timestamp = new Date().toISOString();
        const sessionId = conversationData.sessionId;
        const key = `conversation:${sessionId}`;

        // Save to Vercel KV (Redis-compatible database)
        await kv.set(key, conversationData);

        // Also add to a list for easy retrieval
        await kv.zadd('conversations:all', {
            score: Date.now(),
            member: sessionId
        });

        // Save summary for quick access
        const summary = {
            sessionId: conversationData.sessionId,
            sessionStart: conversationData.sessionStart,
            sessionEnd: conversationData.sessionEnd,
            durationSeconds: conversationData.durationSeconds,
            messageCount: conversationData.transcript?.length || 0,
            visitorInfo: conversationData.visitorInfo,
            firstMessage: conversationData.transcript?.[0]?.text || '',
            lastMessage: conversationData.transcript?.[conversationData.transcript?.length - 1]?.text || ''
        };

        await kv.set(`summary:${sessionId}`, summary);

        console.log('✅ Conversation saved:', sessionId);

        return res.status(200).json({
            success: true,
            message: 'Conversation saved successfully',
            sessionId: sessionId
        });

    } catch (error) {
        console.error('❌ Error saving conversation:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to save conversation',
            details: error.message
        });
    }
}
