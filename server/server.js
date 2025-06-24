// /var/www/html/dollarsandlife/server.js

const express = require('express');
const cors = require('cors');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI is missing from .env");
    process.exit(1);
}

let dbInstance;
async function connectDB() {
    if (dbInstance) return dbInstance;
    const client = await MongoClient.connect(MONGODB_URI);
    dbInstance = client.db('dollarsandlife_data');
    console.log("✅ Connected to MongoDB dollarsandlife_data");
    return dbInstance;
}

app.use(cors());
app.use(express.json());

// Attach DB to each request
app.use(async (req, res, next) => {
    if (!dbInstance) {
        try {
            await connectDB();
        } catch (e) {
            return res.status(503).json({ error: "Database unavailable" });
        }
    }
    req.db = dbInstance;
    next();
});

// API routes
const routes = require('./routes.js');
app.use('/api', routes);

// Serve static files
app.use(express.static(__dirname));

// Wildcard route for React/SPA frontend (Express 5+ syntax)
// Fallback route: only respond if not an API route or static file
app.use((req, res, next) => {
    if (req.url.startsWith('/api/') || req.url.includes('.')) {
        return next(); // pass to 404 or static handler
    }
    res.sendFile(path.join(__dirname, 'index.html'));
});


const port = process.env.PORT || 5001;

// Start server
connectDB().then(() => {
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server running at http://0.0.0.0:${port}`);
    });
});
