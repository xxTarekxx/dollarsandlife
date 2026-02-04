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

const createContentRoutes = (collectionName, basePath) => {
    if (!collectionName || !basePath) {
        console.error(`❌ Invalid route config: collectionName="${collectionName}", basePath="${basePath}"`);
        return;
    }

    // GET all
    router.get(`/${basePath}`, generalLimiter, async (req, res) => {
        try {
            const db = req.db;
            if (!db) return res.status(503).json({ error: "Database not available" });

            const items = await db.collection(collectionName).find().sort({ sortOrder: -1 }).toArray();
            res.json(items);
        } catch (err) {
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    });

    // GET by ID
    router.get(`/${basePath}/:id`, strictLimiter, async (req, res) => {
        try {
            const db = req.db;
            if (!db) return res.status(503).json({ error: "Database not available" });

            const requestedId = req.params.id.toLowerCase();

            // Validate and sanitize the ID parameter to prevent regex injection
            if (!isValidId(requestedId)) {
                return res.status(400).json({ error: 'Invalid ID format' });
            }

            // Use exact match instead of regex to prevent injection
            const post = await db.collection(collectionName).findOne({
                id: requestedId
            });

            if (!post) {
                return res.status(404).json({ error: 'Post not found' });
            }

            res.json(post);
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

// Temporary endpoint to fix remote job ID
router.post('/fix-remote-job-id', async (req, res) => {
    try {
        const db = req.db;
        if (!db) return res.status(503).json({ error: "Database not available" });

        const result = await db.collection('remote_jobs').updateOne(
            { id: 'Remote-Job-Guide-2025' },
            { $set: { id: 'remote-job-guide-2025' } }
        );

        res.json({
            success: true,
            modifiedCount: result.modifiedCount,
            message: 'Updated remote job ID to lowercase'
        });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err.message });
    }
});

module.exports = router;
