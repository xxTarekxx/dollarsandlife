import { SitemapStream, streamToPromise } from 'sitemap';
import { createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// Convert __dirname to use with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Define the base URL of your site
const BASE_URL = 'https://www.dollarsandlife.com';
// Define your static routes
const staticRoutes = [
    { url: '/', changefreq: 'monthly', priority: 1.0 },
    { url: '/extra-income', changefreq: 'monthly', priority: 0.8 },
    { url: '/extra-income/freelancers', changefreq: 'monthly', priority: 0.8 },
    { url: '/extra-income/Budget', changefreq: 'monthly', priority: 0.5 },
    { url: '/extra-income/remote-jobs', changefreq: 'monthly', priority: 0.5 },
    { url: '/extra-income/side-hustles', changefreq: 'monthly', priority: 0.8 },
    { url: '/extra-income/money-making-apps', changefreq: 'monthly', priority: 0.5 },
    { url: '/shopping-Deals', changefreq: 'weekly', priority: 0.9 },
    { url: '/start-a-blog', changefreq: 'monthly', priority: 0.2 },
    { url: '/my-story', changefreq: 'yearly', priority: 0.1 },
    { url: '/terms-of-service', changefreq: 'yearly', priority: 0.1 },
    { url: '/contact-us', changefreq: 'yearly', priority: 0.1 },
    { url: '/financial-calculators', changefreq: 'yearly', priority: 0.1 }
];
// Function to fetch dynamic routes from multiple JSON files
async function fetchDynamicRoutes() {
    const dynamicRoutes = [];
    // List of JSON files to read
    const jsonFiles = [
        path.resolve(__dirname, '../public/data/remotejobs.json'), // Adjusted path to point to the correct location
        path.resolve(__dirname, '../public/data/freelancejobs.json'),
        path.resolve(__dirname, '../public/data/moneymakingapps.json'),
        path.resolve(__dirname, '../public/data/budgetdata.json'),
        path.resolve(__dirname, '../public/data/sidehustles.json'),
        path.resolve(__dirname, '../public/data/startablogdata.json'),
        path.resolve(__dirname, '../public/data/mystory.json'),
        path.resolve(__dirname, '../public/data/products.json'),
    ];
    // Loop through each JSON file
    jsonFiles.forEach((filePath) => {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        jsonData.forEach((post) => {
            // Construct the URL based on JSON data
            const urlBase = filePath.includes('remotejobs')
                ? '/extra-income/remote-jobs'
                : filePath.includes('freelancejobs')
                    ? '/extra-income/freelancers'
                    : filePath.includes('moneymakingapps')
                        ? '/extra-income/money-making-apps'
                        : filePath.includes('budgetdata')
                            ? '/extra-income/Budget'
                            : filePath.includes('sidehustles')
                                ? '/extra-income/side-hustles'
                                : filePath.includes('startablogdata')
                                    ? '/start-a-blog'
                                    : filePath.includes('mystory')
                                        ? '/my-story'
                                        : '/products'; // Default URL base
            // Add each entry in the JSON file to dynamic routes
            dynamicRoutes.push({
                url: `${urlBase}/${post.id}`,
                changefreq: 'weekly',
                priority: 0.7,
                lastmod: post.datePosted || new Date().toISOString() // Use provided date or current date
            });
        });
    });
    return dynamicRoutes;
}
// Function to handle generating the sitemap
async function generateSitemap() {
    // Create a new SitemapStream instance
    const sitemap = new SitemapStream({ hostname: BASE_URL });
    // Add static routes to the sitemap
    staticRoutes.forEach((route) => sitemap.write(route));
    // Fetch and add dynamic routes to the sitemap
    const dynamicRoutes = await fetchDynamicRoutes();
    dynamicRoutes.forEach((route) => sitemap.write(route));
    // End the sitemap stream
    sitemap.end();
    // Convert stream to promise and write the sitemap to the public directory
    const sitemapData = await streamToPromise(sitemap);
    createWriteStream(path.resolve(__dirname, '../public', 'sitemap.xml')).write(sitemapData); // Write to the correct location
    console.log('Sitemap generated successfully!');
}
// Run the sitemap generation
generateSitemap().catch((err) => {
    console.error('Error generating sitemap:', err);
});
