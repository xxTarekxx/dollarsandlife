// ES module imports (no need for "import * as ...")
import path from 'path';
import fs from 'fs';
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
    path.resolve(process.cwd(), 'public/data/remotejobs.json'),
    path.resolve(process.cwd(), 'public/data/freelancejobs.json'),
    path.resolve(process.cwd(), 'public/data/moneymakingapps.json'),
    path.resolve(process.cwd(), 'public/data/budgetdata.json'),
    path.resolve(process.cwd(), 'public/data/startablogdata.json'),
    path.resolve(process.cwd(), 'public/data/mystory.json'),
    path.resolve(process.cwd(), 'public/data/products.json'),
  ];

  // Loop through each JSON file and read its contents
  for (const filePath of jsonFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);

      jsonData.forEach((post: { id: string; datePosted: string }) => {
        if (!post.id || !post.datePosted) {
          console.error(`Invalid data in ${filePath}:`, post);
          return;
        }

        // Determine the URL base based on the file type
        const urlBase = filePath.includes('remotejobs')
          ? '/extra-income/remote-jobs'
          : filePath.includes('freelancejobs')
          ? '/extra-income/freelancers'
          : filePath.includes('moneymakingapps')
          ? '/extra-income/money-making-apps'
          : filePath.includes('budgetdata')
          ? '/extra-income/Budget'
          : filePath.includes('startablogdata')
          ? '/start-a-blog'
          : filePath.includes('mystory')
          ? '/my-story'
          : '/products'; // Default URL base for products

        // Add each entry in the JSON file to dynamic routes
        dynamicRoutes.push({
          url: `${urlBase}/${post.id}`,
          changefreq: 'weekly',
          priority: 0.7,
          lastmod: post.datePosted || new Date().toISOString(), // Use provided date or current date
        });
      });
    } catch (err) {
      console.error(`Error reading or parsing ${filePath}:`, err);
    }
  }

  return dynamicRoutes;
}

// Function to generate the sitemap
export async function generateSitemap() {
  try {
    // Create a new SitemapStream instance
    const sitemap = new SitemapStream({ hostname: BASE_URL });

    // Create a writable stream to output the sitemap to a file
    const sitemapPath = path.resolve(process.cwd(), 'public/sitemap.xml');
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
