"use strict";

const path = require("path");
const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");

const BASE_URL = "https://www.dollarsandlife.com";

/**
 * Extracts static route paths from App.tsx by scanning for <Route path="..."> entries.
 * Excludes wildcard (*) and dynamic parameter (:) routes.
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
                routes.push(match[1].toLowerCase()); //  Convert to lowercase
            }
        }

        console.log(` Extracted ${routes.length} static routes from App.tsx`);
        return routes;
    } catch (err) {
        console.error(` Error reading App.tsx:`, err);
        return [];
    }
}

/**
 * Reads the public/data directory and extracts valid JSON filenames dynamically.
 */
function getJsonFiles() {
    const dataDir = path.resolve(__dirname, "../public/data");
    try {
        const files = fs.readdirSync(dataDir)
            .filter(file => file.endsWith(".json"))
            .filter(file => !file.includes("products"));

        console.log(` Found ${files.length} JSON data files`);
        return files.map(file => path.resolve(dataDir, file));
    } catch (err) {
        console.error(` Error reading data directory:`, err);
        return [];
    }
}

/**
 * Fetches dynamic blog post routes from JSON content inside public/data directory.
 */
async function fetchDynamicRoutes() {
    const dynamicRoutes = [];
    const jsonFiles = getJsonFiles();

    for (const filePath of jsonFiles) {
        try {
            const fileContent = fs.readFileSync(filePath, "utf-8");
            const jsonData = JSON.parse(fileContent);

            if (!Array.isArray(jsonData)) {
                console.warn(`⚠️ Skipping non-array JSON file: ${filePath}`);
                continue;
            }

            jsonData.forEach(post => {
                if (!post.id || !post.datePublished) {
                    console.warn(`⚠️ Skipping invalid entry in ${filePath}:`, post);
                    return;
                }

                const filename = path.basename(filePath, ".json");
                const urlBase = filename.includes("remotejobs") ? "/extra-income/remote-jobs"
                    : filename.includes("freelancejobs") ? "/extra-income/freelancers"
                        : filename.includes("moneymakingapps") ? "/extra-income/money-making-apps"
                            : filename.includes("budgetdata") ? "/extra-income/budget"
                                : filename.includes("startablogdata") ? "/start-a-blog"
                                    : filename.includes("breakingnews") ? "/breaking-news"
                                        : "";

                if (urlBase) {
                    const lastmod = post.dateModified && post.dateModified.trim() !== ""
                        ? post.dateModified
                        : post.datePublished;


                    const route = {
                        url: `${urlBase}/${post.id}`.toLowerCase(), //  Ensure lowercase URLs
                        changefreq: "monthly",
                        priority: 0.8,
                        lastmod: lastmod,
                    };
                    dynamicRoutes.push(route);
                }
            });

        } catch (err) {
            console.error(` Error reading ${filePath}:`, err);
        }
    }

    return dynamicRoutes;
}

/**
 * Generates the sitemap dynamically by combining static and dynamic blog routes.
 */
async function generateSitemap() {
    try {
        const sitemap = new SitemapStream({ hostname: BASE_URL });
        const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");
        const writeStream = fs.createWriteStream(sitemapPath);

        sitemap.pipe(writeStream);

        const staticRoutes = [
            ...extractRoutesFromApp(),
            "/ads.txt",
            "/rss.xml"
        ];

        staticRoutes.forEach(route => {
            sitemap.write({ url: route.toLowerCase(), changefreq: "hourly", priority: 0.8 });
        });

        const dynamicRoutes = await fetchDynamicRoutes();
        dynamicRoutes.forEach(route => sitemap.write(route));

        sitemap.end();
        await streamToPromise(sitemap);
        console.log(` Sitemap generated successfully at: ${sitemapPath}`);
    } catch (err) {
        console.error(` Error generating sitemap:`, err);
    }
}

generateSitemap();
