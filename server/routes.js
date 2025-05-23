// D:\project\dollarsandlife\server\routes.js
const express = require('express');
const router = express.Router();

const createContentRoutes = (collectionName, basePath) => {
    // GET all
    router.get(`/${basePath}`, async (req, res) => {
        console.log(`[[[[ HITTING API ROUTE (GET ALL): /${basePath} for collection ${collectionName} ]]]]`);
        try {
            const db = req.db;
            if (!db) return res.status(503).json({ error: "Database not available" });

            console.log(`[API /${basePath}] Fetching from ${collectionName}.`);
            let items;
            // Test logic for freelance_jobs can be removed if the SSL issue was IP whitelisting
            // For now, let's keep the original logic for fetching all
            items = await db.collection(collectionName).find().sort({ sortOrder: -1 }).toArray();

            console.log(`[API /${basePath}] Found ${items.length} items for ${collectionName}.`);
            res.json(items);
        } catch (err) {
            console.error(`❌ Error in GET /${basePath} for ${collectionName}:`, err);
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    });

    // GET by ID
    router.get(`/${basePath}/:id`, async (req, res) => {
        console.log(`[[[[ HITTING API ROUTE (GET BY ID): /${basePath}/:id for ID ${req.params.id}, collection ${collectionName} ]]]]`);
        try {
            const db = req.db;
            if (!db) return res.status(503).json({ error: "Database not available" });

            const requestedId = req.params.id.toLowerCase();
            console.log(`[API /${basePath}/:id] Fetching ID '${requestedId}' from ${collectionName}.`);
            const post = await db.collection(collectionName).findOne({
                id: { $regex: new RegExp(`^${requestedId}$`, 'i') }
            });

            if (!post) {
                console.log(`[API /${basePath}/:id] Post not found for ID: ${requestedId} in ${collectionName}.`);
                return res.status(404).json({ error: 'Post not found' });
            }
            console.log(`[API /${basePath}/:id] Post found for ID: ${requestedId} in ${collectionName}.`);
            res.json(post);
        } catch (err) { // Corrected catch block
            console.error(`❌ Error in GET /${basePath}/:id for ${collectionName}/${req.params.id}:`, err);
            res.status(500).json({ error: 'Internal server error', details: err.message });
        }
    });
};

createContentRoutes('freelance_jobs', 'freelance-jobs');
createContentRoutes('budget_data', 'budget-data');
createContentRoutes('breaking_news', 'breaking-news');
createContentRoutes('start_a_blog', 'start-blog');
createContentRoutes('money_making_apps', 'money-making-apps');
createContentRoutes('products_list', 'shopping-deals');
createContentRoutes('remote_jobs', 'remote-jobs');

module.exports = router;