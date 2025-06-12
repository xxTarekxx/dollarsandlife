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
        console.log(`[[[[ HITTING API ROUTE (GET ALL): /${basePath} for collection ${collectionName} ]]]]`);
        try {
            const db = req.db;
            if (!db) return res.status(503).json({ error: "Database not available" });

            console.log(`[API /${basePath}] Fetching from ${collectionName}.`);
            const items = await db.collection(collectionName).find().sort({ sortOrder: -1 }).toArray();

            console.log(`[API /${basePath}] Found ${items.length} items.`);
            res.json(items);
        } catch (err) {
            console.error(`❌ Error in GET /${basePath}:`, err);
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    });

    // GET by ID
    router.get(`/${basePath}/:id`, async (req, res) => {
        console.log(`[[[[ HITTING API ROUTE (GET BY ID): /${basePath}/:id for ID ${req.params.id} ]]]]`);
        try {
            const db = req.db;
            if (!db) return res.status(503).json({ error: "Database not available" });

            const requestedId = req.params.id.toLowerCase();
            console.log(`[API /${basePath}/:id] Fetching ID '${requestedId}' from ${collectionName}.`);
            const post = await db.collection(collectionName).findOne({
                id: { $regex: new RegExp(`^${requestedId}$`, 'i') }
            });

            if (!post) {
                console.log(`[API /${basePath}/:id] Post not found for ID: ${requestedId}`);
                return res.status(404).json({ error: 'Post not found' });
            }

            console.log(`[API /${basePath}/:id] Post found for ID: ${requestedId}`);
            res.json(post);
        } catch (err) {
            console.error(`❌ Error in GET /${basePath}/:id:`, err);
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
