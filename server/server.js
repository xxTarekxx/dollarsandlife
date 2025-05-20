// In D:\project\dollarsandlife\server\server.js

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
    const buildPath = __dirname; // <--- THIS IS THE CORRECTED LINE
    app.use(express.static(buildPath));

    app.get('*', (req, res, next) => {
        if (req.originalUrl.startsWith('/api/')) {
            return next();
        }
        res.sendFile(path.join(buildPath, 'index.html'));
    });
}

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});