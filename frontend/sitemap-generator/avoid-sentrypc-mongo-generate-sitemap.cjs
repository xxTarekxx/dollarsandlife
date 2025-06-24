"use strict";

const path = require("path");
const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");
const { MongoClient } = require("mongodb");

// ✅ Load environment variables from .env
const dotenvPath = path.resolve(__dirname, "../.env");
console.log("🔍 Looking for .env at:", dotenvPath);

require("dotenv").config({ path: dotenvPath });

// ✅ Check Mongo URI
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ MONGO_URI is undefined. Check your .env file.");
    process.exit(1);
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

// ❗ IMPORTANT: Set this to the exact path string from your App.tsx
const ROUTE_TO_EXCLUDE = "/sentry-pc-employee-monitoring-systems";

// ✅ Extract static routes from App.tsx
function extractRoutesFromApp() {
    const appFilePath = path.resolve(__dirname, "../src/App.tsx");
    try {
        const content = fs.readFileSync(appFilePath, "utf-8");
        const routeRegex = /<Route\s+path=["']([^"']+)["']/g;
        const routes = [];

        let match;
        while ((match = routeRegex.exec(content)) !== null) {
            const route = match[1]; // This is the raw path string from App.tsx
            const lowerRoute = route.toLowerCase();

            if (
                !route.includes("*") && // Check original route for * and :
                !route.includes(":") &&
                !routes.includes(lowerRoute) && // Check if the lowercase version is already added
                lowerRoute !== ROUTE_TO_EXCLUDE.toLowerCase() // Compare lowercase versions
            ) {
                routes.push(lowerRoute);
            }
        }
        console.log(`📢 Extracted static routes (after attempting to exclude '${ROUTE_TO_EXCLUDE}'):`, routes);
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

                let urlPath = doc.canonicalUrl;
                if (urlPath.startsWith(BASE_URL)) {
                    urlPath = urlPath.substring(BASE_URL.length);
                }
                // Also exclude if it somehow comes from dynamic routes
                if (urlPath.toLowerCase() === ROUTE_TO_EXCLUDE.toLowerCase()) {
                    console.log(`ℹ️ Skipping dynamic route that matches exclusion: ${doc.canonicalUrl}`);
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
    console.log(`📢 Fetched ${dynamicRoutes.length} dynamic routes.`);
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
        const allStaticRoutes = extractRoutesFromApp(); // Call it once
        const finalStaticRoutes = [ // Ensure ads.txt and rss.xml are not accidentally excluded
            ...allStaticRoutes.filter(r => r !== "/ads.txt" && r !== "/rss.xml"),
            "/ads.txt",
            "/rss.xml"
        ].filter((value, index, self) => self.indexOf(value) === index); // Deduplicate

        console.log("Writing static routes:", finalStaticRoutes);
        finalStaticRoutes.forEach(route => {
            // Ensure leading slash for consistency if `route` doesn't have one, though `extractRoutesFromApp` should provide it.
            const urlPath = route.startsWith('/') ? route : `/${route}`;
            sitemap.write({
                url: urlPath.toLowerCase(),
                changefreq: "hourly",
                priority: 0.8,
            });
        });

        // Dynamic article routes
        const dynamicRoutes = await fetchDynamicRoutes();
        console.log("Writing dynamic routes:", dynamicRoutes.map(r => r.url));
        dynamicRoutes.forEach(route => sitemap.write(route));

        sitemap.end();
        await streamToPromise(sitemap);
        console.log("✅ Sitemap generated successfully at:", sitemapPath);

    } catch (err) {
        console.error("❌ Error generating sitemap:", err);
    }
}

generateSitemap();