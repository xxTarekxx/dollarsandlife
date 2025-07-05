"use strict";

const path = require("path");
const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");
const { MongoClient } = require("mongodb");

// ✅ Load environment variables from server and frontend .env
const serverDotenvPath = path.resolve(__dirname, "../../server/.env");
const frontendDotenvPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: serverDotenvPath });
require("dotenv").config({ path: frontendDotenvPath });

// ✅ Check Mongo URI
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ MONGO_URI is undefined. Check your server .env file.");
    console.log("⚠️ Proceeding without dynamic routes.");
}

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

// ✅ Excluded routes
const EXCLUDED_ROUTE = "/sentrypc-landing";

// ✅ Static routes
function extractStaticRoutes() {
    return [
        "/",
        "/about-us",
        "/contact-us",
        "/return-policy",
        "/privacy-policy",
        "/terms-of-service",
        "/extra-income",
        "/shopping-deals",
        "/start-a-blog",
        "/breaking-news",
        "/financial-calculators",
        "/ads.txt",
        "/rss.xml"
    ];
}

// ✅ Fetch dynamic routes from MongoDB
async function fetchDynamicRoutes() {
    if (!MONGO_URI) return [];

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

                const urlPath = doc.canonicalUrl.toLowerCase();
                if (urlPath === EXCLUDED_ROUTE.toLowerCase()) {
                    console.log(`🚫 Skipping excluded dynamic route: ${urlPath}`);
                    continue;
                }

                const fullUrl = doc.canonicalUrl.startsWith("/")
                    ? BASE_URL + doc.canonicalUrl
                    : doc.canonicalUrl;

                const rawDate = doc.dateModified?.trim() || doc.datePublished;
                const parsedDate = new Date(rawDate);
                if (isNaN(parsedDate.getTime())) continue;

                dynamicRoutes.push({
                    url: fullUrl.toLowerCase(),
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

// ✅ Generate sitemap
async function generateSitemap() {
    try {
        const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");
        const sitemap = new SitemapStream({ hostname: BASE_URL });
        const writeStream = fs.createWriteStream(sitemapPath);
        sitemap.pipe(writeStream);

        // Static routes
        let staticRoutes = extractStaticRoutes();
        staticRoutes = staticRoutes.filter(route => route.toLowerCase() !== EXCLUDED_ROUTE.toLowerCase());
        console.log("📝 Adding static routes:", staticRoutes.length);

        staticRoutes.forEach(route => {
            sitemap.write({
                url: route.toLowerCase(),
                changefreq: "hourly",
                priority: 0.8,
            });
        });

        // Dynamic routes
        const dynamicRoutes = await fetchDynamicRoutes();
        console.log("📝 Adding dynamic routes:", dynamicRoutes.length);
        dynamicRoutes.forEach(route => sitemap.write(route));

        sitemap.end();
        await streamToPromise(sitemap);
        console.log("✅ Sitemap generated successfully!");
    } catch (err) {
        console.error("❌ Error generating sitemap:", err);
    }
}

generateSitemap();
