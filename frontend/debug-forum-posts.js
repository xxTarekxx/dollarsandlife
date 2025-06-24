// Debug script to check forum posts in Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');
require('dotenv').config();

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

async function debugForumPosts() {
    try {
        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        console.log('🔍 Checking forum posts in Firestore...\n');

        // Get all forum posts
        const postsRef = collection(db, "forumPosts");
        const snapshot = await getDocs(postsRef);

        console.log(`📊 Total forum posts found: ${snapshot.size}\n`);

        if (snapshot.empty) {
            console.log('❌ No forum posts found in the database!');
            return;
        }

        // Check each post
        snapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`📝 Post ID: ${doc.id}`);
            console.log(`   Title: ${data.title || 'No title'}`);
            console.log(`   Has slug: ${!!data.slug}`);
            console.log(`   Slug value: ${data.slug || 'None'}`);
            console.log(`   Author: ${data.authorDisplayName || 'Unknown'}`);
            console.log(`   Created: ${data.timestamp ? new Date(data.timestamp.seconds * 1000).toISOString() : 'Unknown'}`);
            console.log('---');
        });

        // Check specific post ID
        const specificId = 'n73uEle9hviw1zG5wGl8';
        console.log(`\n🔍 Checking specific post ID: ${specificId}`);

        const specificDocRef = doc(db, "forumPosts", specificId);
        const specificDoc = await getDoc(specificDocRef);

        if (specificDoc.exists()) {
            const specificData = specificDoc.data();
            console.log(`✅ Post found!`);
            console.log(`   Title: ${specificData.title || 'No title'}`);
            console.log(`   Has slug: ${!!specificData.slug}`);
            console.log(`   Slug value: ${specificData.slug || 'None'}`);
        } else {
            console.log(`❌ Post with ID ${specificId} not found!`);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

debugForumPosts(); 