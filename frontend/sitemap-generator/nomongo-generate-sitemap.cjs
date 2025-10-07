"use strict";

const path = require("path");
const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");

const BASE_URL = "https://www.dollarsandlife.com";

function extractRoutesFromApp() {
    const appFilePath = path.resolve(__dirname, "../src/App.tsx");
    try {
        const appFileContent = fs.readFileSync(appFilePath, "utf-8");
        const routeRegex = /<Route\s+path=["']([^"']+)["']/g;
        const routes = [];

        let match;
        while ((match = routeRegex.exec(appFileContent)) !== null) {
            if (!routes.includes(match[1]) && !match[1].includes("*") && !match[1].includes(":")) {
                routes.push(match[1].toLowerCase());
            }
        }

        return routes;
    } catch (err) {
        console.error(`❌ Error reading App.tsx:`, err);
        return [];
    }
}

function getJsonFiles() {
    const dataDir = path.resolve(__dirname, "../public/data");
    try {
        const files = fs.readdirSync(dataDir)
            .filter(file => file.endsWith(".json"));

        return files.map(file => path.resolve(dataDir, file));
    } catch (err) {
        console.error(`❌ Error reading data directory:`, err);
        return [];
    }
}

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

            jsonData.forEach(item => {
                if (!item.canonicalUrl || !item.datePublished) {
                    console.warn(`⚠️ Skipping entry missing canonicalUrl or datePublished:`, item);
                    return;
                }

                const url = item.canonicalUrl; // Use as-is since it's already a full URL

                const rawDate = item.dateModified && item.dateModified.trim() !== ""
                    ? item.dateModified
                    : item.datePublished;

                if (!rawDate || isNaN(new Date(rawDate).getTime())) {
                    console.warn(`⚠️ Invalid date for URL: ${url}`);
                    return;
                }

                // Convert absolute URL to relative for SitemapStream
                const relativeUrl = url.toLowerCase().replace(/^https?:\/\/[^\/]+/, '');

                const route = {
                    url: relativeUrl,
                    changefreq: "monthly",
                    priority: 0.8,
                    lastmod: new Date(rawDate).toISOString(),
                };

                dynamicRoutes.push(route);
            });

        } catch (err) {
            console.error(`❌ Error reading ${filePath}:`, err);
        }
    }

    return dynamicRoutes;
}

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


    } catch (err) {
        console.error(`❌ Error generating sitemap:`, err);
    }
}

generateSitemap();
