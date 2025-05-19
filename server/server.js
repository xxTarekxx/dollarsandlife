const express = require('express');
const cors = require('cors');
const routes = require('./routes'); // ✅ re-added safely

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ Mount API routes
app.use('/api', routes);

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
