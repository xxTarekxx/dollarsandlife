const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// ✅ 1. Connection string with sample_mflix database
mongoose.connect('mongodb+srv://confidentlogisticsllc:T123456@cluster0.jeh2xtg.mongodb.net/sample_mflix?retryWrites=true&w=majority&appName=Cluster0', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB connection error:', err));

// ✅ 2. Schema and model linked to correct collection
const movieSchema = new mongoose.Schema({}, { collection: 'movies' });
const Movie = mongoose.model('Movie', movieSchema);

// ✅ 3. Basic API endpoint
const { MongoClient } = require('mongodb');

app.get('/api/movies', async (req, res) => {
    try {
        const client = await MongoClient.connect(
            'mongodb+srv://confidentlogisticsllc:T123456@cluster0.jeh2xtg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0',
            { useNewUrlParser: true, useUnifiedTopology: true }
        );

        const db = client.db('sample_mflix');
        const movies = await db.collection('movies').find().limit(5).toArray();

        res.json(movies);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Raw query failed' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
