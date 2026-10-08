const DEFAULT_ALLOWED_ORIGINS = [
    'https://www.lockdownstudios.com',
    'https://lockdownstudios.com'
];

const rateLimitBuckets = globalThis.__lockdownRateLimitBuckets || new Map();
globalThis.__lockdownRateLimitBuckets = rateLimitBuckets;

function header(req, name) {
    const value = req.headers?.[name.toLowerCase()];
    return Array.isArray(value) ? value[0] : value;
}

function allowedOrigins() {
    const configured = (process.env.ALLOWED_ORIGINS || '')
        .split(',')
        .map(value => value.trim())
        .filter(Boolean);

    if (process.env.VERCEL_URL) configured.push(`https://${process.env.VERCEL_URL}`);
    if (process.env.VERCEL_BRANCH_URL) configured.push(`https://${process.env.VERCEL_BRANCH_URL}`);
    if (process.env.NODE_ENV !== 'production') {
        configured.push('http://localhost:3000', 'http://127.0.0.1:3000');
    }

    return new Set([...DEFAULT_ALLOWED_ORIGINS, ...configured]);
}

export function setApiSecurityHeaders(res) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Vary', 'Origin');
}

export function requireMethod(req, res, method) {
    if (req.method === method) return true;
    res.setHeader('Allow', method);
    res.status(405).json({ error: 'Method not allowed' });
    return false;
}

export function requireSameOrigin(req, res) {
    const origin = header(req, 'origin');
    if (origin && allowedOrigins().has(origin)) return true;
    res.status(403).json({ error: 'Request origin not allowed' });
    return false;
}

export function requireJson(req, res, maxBytes = 16_384) {
    const contentType = header(req, 'content-type') || '';
    if (!contentType.toLowerCase().startsWith('application/json')) {
        res.status(415).json({ error: 'Content-Type must be application/json' });
        return false;
    }

    let size = 0;
    try {
        size = Buffer.byteLength(JSON.stringify(req.body ?? {}));
    } catch {
        res.status(400).json({ error: 'Invalid JSON body' });
        return false;
    }

    if (size > maxBytes) {
        res.status(413).json({ error: 'Payload too large' });
        return false;
    }
    return true;
}

export function rateLimit(req, res, options = {}) {
    const { namespace = 'default', limit = 10, windowMs = 60_000 } = options;
    const forwarded = header(req, 'x-forwarded-for') || '';
    const ip = forwarded.split(',')[0].trim() || header(req, 'x-real-ip') || 'unknown';
    const key = `${namespace}:${ip}`;
    const now = Date.now();

    if (rateLimitBuckets.size > 10_000) {
        for (const [bucketKey, value] of rateLimitBuckets) {
            if (value.resetAt <= now) rateLimitBuckets.delete(bucketKey);
        }
    }

    const existing = rateLimitBuckets.get(key);
    const bucket = !existing || existing.resetAt <= now
        ? { count: 0, resetAt: now + windowMs }
        : existing;

    bucket.count += 1;
    rateLimitBuckets.set(key, bucket);

    const remaining = Math.max(0, limit - bucket.count);
    res.setHeader('X-RateLimit-Limit', String(limit));
    res.setHeader('X-RateLimit-Remaining', String(remaining));
    res.setHeader('X-RateLimit-Reset', String(Math.ceil(bucket.resetAt / 1000)));

    if (bucket.count <= limit) return true;
    res.setHeader('Retry-After', String(Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))));
    res.status(429).json({ error: 'Too many requests' });
    return false;
}

export function cleanString(value, maxLength) {
    if (typeof value !== 'string') return '';
    return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLength);
}
