"use strict";

const path = require("path");
const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");

const BASE_URL = "https://www.dollarsandlife.com";

/**
 * Extracts route paths from App.tsx by scanning for <Route path="..."> entries.
 */
function extractRoutesFromApp() {
    const appFilePath = path.resolve(__dirname, "../src/App.tsx");
    try {
        const appFileContent = fs.readFileSync(appFilePath, "utf-8");
        const routeRegex = /<Route\s+path=["']([^"']+)["']/g;
        const routes = [];

        let match;
        while ((match = routeRegex.exec(appFileContent)) !== null) {
            if (!routes.includes(match[1]) && !match[1].includes('*') && !match[1].includes(':')) {
                routes.push(match[1]); //  Exclude wildcard and dynamic routes
            }
        }

        console.log(`✅ Extracted ${routes.length} valid routes from App.tsx`);
        return routes;
    } catch (err) {
        console.error(`❌ Error reading App.tsx:`, err);
        return [];
    }
}

/**
 * Reads the public/data directory and extracts JSON filenames dynamically.
 */
function getJsonFiles() {
    const dataDir = path.resolve(__dirname, "../public/data");
    try {
        const files = fs.readdirSync(dataDir)
            .filter(file => file.endsWith(".json"))
            .map(file => path.resolve(dataDir, file))
            .filter(file => !file.includes("products")); //  Remove products and my-story

        console.log(`✅ Found ${files.length} JSON data files`);
        return files;
    } catch (err) {
        console.error(`❌ Error reading data directory:`, err);
        return [];
    }
}

/**
 * Fetches dynamic routes from JSON content inside public/data directory.
 */
async function fetchDynamicRoutes() {
    const dynamicRoutes = [];
    const jsonFiles = getJsonFiles(); // Get JSON files dynamically

    for (const filePath of jsonFiles) {
        try {
            const fileContent = fs.readFileSync(filePath, "utf-8");
            const jsonData = JSON.parse(fileContent);

            //  Ensure JSON is an array before processing
            if (!Array.isArray(jsonData)) {
                console.warn(`⚠️ Skipping non-array JSON file: ${filePath}`);
                continue;
            }

            jsonData.forEach(post => {
                if (!post.id || !post.datePosted) {
                    console.warn(`⚠️ Skipping invalid entry in ${filePath}:`, post);
                    return;
                }

                // Generate URL based on filename
                const filename = path.basename(filePath, ".json");
                const urlBase = filename.includes("remotejobs") ? "/Extra-Income/Remote-Jobs"
                    : filename.includes("freelancejobs") ? "/Extra-Income/Freelancers"
                        : filename.includes("moneymakingapps") ? "/Extra-Income/Money-Making-Apps"
                            : filename.includes("budgetdata") ? "/Extra-Income/budget"
                                : filename.includes("startablogdata") ? "/Start-A-Blog"
                                    : filename.includes("breakingnews") ? "/breaking-news"
                                        : "";

                if (urlBase) {
                    dynamicRoutes.push({
                        url: `${urlBase}/${post.id}`,
                        changefreq: "daily",
                        priority: 0.8,
                        lastmod: post.datePosted || new Date().toISOString(),
                    });
                }
            });

        } catch (err) {
            console.error(`Error reading ${filePath}:`, err);
        }
    }

    return dynamicRoutes;
}

/**
 * Generates the sitemap dynamically by including static and JSON-based routes.
 */
async function generateSitemap() {
    try {
        const sitemap = new SitemapStream({ hostname: BASE_URL });
        const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");
        const writeStream = fs.createWriteStream(sitemapPath);

        sitemap.pipe(writeStream);

        //  Extract static routes and add RSS feed
        const staticRoutes = [
            ...extractRoutesFromApp(),
            "/rss-feed" // ✅ Add RSS feed route
        ];

        staticRoutes.forEach(route => {
            sitemap.write({ url: route, changefreq: "hourly", priority: 0.5 });
        });

        //  Fetch valid dynamic routes
        const dynamicRoutes = await fetchDynamicRoutes();
        dynamicRoutes.forEach(route => sitemap.write(route));

        sitemap.end();
        await streamToPromise(sitemap);
        console.log(`✅ Sitemap generated successfully at: ${sitemapPath}`);
    } catch (err) {
        console.error(`❌ Error generating sitemap:`, err);
    }
}

// Run sitemap generation automatically
generateSitemap();
