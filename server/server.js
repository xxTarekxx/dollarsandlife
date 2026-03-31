// /var/www/html/dollarsandlife/server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
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

// Create rate limiter for frontend routes
const frontendLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs for frontend pages
    message: {
        error: 'Too many requests for frontend pages from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for static files and API routes
        return req.url.startsWith('/api/') || req.url.includes('.');
    }
});

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

// Serve static files only from ./public — never the project root (avoids exposing .env, routes.js, etc.)
const staticRoot = path.join(__dirname, 'public');
fs.mkdirSync(staticRoot, { recursive: true });
app.use(express.static(staticRoot, { dotfiles: 'deny', index: false }));

const spaIndexPath = path.join(staticRoot, 'index.html');

// Wildcard route for React/SPA frontend (Express 5+ syntax)
// Fallback route: only respond if not an API route or static file
app.use(frontendLimiter, (req, res, next) => {
    if (req.url.startsWith('/api/') || req.url.includes('.')) {
        return next(); // pass to 404 or static handler
    }
    if (!fs.existsSync(spaIndexPath)) {
        return res.status(404).send('Not found');
    }
    res.sendFile(spaIndexPath);
});


const port = process.env.PORT || 5001;

// Start server
connectDB().then(() => {
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server running at http://0.0.0.0:${port}`);
    });
});
