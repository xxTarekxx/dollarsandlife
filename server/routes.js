// /var/www/html/dollarsandlife/routes.js
const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();

// Create rate limiters
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // limit each IP to 30 requests per windowMs for individual posts
    message: {
        error: 'Too many requests for individual posts from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

const createContentRoutes = (collectionName, basePath) => {
    if (!collectionName || !basePath) {
        console.error(`❌ Invalid route config: collectionName="${collectionName}", basePath="${basePath}"`);
        return;
    }

    console.log(`✅ Registering routes for collection: "${collectionName}" at base path: "/${basePath}"`);

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
            const post = await db.collection(collectionName).findOne({
                id: { $regex: new RegExp(`^${requestedId}$`, 'i') }
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

module.exports = router;
