// /var/www/html/dollarsandlife/server.js (Full version with NEW wildcard)

const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Mount API routes first
app.use('/api', routes);

// Serve React build in production
if (process.env.NODE_ENV === 'production') {
    const buildPath = __dirname;
    app.use(express.static(buildPath));

    // MODIFIED WILDCARD SYNTAX FOR EXPRESS 5.x
    app.get('/{*splat}', (req, res, next) => {
        if (req.originalUrl.startsWith('/api/')) {
            return next();
        }
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Full Server with new wildcard running at http://localhost:${PORT}`);
});