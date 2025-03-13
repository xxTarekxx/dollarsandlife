// ES module imports (no need for "import * as ...")
import * as path from 'path';
import * as fs from 'fs';

import { SitemapStream, streamToPromise } from 'sitemap';

// Define the base URL of your site
const BASE_URL = 'https://www.dollarsandlife.com';

// Define your static routes
const staticRoutes = [
  { url: '/', changefreq: 'monthly', priority: 1.0 },
  { url: '/extra-income', changefreq: 'monthly', priority: 0.8 },
  { url: '/extra-income/freelancers', changefreq: 'monthly', priority: 0.8 },
  { url: '/extra-income/Budget', changefreq: 'monthly', priority: 0.5 },
  { url: '/extra-income/remote-jobs', changefreq: 'monthly', priority: 0.5 },
  { url: '/extra-income/money-making-apps', changefreq: 'monthly', priority: 0.5 },
  { url: '/shopping-Deals', changefreq: 'weekly', priority: 0.9 },
  { url: '/start-a-blog', changefreq: 'monthly', priority: 0.2 },
  { url: '/my-story', changefreq: 'yearly', priority: 0.1 },
  { url: '/terms-of-service', changefreq: 'yearly', priority: 0.1 },
  { url: '/contact-us', changefreq: 'yearly', priority: 0.1 },
  { url: '/financial-calculators', changefreq: 'yearly', priority: 0.1 }
];

// Function to fetch dynamic routes from multiple JSON files
async function fetchDynamicRoutes(): Promise<{ url: string; changefreq: string; priority: number; lastmod: string }[]> {
  const dynamicRoutes: { url: string; changefreq: string; priority: number; lastmod: string }[] = [];

  // List of JSON files to read
  const jsonFiles = [
    path.resolve(__dirname, '../public/data/remotejobs.json'),
    path.resolve(__dirname, '../public/data/freelancejobs.json'),
    path.resolve(__dirname, '../public/data/moneymakingapps.json'),
    path.resolve(__dirname, '../public/data/budgetdata.json'),
    path.resolve(__dirname, '../public/data/startablogdata.json'),
    path.resolve(__dirname, '../public/data/mystory.json'),
    path.resolve(__dirname, '../public/data/products.json'),
    path.resolve(__dirname, '../public/data/breakingnews.json'),
    path.resolve(__dirname, '/src/pages/PrivacyPolicy.tsx'), 
  ];

  for (const filePath of jsonFiles) {
    try {
      console.log(`🔍 Reading file: ${filePath}`);
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);

      console.log(`✅ Loaded ${filePath}, total entries: ${jsonData.length}`);

      jsonData.forEach((post: { id: string; datePosted: string }) => {
        if (!post.id || !post.datePosted) {
          console.warn(`⚠️ Skipping invalid entry in ${filePath}:`, post);
          return;
        }

        // Map file paths to respective URL categories
        const urlBase =
          filePath.includes('remotejobs') ? '/extra-income/remote-jobs' :
          filePath.includes('freelancejobs') ? '/extra-income/freelancers' :
          filePath.includes('moneymakingapps') ? '/extra-income/money-making-apps' :
          filePath.includes('budgetdata') ? '/extra-income/Budget' :
          filePath.includes('startablogdata') ? '/start-a-blog' :
          filePath.includes('mystory') ? '/my-story' :
          filePath.includes('breakingnews') ? '/breaking-news' :
          '/products'; // Default category

        // Add entry to dynamic routes
        dynamicRoutes.push({
          url: `${urlBase}/${post.id}`,
          changefreq: 'daily',
          priority: 0.8,
          lastmod: post.datePosted || new Date().toISOString(),
        });

        console.log(`✅ Added URL: ${urlBase}/${post.id}`);
      });
    } catch (err) {
      console.error(`❌ Error reading ${filePath}:`, err);
    }
  }

  return dynamicRoutes;
}



// Function to generate the sitemap
async function generateSitemap() {
  try {
    // Create a new SitemapStream instance
    const sitemap = new SitemapStream({ hostname: BASE_URL });

    // Create a writable stream to output the sitemap to a file
    const sitemapPath = path.resolve(process.cwd(), '../public/sitemap.xml');

    const writeStream = fs.createWriteStream(sitemapPath);

    // Pipe the sitemap stream to the file stream
    sitemap.pipe(writeStream);

    // Add static routes to the sitemap
    staticRoutes.forEach((route) => sitemap.write(route));

    // Fetch dynamic routes and add them to the sitemap
    const dynamicRoutes = await fetchDynamicRoutes();
    dynamicRoutes.forEach((route) => sitemap.write(route));

    // End the sitemap stream
    sitemap.end();

    // Wait for the sitemap to fully write to the file
    await streamToPromise(sitemap);
    console.log('Sitemap generated successfully at:', sitemapPath);
  } catch (err) {
    console.error('Error generating sitemap:', err);
  }
}

// Run the sitemap generation if this script is run directly
if (process.argv[1] === path.resolve(process.cwd(), 'dist/generate-sitemap.js')) {
  generateSitemap().catch((err) => {
    console.error('Error during sitemap generation:', err);
  });
}
generateSitemap(); // Automatically execute the function when script runs
