// Vercel Serverless Function to get specific conversation from Blob storage
// Save this as: api/get-conversation.js

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

        // Fetch conversation from Blob storage
        const blobUrl = process.env.BLOB_STORE_URL || 'https://your-project.vercel.app';
        const conversationUrl = `${blobUrl}/conversations/${sessionId}.json`;

        const response = await fetch(conversationUrl);

        if (!response.ok) {
            return res.status(404).json({
                success: false,
                error: 'Conversation not found'
            });
        }

        const conversation = await response.json();

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
