// D:\project\dollarsandlife\server\server.js
console.log(`<<<< SERVER.JS STARTING - VERSION ${Date.now()} >>>>`);

const express = require('express');
const cors = require('cors');
const path = require('path'); // Ensure path is required
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI_SERVER = process.env.MONGODB_URI;

if (!MONGODB_URI_SERVER) {
    console.error("❌ FATAL ERROR (server.js): MONGODB_URI is missing. Application cannot start.");
    process.exit(1);
}
console.log(`[server.js] MONGODB_URI for server: ${MONGODB_URI_SERVER ? '******' : 'MISSING'}`);

let dbInstance;

async function connectDB() {
    if (dbInstance) return dbInstance;
    try {
        const client = await MongoClient.connect(MONGODB_URI_SERVER);
        dbInstance = client.db('dollarsandlife_data');
        console.log("✅ Successfully connected to MongoDB and selected 'dollarsandlife_data' database.");
        return dbInstance;
    } catch (e) {
        console.error("❌ Failed to connect to MongoDB:", e);
        throw e;
    }
}

app.use(async (req, res, next) => {
    if (!dbInstance) {
        try {
            await connectDB();
        } catch (e) {
            return res.status(503).json({ error: "Database not available" });
        }
    }
    req.db = dbInstance;
    next();
});

// --- MODIFIED REQUIRE FOR ROUTES.JS ---
const routesPath = path.resolve(__dirname, './routes.js');
delete require.cache[routesPath]; // Attempt to clear cache for routes.js
const routes = require(routesPath); // Re-require with absolute path
// --- END OF MODIFIED REQUIRE ---

app.use(cors());
app.use(express.json());
app.use('/api', routes);

if (process.env.NODE_ENV === 'production') {
    const buildPath = __dirname;
    app.use(express.static(buildPath));
    app.get('/{*splat}', (req, res, next) => {
        if (req.originalUrl.startsWith('/api/')) {
            return next();
        }
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Full Server with new wildcard running at http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error("💀 Server failed to start due to MongoDB connection error:", err);
    process.exit(1);
});