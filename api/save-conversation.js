// Vercel Serverless Function to save conversations using Blob storage
// Save this as: api/save-conversation.js

import { put } from '@vercel/blob';

export default async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const conversationData = req.body;
        const sessionId = conversationData.sessionId;
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Save full conversation to Blob storage
        const conversationBlob = await put(
            `conversations/${sessionId}.json`,
            JSON.stringify(conversationData),
            { access: 'public' }
        );

        // Save summary for quick access
        const summary = {
            sessionId: conversationData.sessionId,
            sessionStart: conversationData.sessionStart,
            sessionEnd: conversationData.sessionEnd,
            durationSeconds: conversationData.durationSeconds,
            messageCount: conversationData.transcript?.length || 0,
            visitorInfo: conversationData.visitorInfo,
            firstMessage: conversationData.transcript?.[0]?.text || '',
            lastMessage: conversationData.transcript?.[conversationData.transcript?.length - 1]?.text || '',
            blobUrl: conversationBlob.url
        };

        const summaryBlob = await put(
            `summaries/${sessionId}.json`,
            JSON.stringify(summary),
            { access: 'public' }
        );

        // Also save to index file for listing
        try {
            const indexResponse = await fetch(process.env.BLOB_READ_WRITE_TOKEN ?
                `https://blob.vercel-storage.com/index.json` :
                summaryBlob.url.replace(`summaries/${sessionId}.json`, 'index.json')
            );

            let index = [];
            if (indexResponse.ok) {
                index = await indexResponse.json();
            }

            index.unshift(summary); // Add to beginning
            index = index.slice(0, 100); // Keep last 100 conversations

            await put('index.json', JSON.stringify(index), { access: 'public' });
        } catch (e) {
            console.log('Index update failed (non-critical):', e.message);
        }

        console.log('✅ Conversation saved:', sessionId);

        return res.status(200).json({
            success: true,
            message: 'Conversation saved successfully',
            sessionId: sessionId,
            url: conversationBlob.url
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
