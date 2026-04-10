// /var/www/html/dollarsandlife/routes.js
'use strict';

const fs = require('fs');
const path = require('path');
const express = require('express');
const rateLimit = require('express-rate-limit');
const cache = require('./cache');

const router = express.Router();

function loadSiteSupportedLangs() {
    try {
        const languagesPath = path.resolve(__dirname, '../frontend/lib/i18n/languages.ts');
        const source = fs.readFileSync(languagesPath, 'utf8');
        const match = source.match(/supportedLanguages\s*=\s*\[([\s\S]*?)\]\s*as const/);
        if (!match) throw new Error('supportedLanguages array not found');
        return new Set(Array.from(match[1].matchAll(/"([^"]+)"/g), (entry) => entry[1]));
    } catch (_err) {
        return new Set([
            'en', 'zh', 'es', 'ar', 'pt', 'id', 'fr', 'ja', 'ru', 'de',
            'ko', 'vi', 'it', 'tr', 'fa', 'nl', 'pl', 'uk', 'cs', 'hu',
        ]);
    }
}

const SITE_SUPPORTED_LANGS = loadSiteSupportedLangs();

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

function buildListProjection(locale) {
    return {
        _id: 0,
        id: 1,
        articleId: 1,
        sortOrder: 1,
        headline: 1,
        image: 1,
        content: 1,
        author: 1,
        datePublished: 1,
        dateModified: 1,
        [`languages.${locale}.headline`]: 1,
        [`languages.${locale}.image`]: 1,
        [`languages.${locale}.content`]: 1,
        [`languages.${locale}.author`]: 1,
        [`languages.${locale}.datePublished`]: 1,
        [`languages.${locale}.dateModified`]: 1,
        'languages.en.headline': 1,
        'languages.en.image': 1,
        'languages.en.content': 1,
        'languages.en.author': 1,
        'languages.en.datePublished': 1,
        'languages.en.dateModified': 1,
    };
}

function parsePositiveInt(value, fallback) {
    const parsed = Number.parseInt(value, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// ── List trimmer ──────────────────────────────────────────────────────────────
// Card views only render a 120-char excerpt from content[0].text.
// Returning all content blocks for every article in a 200-doc list wastes
// bandwidth and is the primary cause of slow list-page SSR (especially
// breaking-news which has large per-article content arrays).
// Detail pages always fetch individually so they still get full content.
function trimForList(doc) {
    if (!doc) return null;
    if (Array.isArray(doc.content) && doc.content.length > 0) {
        const firstBlock = doc.content[0] || {};
        const firstText = typeof firstBlock.text === 'string' ? firstBlock.text : '';
        const trimmedText = firstText.length > 220 ? `${firstText.slice(0, 220)}...` : firstText;
        return {
            ...doc,
            content: [{ ...firstBlock, text: trimmedText }],
        };
    }
    return doc;
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

            const requestedPage = typeof req.query.page === 'string'
                ? parsePositiveInt(req.query.page, 1)
                : null;
            const requestedLimit = typeof req.query.limit === 'string'
                ? parsePositiveInt(req.query.limit, 20)
                : null;
            const isPaginated = requestedPage !== null || requestedLimit !== null;
            const page = requestedPage || 1;
            const limit = Math.min(requestedLimit || 20, 100);
            const skip = isPaginated ? (page - 1) * limit : 0;
            const key = cacheKey(`/${basePath}`, isPaginated
                ? { lang: locale, page, limit }
                : { lang: locale });

            // ── Cache read ──
            const cached = await cache.get(key);
            if (cached !== null) {
                return sendWithCache(res, cached, TTL_LIST, true);
            }

            // ── Cache miss: query MongoDB ──
            // maxTimeMS: kills the query if MongoDB takes > 8 s (prevents SSR hangs).
            // trimForList: strips content to first element — cards only need a 120-char
            // excerpt, not 20+ paragraphs per article × 200 documents.
            const collection = db.collection(collectionName);
            const [docs, total] = await Promise.all([
                collection
                    .find()
                    .project(buildListProjection(locale))
                    .sort({ sortOrder: -1 })
                    .skip(skip)
                    .limit(isPaginated ? limit : 200)
                    .maxTimeMS(8000)
                    .toArray(),
                isPaginated
                    ? collection.countDocuments({}, { maxTimeMS: 8000 })
                    : Promise.resolve(null),
            ]);

            const items = docs
                .map(doc => resolveLocale(doc, locale))
                .filter(Boolean)
                .map(trimForList);
            const result = isPaginated
                ? {
                    items,
                    total: total || 0,
                    totalPages: total ? Math.ceil(total / limit) : 1,
                    page,
                    limit,
                }
                : items;

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
                resolved.availableLangs = Object.keys(doc.languages)
                    .filter((lang) => SITE_SUPPORTED_LANGS.has(lang));
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
