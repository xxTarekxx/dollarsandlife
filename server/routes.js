// /var/www/html/dollarsandlife/routes.js
'use strict';

const express = require('express');
const rateLimit = require('express-rate-limit');
const cache = require('./cache');

const router = express.Router();

// ── TTL constants ─────────────────────────────────────────────────────────────
const TTL_LIST    = 60 * 60;   //  1 hour  — article list pages
const TTL_ARTICLE = 60 * 60;   //  1 hour  — individual articles

// ── Cache key helper ──────────────────────────────────────────────────────────
// Prefix all keys with 'dl:' so cache.flush() can target only this app's entries.
function cacheKey(path, query = {}) {
    const q = Object.keys(query).length ? '?' + new URLSearchParams(query).toString() : '';
    return `dl:${path}${q}`;
}

// ── Rate limiters ─────────────────────────────────────────────────────────────
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV !== 'production' ? 1000 : 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV !== 'production' ? 500 : 30,
    message: {
        error: 'Too many requests for individual posts from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ── ID validation ─────────────────────────────────────────────────────────────
const isValidId = (id) =>
    typeof id === 'string' &&
    id.length > 0 &&
    id.length <= 100 &&
    /^[a-zA-Z0-9_-]+$/.test(id);

// ── Locale resolver ───────────────────────────────────────────────────────────
/**
 * Resolve a MongoDB document into a flat, frontend-ready object.
 *
 * NEW multilingual structure:
 *   { articleId: "slug", sortOrder: 1, languages: { en: {...}, ar: {...} } }
 *   → returns { id: "slug", ...languages[locale] }  (falls back to "en")
 *
 * LEGACY flat structure:
 *   { id: "slug", headline: "...", content: [...], ... }
 *   → returned unchanged
 */
function resolveLocale(doc, locale) {
    if (!doc) return null;
    if (doc.languages && typeof doc.languages === 'object') {
        const localized =
            doc.languages[locale] && Object.keys(doc.languages[locale]).length
                ? doc.languages[locale]
                : doc.languages['en'] || {};
        return { id: doc.articleId || doc.id || '', sortOrder: doc.sortOrder, ...localized };
    }
    return doc; // legacy: return as-is
}

// ── Response helper ───────────────────────────────────────────────────────────
// Sets Cache-Control so browsers and CDNs also cache the response.
// X-Cache: HIT / MISS lets you verify caching is working (visible in DevTools).
function sendWithCache(res, data, ttl, isCacheHit = false) {
    res.set('Cache-Control', `public, max-age=${ttl}, stale-while-revalidate=60`);
    res.set('X-Cache', isCacheHit ? 'HIT' : 'MISS');
    res.json(data);
}

// ── Route factory ─────────────────────────────────────────────────────────────
const createContentRoutes = (collectionName, basePath) => {
    if (!collectionName || !basePath) {
        console.error(`❌ Invalid route config: collectionName="${collectionName}", basePath="${basePath}"`);
        return;
    }

    // ── GET all ────────────────────────────────────────────────────────────────
    router.get(`/${basePath}`, generalLimiter, async (req, res) => {
        try {
            const db = req.db;
            if (!db) return res.status(503).json({ error: 'Database not available' });

            const locale = typeof req.query.lang === 'string' && req.query.lang.trim()
                ? req.query.lang.trim().toLowerCase() : 'en';

            const key = cacheKey(`/${basePath}`, { lang: locale });

            // ── Cache read ──
            const cached = await cache.get(key);
            if (cached !== null) {
                return sendWithCache(res, cached, TTL_LIST, true);
            }

            // ── Cache miss: query MongoDB ──
            const docs = await db.collection(collectionName)
                .find()
                .sort({ sortOrder: -1 })
                .toArray();

            const result = docs.map(doc => resolveLocale(doc, locale)).filter(Boolean);

            // Write to cache (fire-and-forget — never block the response)
            cache.set(key, result, TTL_LIST).catch(() => {});

            return sendWithCache(res, result, TTL_LIST, false);
        } catch (err) {
            console.error(`[routes] GET /${basePath} error:`, err.message);
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    });

    // ── GET by ID ──────────────────────────────────────────────────────────────
    router.get(`/${basePath}/:id`, strictLimiter, async (req, res) => {
        try {
            const db = req.db;
            if (!db) return res.status(503).json({ error: 'Database not available' });

            const requestedId = req.params.id.toLowerCase();
            if (!isValidId(requestedId)) {
                return res.status(400).json({ error: 'Invalid ID format' });
            }

            const locale = typeof req.query.lang === 'string' && req.query.lang.trim()
                ? req.query.lang.trim().toLowerCase() : 'en';

            const key = cacheKey(`/${basePath}/${requestedId}`, { lang: locale });

            // ── Cache read ──
            const cached = await cache.get(key);
            if (cached !== null) {
                return sendWithCache(res, cached, TTL_ARTICLE, true);
            }

            // ── Cache miss: query MongoDB ──
            let doc = await db.collection(collectionName).findOne({ articleId: requestedId });
            if (!doc) doc = await db.collection(collectionName).findOne({ id: requestedId });
            if (!doc) return res.status(404).json({ error: 'Post not found' });

            const resolved = resolveLocale(doc, locale);

            // Attach available language keys so the frontend can emit hreflang tags
            if (doc.languages && typeof doc.languages === 'object') {
                resolved.availableLangs = Object.keys(doc.languages);
            }

            // Write to cache
            cache.set(key, resolved, TTL_ARTICLE).catch(() => {});

            return sendWithCache(res, resolved, TTL_ARTICLE, false);
        } catch (err) {
            console.error(`[routes] GET /${basePath}/:id error:`, err.message);
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    });
};

// ── Register all content routes ───────────────────────────────────────────────
createContentRoutes('freelance_jobs',    'freelance-jobs');
createContentRoutes('budget_data',       'budget-data');
createContentRoutes('breaking_news',     'breaking-news');
createContentRoutes('start_a_blog',      'start-blog');
createContentRoutes('money_making_apps', 'money-making-apps');
createContentRoutes('products_list',     'shopping-deals');
createContentRoutes('remote_jobs',       'remote-jobs');

// ── Cache management endpoints ────────────────────────────────────────────────

// GET /api/cache/stats — shows backend type and number of cached keys
router.get('/cache/stats', async (_req, res) => {
    try {
        const stats = await cache.stats();
        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /api/cache/flush — clears all cached entries immediately
// Protect with a secret header to prevent abuse:
//   curl -X POST https://yourdomain.com/api/cache/flush -H "x-cache-secret: YOUR_SECRET"
router.post('/cache/flush', async (req, res) => {
    const secret = process.env.CACHE_FLUSH_SECRET;
    if (secret && req.headers['x-cache-secret'] !== secret) {
        return res.status(403).json({ error: 'Forbidden' });
    }
    try {
        await cache.flush();
        res.json({ ok: true, message: 'Cache cleared' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ── One-time fix endpoints (kept as-is) ──────────────────────────────────────
router.post('/fix-remote-job-id', strictLimiter, async (req, res) => {
    try {
        const db = req.db;
        if (!db) return res.status(503).json({ error: 'Database not available' });
        const result = await db.collection('remote_jobs').updateOne(
            { headline: /How to Find a Remote Job in 2025/i },
            { $set: { id: 'remote-job-guide-2025' } }
        );
        res.json({
            success: true,
            modifiedCount: result.modifiedCount,
            message: 'Set remote job guide id to remote-job-guide-2025'
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

const CONTENT_COLLECTIONS = ['breaking_news', 'budget_data', 'freelance_jobs', 'money_making_apps', 'remote_jobs', 'start_a_blog'];
router.post('/fix-normalize-ids-lowercase', strictLimiter, async (req, res) => {
    try {
        const db = req.db;
        if (!db) return res.status(503).json({ error: 'Database not available' });
        const summary = {};
        for (const collName of CONTENT_COLLECTIONS) {
            const coll = db.collection(collName);
            const docs = await coll.find({}).toArray();
            let count = 0;
            for (const doc of docs) {
                const idField = doc.articleId !== undefined ? 'articleId' : 'id';
                if (doc[idField] && doc[idField] !== doc[idField].toLowerCase()) {
                    await coll.updateOne({ _id: doc._id }, { $set: { [idField]: doc[idField].toLowerCase() } });
                    count++;
                }
            }
            summary[collName] = count;
        }
        res.json({ success: true, message: 'Normalized ids to lowercase', modified: summary });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;
