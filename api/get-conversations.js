// Vercel Serverless Function to get all conversations from Blob storage
// Save this as: api/get-conversations.js

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Try to read index file
        const indexUrl = process.env.BLOB_STORE_URL || 'https://your-project.vercel.app';
        const indexResponse = await fetch(`${indexUrl}/index.json`);

        if (!indexResponse.ok) {
            // No conversations yet
            return res.status(200).json({
                success: true,
                count: 0,
                conversations: []
            });
        }

        const conversations = await indexResponse.json();

        return res.status(200).json({
            success: true,
            count: conversations.length,
            conversations: conversations
        });

    } catch (error) {
        console.error('❌ Error fetching conversations:', error);

        // Return empty array instead of error (better UX)
        return res.status(200).json({
            success: true,
            count: 0,
            conversations: [],
            note: 'No conversations found yet'
        });
    }
}
