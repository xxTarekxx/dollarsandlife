import * as fs from 'fs';
import * as path from 'path';
import { SitemapStream, streamToPromise } from 'sitemap';

const BASE_URL = 'https://www.dollarsandlife.com';

/**
 * Extracts route paths from App.tsx by scanning for <Route path="..."> entries.
 */
function extractRoutesFromApp(): string[] {
    const appFilePath = path.resolve(__dirname, '../src/App.tsx');
    try {
        const appFileContent = fs.readFileSync(appFilePath, 'utf-8');
        const routeRegex = /<Route\s+path=["']([^"']+)["']/g;
        const routes: string[] = [];

        let match;
        while ((match = routeRegex.exec(appFileContent)) !== null) {
            if (!routes.includes(match[1]) && !match[1].includes('*') && !match[1].includes(':')) {
                routes.push(match[1]); //  Exclude dynamic routes
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
 * Generates the sitemap dynamically by including static and JSON-based routes.
 */
async function generateSitemap() {
    try {
        const sitemap = new SitemapStream({ hostname: BASE_URL });
        const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
        const writeStream = fs.createWriteStream(sitemapPath);

        sitemap.pipe(writeStream);

        //  Extract static routes and add RSS feed
        const staticRoutes = [
            ...extractRoutesFromApp(),
            "/rss-feed" // ✅ Add RSS feed route
        ];

        staticRoutes.forEach(route => {
            sitemap.write({ url: route, changefreq: 'hourly', priority: 0.5 });
        });

        sitemap.end();
        await streamToPromise(sitemap);
        console.log(`✅ Sitemap generated successfully at: ${sitemapPath}`);
    } catch (err) {
        console.error(`❌ Error generating sitemap:`, err);
    }
}

// Run sitemap generation automatically
generateSitemap();
