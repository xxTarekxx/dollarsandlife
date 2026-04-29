'use strict';

const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
}

const AUTHORS = [
    {
        slug: 'tarek-i',
        name: 'Tarek I.',
        title: 'Founder & Editor',
        bio: 'Builder of Dollars & Life. I write and curate content on real-world money strategies, side hustles, and financial independence.',
        image: '/images/authors/tarek.webp',
        expertise: ['side hustles', 'budgeting', 'extra income', 'personal finance'],
        social: { linkedin: 'https://www.linkedin.com/in/tarek-ismail-96777578/' },
        active: true,
        joinedDate: '2024-01-01',
        email: 'personaltarek@outlook.com',
        passwordHash: '',
        role: 'admin',
        mustChangePassword: false,
        editedCount: 45,
    },
];

async function run() {
    const client = await MongoClient.connect(MONGODB_URI);
    const db = client.db('dollarsandlife_data');
    const col = db.collection('authors');

    await col.createIndex({ slug: 1 }, { unique: true });
    await col.createIndex({ active: 1 });
    console.log('📑 Indexes ensured');

    for (const author of AUTHORS) {
        const result = await col.updateOne(
            { slug: author.slug },
            { $set: author },
            { upsert: true }
        );
        const action = result.upsertedCount ? 'Inserted' : 'Updated';
        console.log(`✅ ${action}: ${author.name} (${author.slug})`);
    }

    await client.close();
    console.log('🎉 Done');
}

run().catch((err) => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
