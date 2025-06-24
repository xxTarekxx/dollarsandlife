// /var/www/html/dollarsandlife/routes.js
const express = require('express');
const router = express.Router();

const createContentRoutes = (collectionName, basePath) => {
    if (!collectionName || !basePath) {
        console.error(`❌ Invalid route config: collectionName="${collectionName}", basePath="${basePath}"`);
        return;
    }

    console.log(`✅ Registering routes for collection: "${collectionName}" at base path: "/${basePath}"`);

    // GET all
    router.get(`/${basePath}`, async (req, res) => {
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
    router.get(`/${basePath}/:id`, async (req, res) => {
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
