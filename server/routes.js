require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');
const router = express.Router();

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("❌ MONGODB_URI is missing");

const createContentRoutes = (collectionName, basePath) => {
    console.log(`🟡 Registering route: /api/${basePath}`);

    // GET all
    router.get(`/${basePath}`, async (req, res) => {
        try {
            const client = await MongoClient.connect(uri);
            const db = client.db('dollarsandlife_data');
            const items = await db.collection(collectionName).find().sort({ sortOrder: -1 }).toArray();
            res.json(items);
            client.close();
        } catch (err) {
            console.error(`❌ Error fetching all from ${collectionName}:`, err);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

    // GET by ID
    router.get(`/${basePath}/:id`, async (req, res) => {
        try {
            const client = await MongoClient.connect(uri);
            const db = client.db('dollarsandlife_data');
            const requestedId = req.params.id.toLowerCase();
            const post = await db.collection(collectionName).findOne({
                id: { $regex: new RegExp(`^${requestedId}$`, 'i') }
            });


            if (!post) return res.status(404).json({ error: 'Post not found' });

            res.json(post);
            client.close();
        } catch (err) {
            console.error(`❌ Error fetching ${collectionName}/${req.params.id}:`, err);
            res.status(500).json({ error: 'Internal server error' });
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

