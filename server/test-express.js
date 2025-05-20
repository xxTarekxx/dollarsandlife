// /tmp/test-express.js
const express = require('express');
const app = express();
const PORT = 3001; // Use a different port

app.get('/test/:id', (req, res) => {
    res.send(`Test successful! ID: ${req.params.id}`);
});

app.get('/test', (req, res) => {
    res.send('Test successful! No ID.');
});

app.listen(PORT, () => {
    console.log(`Minimal test server running on http://localhost:${PORT}`);
});