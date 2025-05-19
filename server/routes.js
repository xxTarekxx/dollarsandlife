const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://confidentlogisticsllc:T123456@cluster0.jeh2xtg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

router.get('/api/freelance-jobs', async (req, res) => {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db('dollarsandlife_data');
        const jobs = await db.collection('freelance_jobs').find().sort({ sortOrder: -1 }).toArray();
        res.json(jobs);
        client.close();
    } catch (err) {
        console.error('Failed to fetch freelance jobs:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/freelance-jobs/:id', async (req, res) => {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db('dollarsandlife_data');
        const post = await db.collection('freelance_jobs').findOne({ id: req.params.id });

        if (!post) return res.status(404).json({ error: 'Post not found' });

        console.log(`✅ /api/freelance-jobs/${req.params.id} returned`);
        res.json(post);
        client.close();
    } catch (err) {
        console.error('❌ Failed to fetch freelance post:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/api/breaking-news', async (req, res) => {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db('dollarsandlife_data');
        const news = await db.collection('breaking_news').find().sort({ sortOrder: -1 }).toArray();
        res.json(news);
        client.close();
    } catch (err) {
        console.error('Failed to fetch breaking news:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/budget-data', async (req, res) => {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db('dollarsandlife_data');
        const news = await db.collection('budget_data').find().sort({ sortOrder: -1 }).toArray();
        res.json(news);
        client.close();
    } catch (err) {
        console.error('Failed to fetch Budget Data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/budget-data/:id', async (req, res) => {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db('dollarsandlife_data');
        const post = await db.collection('budget_data').findOne({ id: req.params.id });

        if (!post) return res.status(404).json({ error: 'Post not found' });

        console.log(`✅ /api/budget-data/${req.params.id} returned`);
        res.json(post);
        client.close();
    } catch (err) {
        console.error('❌ Failed to fetch budget post:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


router.get('/api/start-blog', async (req, res) => {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db('dollarsandlife_data');
        const news = await db.collection('start_a_blog').find().sort({ sortOrder: -1 }).toArray();
        res.json(news);
        client.close();
    } catch (err) {
        console.error('Failed to fetch Start A Blog Data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/money-making-apps', async (req, res) => {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db('dollarsandlife_data');
        const news = await db.collection('money_making_apps').find().sort({ sortOrder: -1 }).toArray();
        res.json(news);
        client.close();
    } catch (err) {
        console.error('Failed to fetch Money Making Apps Data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/shopping-deals', async (req, res) => {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db('dollarsandlife_data');
        const news = await db.collection('products_list').find().sort({ sortOrder: -1 }).toArray();
        console.log(`✅ /api/shopping-deals returned ${news.length} items`);
        res.json(news);
        client.close();
    } catch (err) {
        console.error('Failed to fetch Products Data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/api/budget-data/:id', async (req, res) => {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db('dollarsandlife_data');

        const post = await db.collection('budget_data').findOne({ id: req.params.id });

        if (!post) return res.status(404).json({ error: 'Post not found' });

        console.log(`✅ /api/budget-data/${req.params.id} returned`);
        res.json(post);
        client.close();
    } catch (err) {
        console.error('❌ Failed to fetch budget post:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



router.get('/api/remote-jobs', async (req, res) => {
    try {
        const client = await MongoClient.connect(uri);
        const db = client.db('dollarsandlife_data');
        const news = await db.collection('remote_jobs').find().sort({ sortOrder: -1 }).toArray();
        res.json(news);
        client.close();

    } catch (err) {
        console.error('Failed to fetch Remote Jobs Data:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;
