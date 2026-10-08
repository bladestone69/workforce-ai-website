import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { sendGameFeedbackNotification } from './_email.js';
import { cleanString, rateLimit, requireJson, requireMethod, requireSameOrigin, setApiSecurityHeaders } from './_security.js';

export default async function handler(req, res) {
    setApiSecurityHeaders(res);
    if (!requireMethod(req, res, 'POST')) return;
    if (!requireSameOrigin(req, res)) return;
    if (!requireJson(req, res, 4_096)) return;
    if (!rateLimit(req, res, { namespace: 'game-feedback', limit: 3, windowMs: 10 * 60_000 })) return;
    if (!process.env.BLOB_READ_WRITE_TOKEN) return res.status(503).json({ error: 'Feedback storage is not configured' });
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return res.status(503).json({ error: 'Feedback notification is not configured' });

    if (req.body?.website) return res.status(400).json({ error: 'Invalid feedback' });
    const rating = req.body?.rating == null ? null : Number(req.body.rating);
    const feedback = {
        game: cleanString(req.body?.game, 50),
        rating,
        liked: req.body?.liked === true,
        comment: cleanString(req.body?.comment, 1_000),
        alias: cleanString(req.body?.alias, 80),
        receivedAt: new Date().toISOString()
    };
    if (feedback.game !== 'drift-protocol') return res.status(400).json({ error: 'Unknown game' });
    if (rating !== null && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
        return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    if (rating === null && !feedback.liked && !feedback.comment) {
        return res.status(400).json({ error: 'Add a rating, like or comment' });
    }

    const reference = randomUUID();
    try {
        await put(`game-feedback/drift-protocol/${feedback.receivedAt.slice(0, 10)}/${reference}.json`, JSON.stringify(feedback), {
            access: 'private', addRandomSuffix: true, contentType: 'application/json'
        });
    } catch {
        return res.status(503).json({ error: 'Feedback could not be saved. Please try again later.' });
    }

    try {
        await sendGameFeedbackNotification(feedback, reference);
        return res.status(201).json({ success: true, reference, notificationSent: true });
    } catch {
        return res.status(202).json({
            success: true, reference, notificationSent: false,
            message: 'Feedback was saved, but the studio email alert failed.'
        });
    }
}
