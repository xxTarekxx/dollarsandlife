const express = require('express');
const cors = require('cors');
const routes = require('./routes');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Mount your API routes
app.use(routes);

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
