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
        console.error(` Error reading App.tsx:`, err);
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
        console.error(` Error reading data directory:`, err);
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

            const filename = path.basename(filePath, ".json");

            jsonData.forEach(item => {
                // Handle products.json differently
                if (filename === "products") {
                    if (!item.id || !item.mainEntityOfPage) {
                        console.warn(`⚠️ Skipping invalid product:`, item);
                        return;
                    }

                    const rawDate = item.dateModified && item.dateModified.trim() !== ""
                        ? item.dateModified
                        : item.datePublished || new Date().toISOString();

                    const route = {
                        url: item.mainEntityOfPage.toLowerCase(),
                        changefreq: "weekly",
                        priority: 0.9,
                        lastmod: new Date(rawDate).toISOString(),
                    };
                    dynamicRoutes.push(route);
                } else {
                    // Original logic for other JSON files
                    if (!item.id || !item.datePublished) {
                        console.warn(`⚠️ Skipping invalid entry in ${filePath}:`, item);
                        return;
                    }

                    const urlBase = filename.includes("remotejobs") ? "/extra-income/remote-jobs"
                        : filename.includes("freelancejobs") ? "/extra-income/freelance-jobs"
                            : filename.includes("moneymakingapps") ? "/extra-income/money-making-apps"
                                : filename.includes("budgetdata") ? "/extra-income/budget"
                                    : filename.includes("startablogdata") ? "/start-a-blog"
                                        : filename.includes("breakingnews") ? "/breaking-news"
                                            : "";

                    if (urlBase) {
                        const rawDate = item.dateModified && item.dateModified.trim() !== ""
                            ? item.dateModified
                            : item.datePublished;

                        if (!rawDate || isNaN(new Date(rawDate).getTime())) {
                            console.warn(`⚠️ Invalid date in file: ${filePath}`);
                            console.warn(`   Post ID: ${item.id}`);
                            console.warn(`   datePublished: ${item.datePublished}`);
                            console.warn(`   dateModified: ${item.dateModified}`);
                            return;
                        }

                        const route = {
                            url: `${urlBase}/${item.id}`.toLowerCase(),
                            changefreq: "monthly",
                            priority: 0.8,
                            lastmod: new Date(rawDate).toISOString(),
                        };
                        dynamicRoutes.push(route);
                    }
                }
            });

        } catch (err) {
            console.error(` Error reading ${filePath}:`, err);
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
        console.error(` Error generating sitemap:`, err);
    }
}

generateSitemap();