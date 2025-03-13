import * as path from 'path';
import * as fs from 'fs';
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
      if (!routes.includes(match[1])) {
        routes.push(match[1]);
      }
    }

    console.log(`✅ Extracted ${routes.length} routes from App.tsx`);
    return routes;
  } catch (err) {
    console.error(`❌ Error reading App.tsx:`, err);
    return [];
  }
}

/**
 * Reads the public/data directory and extracts JSON filenames dynamically.
 */
function getJsonFiles(): string[] {
  const dataDir = path.resolve(__dirname, '../public/data');
  try {
    const files = fs.readdirSync(dataDir)
      .filter(file => file.endsWith('.json'))
      .map(file => path.resolve(dataDir, file));

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
async function fetchDynamicRoutes(): Promise<{ url: string; changefreq: string; priority: number; lastmod: string }[]> {
  const dynamicRoutes: { url: string; changefreq: string; priority: number; lastmod: string }[] = [];
  const jsonFiles = getJsonFiles();

  for (const filePath of jsonFiles) {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);

      jsonData.forEach((post: { id: string; datePosted: string }) => {
        if (!post.id || !post.datePosted) return;

        // Generate URL based on filename
        const filename = path.basename(filePath, '.json');
        const urlBase = filename.includes('remotejobs') ? '/extra-income/remote-jobs'
          : filename.includes('freelancejobs') ? '/extra-income/freelancers'
          : filename.includes('moneymakingapps') ? '/extra-income/money-making-apps'
          : filename.includes('budgetdata') ? '/extra-income/budget'
          : filename.includes('startablogdata') ? '/start-a-blog'
          : filename.includes('mystory') ? '/my-story'
          : filename.includes('breakingnews') ? '/breaking-news'
          : '/products';

        dynamicRoutes.push({
          url: `${urlBase}/${post.id}`,
          changefreq: 'daily',
          priority: 0.8,
          lastmod: post.datePosted || new Date().toISOString(),
        });
      });
    } catch (err) {
      console.error(`❌ Error reading ${filePath}:`, err);
    }
  }

  return dynamicRoutes;
}

/**
 * Generates the sitemap dynamically by including static, component-based, and JSON-based routes.
 */
async function generateSitemap() {
  try {
    const sitemap = new SitemapStream({ hostname: BASE_URL });
    const sitemapPath = path.resolve(__dirname, '../public/sitemap.xml');
    const writeStream = fs.createWriteStream(sitemapPath);

    sitemap.pipe(writeStream);

    // 1️⃣ Get static routes from App.tsx
    const staticRoutes = extractRoutesFromApp();
    staticRoutes.forEach(route => {
      sitemap.write({ url: route, changefreq: 'monthly', priority: 0.8 });
    });

    // 2️⃣ Get dynamic routes from JSON files
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
