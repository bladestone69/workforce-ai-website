const SITE_PAGES = new Set([
    '/', '/index', '/services', '/work', '/about', '/websites-apps', '/apps',
    '/games-interactive', '/3d-models', '/3d-animation', '/ai-automation',
    '/drift-protocol', '/emoji-match', '/monster-match', '/world-war-toonz',
    '/privacy', '/examples/lodge', '/examples/practice', '/examples/trades'
]);

export function analyticsConfigured() {
    return process.env.SITE_ANALYTICS_ENABLED === 'true'
        && /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(process.env.SUPABASE_URL || '')
        && /^sb_secret_/.test(process.env.SUPABASE_SECRET_KEY || '');
}

export function pagePath(value) {
    if (typeof value !== 'string' || value.length > 120 || !value.startsWith('/')) return '';
    const clean = value.replace(/\.html$/, '').replace(/\/$/, '') || '/';
    return SITE_PAGES.has(clean) ? clean : '';
}

export function referrerHost(value) {
    if (typeof value !== 'string' || value.length > 300 || !value) return '';
    try {
        const url = new URL(value);
        if (!['https:', 'http:'].includes(url.protocol)) return '';
        return url.hostname.toLowerCase().slice(0, 100);
    } catch { return ''; }
}

export function supabaseEndpoint(path) {
    return `${process.env.SUPABASE_URL}${path}`;
}

export function supabaseHeaders(extra = {}) {
    return { apikey: process.env.SUPABASE_SECRET_KEY, 'Content-Type': 'application/json', ...extra };
}
