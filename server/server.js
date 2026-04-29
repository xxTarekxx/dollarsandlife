// /var/www/html/dollarsandlife/server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { MongoClient } = require('mongodb');
const cache = require('./cache');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
// In local dev, .env.local overrides (e.g. CMS_UPLOAD_DIR → frontend/public/images)
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.resolve(__dirname, '.env.local'), override: true });
}

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

const ALLOWED_ORIGINS = process.env.NODE_ENV === 'production'
    ? ['https://www.dollarsandlife.com', 'https://dollarsandlife.com']
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({ origin: ALLOWED_ORIGINS, credentials: true }));
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
const routes    = require('./routes.js');
const cmsRoutes = require('./cms-routes.js');
app.use('/api', routes);
app.use('/api/cms', cmsRoutes);

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

// ── Ensure sort indexes exist on all content collections ─────────────────────
// sortOrder index makes .sort({ sortOrder: -1 }).limit(N) fast even on large
// collections — without it MongoDB does a full collection scan.
const CONTENT_COLLECTIONS = [
    'breaking_news',
    'budget_data',
    'freelance_jobs',
    'money_making_apps',
    'remote_jobs',
    'start_a_blog',
    'products_list',
];
async function ensureIndexes(db) {
    await Promise.all(
        CONTENT_COLLECTIONS.map(col =>
            db.collection(col)
                .createIndex({ sortOrder: -1 }, { background: true })
                .catch(() => {}) // ignore if already exists or collection absent
        )
    );
    console.log('📑 MongoDB sortOrder indexes ensured');
}

// ── Cache warm-up ─────────────────────────────────────────────────────────────
// Runs in the background after the server starts listening.
// Hits every list endpoint so the first real user request is always a cache HIT.
// MongoDB Atlas cold-start queries can take 10–15 s; this hides that latency.
const WARM_ENDPOINTS = [
    '/freelance-jobs',
    '/budget-data',
    '/breaking-news',
    '/start-blog',
    '/money-making-apps',
    '/shopping-deals',
    '/remote-jobs',
];

async function warmCache(listenPort) {
    const base = `http://127.0.0.1:${listenPort}/api`;
    const results = await Promise.allSettled(
        WARM_ENDPOINTS.map(async (ep) => {
            const res = await fetch(`${base}${ep}`, { signal: AbortSignal.timeout(20_000) });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            await res.json(); // consume body
            return ep;
        })
    );
    for (const r of results) {
        if (r.status === 'fulfilled') {
            console.log(`🔥 Cache warmed: ${r.value}`);
        } else {
            console.warn(`⚠️  Cache warm failed: ${r.reason?.message}`);
        }
    }
    console.log('✅ Cache warm-up complete — all list pages will serve instantly');
}

// Start server — connect to DB and cache before accepting requests
async function start() {
    const db = await connectDB();
    await ensureIndexes(db);
    await cache.init(); // connects to Redis, or silently falls back to in-memory
    app.listen(port, '0.0.0.0', () => {
        console.log(`🚀 Server running at http://0.0.0.0:${port}`);
        console.log(`💾 Cache backend: ${cache.isRedis() ? 'Redis' : 'in-memory (Redis not available)'}`);
        // Fire-and-forget — warms MongoDB → in-memory cache in background
        warmCache(port).catch(() => {});
    });
}

start().catch((err) => {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
});
