"use strict";

const path = require("path");
const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");
const { MongoClient } = require("mongodb");

// ✅ Load environment variables from .env.production
const dotenvPath = path.resolve(__dirname, "../.env.production");
console.log("🔍 Loading env from:", dotenvPath);
require("dotenv").config({ path: dotenvPath });

// ✅ Check Mongo URI
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ MONGO_URI is undefined. Check your .env.production file.");
    process.exit(1);
}


console.log("✅ MONGO_URI loaded.");

console.log("✅ MONGO_URI =", process.env.MONGO_URI);
console.log("🧪 MONGO_URI_TEST =", process.env.MONGO_URI_TEST);

// ✅ Config
const BASE_URL = "https://www.dollarsandlife.com";
const DB_NAME = "dollarsandlife_data";
const COLLECTIONS = [
    "breaking_news",
    "budget_data",
    "freelance_jobs",
    "money_making_apps",
    "products_list",
    "remote_jobs",
    "start_a_blog"
];

// ✅ Extract static routes from App.tsx
function extractRoutesFromApp() {
    const appFilePath = path.resolve(__dirname, "../src/App.tsx");
    try {
        const content = fs.readFileSync(appFilePath, "utf-8");
        const routeRegex = /<Route\s+path=["']([^"']+)["']/g;
        const routes = [];

        let match;
        while ((match = routeRegex.exec(content)) !== null) {
            const route = match[1];
            if (!route.includes("*") && !route.includes(":") && !routes.includes(route)) {
                routes.push(route.toLowerCase());
            }
        }

        return routes;
    } catch (err) {
        console.error("❌ Failed to read App.tsx:", err);
        return [];
    }
}

// ✅ Fetch dynamic article routes from MongoDB
async function fetchDynamicRoutes() {
    const client = new MongoClient(MONGO_URI);
    const dynamicRoutes = [];

    try {
        await client.connect();
        const db = client.db(DB_NAME);

        for (const collectionName of COLLECTIONS) {
            const collection = db.collection(collectionName);
            const documents = await collection.find({}).toArray();

            for (const doc of documents) {
                if (!doc.canonicalUrl || !doc.datePublished) continue;

                const url = doc.canonicalUrl.startsWith("/")
                    ? BASE_URL + doc.canonicalUrl
                    : doc.canonicalUrl;

                const rawDate = doc.dateModified?.trim() || doc.datePublished;
                const parsedDate = new Date(rawDate);

                if (isNaN(parsedDate.getTime())) continue;

                dynamicRoutes.push({
                    url: url.toLowerCase(),
                    changefreq: "monthly",
                    priority: 0.8,
                    lastmod: parsedDate.toISOString(),
                });
            }
        }
    } catch (err) {
        console.error("❌ MongoDB error:", err);
    } finally {
        await client.close();
    }

    return dynamicRoutes;
}

// ✅ Generate the sitemap file
async function generateSitemap() {
    try {
        const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");
        const sitemap = new SitemapStream({ hostname: BASE_URL });
        const writeStream = fs.createWriteStream(sitemapPath);
        sitemap.pipe(writeStream);

        // Static routes
        const staticRoutes = [
            ...extractRoutesFromApp(),
            "/ads.txt",
            "/rss.xml"
        ];
        staticRoutes.forEach(route => {
            sitemap.write({
                url: route.toLowerCase(),
                changefreq: "hourly",
                priority: 0.8,
            });
        });

        // Dynamic article routes
        const dynamicRoutes = await fetchDynamicRoutes();
        dynamicRoutes.forEach(route => sitemap.write(route));

        sitemap.end();
        await streamToPromise(sitemap);

        console.log("✅ Sitemap generated at: /public/sitemap.xml");
    } catch (err) {
        console.error("❌ Error generating sitemap:", err);
    }
}

generateSitemap();
