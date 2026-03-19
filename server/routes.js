// /var/www/html/dollarsandlife/routes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Create rate limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV !== 'production' ? 1000 : 100, // relaxed when not in production
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV !== 'production' ? 500 : 30, // relaxed when not in production to avoid 429 during local testing
    message: {
        error: 'Too many requests for individual posts from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Function to validate ID parameters and prevent regex injection
const isValidId = (id) => {
    // Check if ID is a string and not empty
    if (typeof id !== 'string' || id.length === 0) {
        return false;
    }

    // Check length limits
    if (id.length > 100) {
        return false;
    }

    // Only allow alphanumeric characters, hyphens, and underscores
    // This prevents regex injection and ensures safe database queries
    const validIdPattern = /^[a-zA-Z0-9_-]+$/;
    return validIdPattern.test(id);
};

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
        const localized = (doc.languages[locale] && Object.keys(doc.languages[locale]).length)
            ? doc.languages[locale]
            : (doc.languages['en'] || {});
        return { id: doc.articleId || doc.id || '', sortOrder: doc.sortOrder, ...localized };
    }
    return doc; // legacy: return as-is
}

const createContentRoutes = (collectionName, basePath) => {
    if (!collectionName || !basePath) {
        console.error(`❌ Invalid route config: collectionName="${collectionName}", basePath="${basePath}"`);
        return;
    }

    // GET all — optional ?lang=ar returns content in that locale, falls back to "en"
    router.get(`/${basePath}`, generalLimiter, async (req, res) => {
        try {
            const db = req.db;
            if (!db) return res.status(503).json({ error: "Database not available" });

            const locale = (typeof req.query.lang === 'string' && req.query.lang.trim())
                ? req.query.lang.trim().toLowerCase() : 'en';

            const docs = await db.collection(collectionName).find().sort({ sortOrder: -1 }).toArray();
            res.json(docs.map(doc => resolveLocale(doc, locale)).filter(Boolean));
        } catch (err) {
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    });

    // GET by ID — optional ?lang=ar returns content in that locale, falls back to "en"
    router.get(`/${basePath}/:id`, strictLimiter, async (req, res) => {
        try {
            const db = req.db;
            if (!db) return res.status(503).json({ error: "Database not available" });

            const requestedId = req.params.id.toLowerCase();
            if (!isValidId(requestedId)) {
                return res.status(400).json({ error: 'Invalid ID format' });
            }

            const locale = (typeof req.query.lang === 'string' && req.query.lang.trim())
                ? req.query.lang.trim().toLowerCase() : 'en';

            // Try new structure (articleId) first, then legacy (id)
            let doc = await db.collection(collectionName).findOne({ articleId: requestedId });
            if (!doc) doc = await db.collection(collectionName).findOne({ id: requestedId });
            if (!doc) return res.status(404).json({ error: 'Post not found' });

            const resolved = resolveLocale(doc, locale);
            // Attach available language keys so the frontend can emit hreflang tags
            if (doc.languages && typeof doc.languages === 'object') {
                resolved.availableLangs = Object.keys(doc.languages);
            }
            res.json(resolved);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    });
};

// Register routes
createContentRoutes('freelance_jobs', 'freelance-jobs');
createContentRoutes('budget_data', 'budget-data');
createContentRoutes('breaking_news', 'breaking-news');
createContentRoutes('start_a_blog', 'start-blog');
createContentRoutes('money_making_apps', 'money-making-apps');
createContentRoutes('products_list', 'shopping-deals');
createContentRoutes('remote_jobs', 'remote-jobs');

// One-time fix: ensure the main "How to Find a Remote Job in 2025" guide uses slug remote-job-guide-2025
router.post('/fix-remote-job-id', async (req, res) => {
    try {
        const db = req.db;
        if (!db) return res.status(503).json({ error: "Database not available" });

        // Update the main guide by headline so we don't change a different article
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

// One-time fix: normalize all document ids to lowercase in content collections (so GET /:id with lowercased id finds them)
const CONTENT_COLLECTIONS = ['breaking_news', 'budget_data', 'freelance_jobs', 'money_making_apps', 'remote_jobs', 'start_a_blog'];
router.post('/fix-normalize-ids-lowercase', async (req, res) => {
    try {
        const db = req.db;
        if (!db) return res.status(503).json({ error: "Database not available" });

        const summary = {};
        for (const collName of CONTENT_COLLECTIONS) {
            const coll = db.collection(collName);
            const docs = await coll.find({}).toArray();
            let count = 0;
            for (const doc of docs) {
                // Handle both new (articleId) and legacy (id) field names
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
