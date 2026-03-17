"use strict";

const path = require("path");
const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");
const { MongoClient } = require("mongodb");

// ✅ Load environment variables from server and frontend .env
const serverDotenvPath = path.resolve(__dirname, "../../server/.env");
const frontendDotenvPath = path.resolve(__dirname, "../.env");
require("dotenv").config({ path: serverDotenvPath });
require("dotenv").config({ path: frontendDotenvPath });

// ✅ Check Mongo URI
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error("❌ MONGO_URI is undefined. Check your server .env file.");
    console.log("⚠️ Proceeding without dynamic routes.");
}

// ✅ Config
const BASE_URL = "https://www.dollarsandlife.com";
const DEFAULT_LANG = "en";

/** Top 20 languages — mirrors lib/i18n/languages.ts supportedLanguages. */
const ALL_LANGS = [
    "en", "es", "de", "ja", "fr", "pt", "ru", "it",
    "nl", "pl", "tr", "fa", "zh", "vi", "id", "cs",
    "ko", "uk", "hu", "ar",
];

/**
 * PATH_LANGUAGES — mirrors lib/i18n/translationStatus.ts PATH_LANGUAGES.
 * Kept in sync manually since this is a CJS script that cannot import TypeScript.
 *
 * Keys:
 *   Exact path  : "/about-us"          → specific page only
 *   Wildcard    : "/breaking-news/*"   → all slugs under that prefix
 *
 * Values: array of language codes that have translated content for that path.
 * All routes use ALL_LANGS — runtime translation covers every language.
 */
const PATH_LANGUAGES = Object.freeze({
    // ── Static pages ─────────────────────────────────────────────────────────
    "/":                                    ALL_LANGS,
    "/about-us":                            ALL_LANGS,
    "/contact-us":                          ALL_LANGS,
    "/privacy-policy":                      ALL_LANGS,
    "/return-policy":                       ALL_LANGS,
    "/terms-of-service":                    ALL_LANGS,
    "/financial-calculators":               ALL_LANGS,
    "/shopping-deals":                      ALL_LANGS,
    "/start-a-blog":                        ALL_LANGS,
    "/extra-income":                        ALL_LANGS,
    "/extra-income/budget":                 ALL_LANGS,
    "/extra-income/freelance-jobs":         ALL_LANGS,
    "/extra-income/remote-online-jobs":     ALL_LANGS,
    "/extra-income/money-making-apps":      ALL_LANGS,
    "/breaking-news":                       ALL_LANGS,
    "/forum":                               ALL_LANGS,
    // ── Wildcard routes (article / product detail pages) ─────────────────────
    "/breaking-news/*":                     ALL_LANGS,
    "/extra-income/budget/*":               ALL_LANGS,
    "/extra-income/freelance-jobs/*":       ALL_LANGS,
    "/extra-income/remote-online-jobs/*":   ALL_LANGS,
    "/extra-income/money-making-apps/*":    ALL_LANGS,
    "/shopping-deals/products/*":           ALL_LANGS,
    "/start-a-blog/*":                      ALL_LANGS,
    "/forum/post/*":                        ALL_LANGS,
});

/**
 * Precomputed wildcard rules from PATH_LANGUAGES, sorted longest-first.
 * Mirrors translationStatus.ts WILDCARD_RULES — same safe-match algorithm.
 */
const WILDCARD_RULES = Object.keys(PATH_LANGUAGES)
    .filter(p => p.endsWith("/*"))
    .sort((a, b) => b.length - a.length)
    .map(rule => ({ rule, prefix: rule.slice(0, -2) }));

/**
 * Return the languages available for a given path (without lang prefix).
 * Uses the same exact-then-wildcard logic as translationStatus.ts.
 */
function getLanguagesForPath(rawPath) {
    const normalized = rawPath.split("?")[0].replace(/\/$/, "") || "/";

    // 1. Exact match
    if (PATH_LANGUAGES[normalized]) return PATH_LANGUAGES[normalized];

    // 2. Wildcard match (safe boundary: /breaking-newsletters ≠ /breaking-news/*)
    for (const { rule, prefix } of WILDCARD_RULES) {
        if (normalized === prefix || normalized.startsWith(prefix + "/")) {
            return PATH_LANGUAGES[rule] || [DEFAULT_LANG];
        }
    }

    // 3. Fallback
    return [DEFAULT_LANG];
}

/**
 * Absolute URL for a lang + path combo.
 * English (DEFAULT_LANG) has no prefix:  https://…/about-us
 * Others have /{lang}/ prefix:           https://…/ar/about-us
 */
function langUrl(lang, p) {
    if (lang === DEFAULT_LANG) {
        return p ? `${BASE_URL}${p}` : BASE_URL;
    }
    return p ? `${BASE_URL}/${lang}${p}` : `${BASE_URL}/${lang}`;
}

/**
 * Build hreflang links for a path (without lang prefix), e.g. "/about-us" or "/".
 * Only emits languages returned by getLanguagesForPath() — not all languages.
 * English href uses no prefix; x-default also points at the English (no-prefix) URL.
 */
function buildHreflangLinks(pathWithoutLangArg) {
    const p = pathWithoutLangArg === "/" ? "" : pathWithoutLangArg;
    const langs = getLanguagesForPath(pathWithoutLangArg);

    const links = langs.map((lang) => ({
        lang,
        url: langUrl(lang, p),
    }));

    // x-default → English no-prefix URL
    links.push({ lang: "x-default", url: langUrl(DEFAULT_LANG, p) });

    return links;
}

/**
 * Sitemap URL entry for a given lang + normalizedPath.
 * English: /breaking-news/slug  (no /en/ prefix)
 * Others:  /ar/breaking-news/slug
 */
function sitemapUrl(lang, normalizedPath) {
    if (lang === DEFAULT_LANG) {
        return normalizedPath === "/" ? "/" : normalizedPath;
    }
    return normalizedPath === "/" ? `/${lang}` : `/${lang}${normalizedPath}`;
}

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

// ✅ Excluded routes (never add to sitemap)
const EXCLUDED_ROUTES = [
    "/sentrypc-landing",
    "/forum/create-post",  // Form page; noindex, not for SEO
    "/forum/my-posts",     // User-specific; noindex, not for SEO
];

// ✅ Static routes (without lang prefix — lang prefix is added during write)
function extractStaticRoutes() {
    return [
        "/",
        "/about-us",
        "/contact-us",
        "/return-policy",
        "/privacy-policy",
        "/terms-of-service",
        "/extra-income",
        "/shopping-deals",
        "/start-a-blog",
        "/breaking-news",
        "/financial-calculators",
        "/ads.txt",
        "/rss.xml"
    ];
}

// ✅ Fetch dynamic routes from MongoDB
async function fetchDynamicRoutes() {
    if (!MONGO_URI) return [];

    const client = new MongoClient(MONGO_URI);
    const dynamicRoutes = [];

    try {
        await client.connect();
        const db = client.db(DB_NAME);

        for (const collectionName of COLLECTIONS) {
            const collection = db.collection(collectionName);
            const documents = await collection.find({}).toArray();

            for (const doc of documents) {
                // Support both new multilingual structure (doc.languages.en.*) and legacy flat structure
                const langEn = doc.languages?.en;
                const canonicalUrl = langEn?.canonicalUrl || doc.canonicalUrl;
                const datePublished = langEn?.datePublished || doc.datePublished;
                const dateModified = langEn?.dateModified || doc.dateModified;

                if (!canonicalUrl || !datePublished) continue;

                const urlPath = canonicalUrl.toLowerCase();
                if (EXCLUDED_ROUTES.some(r => urlPath === r.toLowerCase())) {
                    console.log(`🚫 Skipping excluded route: ${urlPath}`);
                    continue;
                }

                const fullUrl = canonicalUrl; // Use as-is since it's already a full URL

                const rawDate = dateModified?.trim() || datePublished;
                const parsedDate = new Date(rawDate);
                if (isNaN(parsedDate.getTime())) continue;

                // Convert absolute URL to relative for SitemapStream
                const relativeUrl = fullUrl.toLowerCase().replace(/^https?:\/\/[^\/]+/, '');

                dynamicRoutes.push({
                    url: relativeUrl,
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

    return dynamicRoutes;
}

// ✅ Generate sitemap
async function generateSitemap() {
    try {
        const sitemapPath = path.resolve(__dirname, "../public/sitemap.xml");
        const sitemap = new SitemapStream({
            hostname: BASE_URL,
            xmlns: { xhtml: true },
        });
        const writeStream = fs.createWriteStream(sitemapPath);
        sitemap.pipe(writeStream);

        // Static routes: one URL per language with hreflang links
        let staticRoutes = extractStaticRoutes();
        staticRoutes = staticRoutes.filter(route =>
            !EXCLUDED_ROUTES.some(r => route.toLowerCase() === r.toLowerCase())
        );
        const pathNorm = (r) => (!r || r === "/") ? "/" : (r.startsWith("/") ? r : "/" + r).toLowerCase();
        console.log("📝 Adding static routes (multilingual)...");

        staticRoutes.forEach((route) => {
            const normalizedPath = pathNorm(route);
            const langs = getLanguagesForPath(normalizedPath);
            const links = buildHreflangLinks(normalizedPath);
            // Emit one URL entry per available language
            // English: /about-us (no /en/ prefix)   Others: /ar/about-us
            langs.forEach((lang) => {
                sitemap.write({
                    url: sitemapUrl(lang, normalizedPath),
                    changefreq: "hourly",
                    priority: 0.8,
                    links,
                });
            });
        });

        // Dynamic routes: one URL per language with hreflang links
        const dynamicRoutes = await fetchDynamicRoutes();
        console.log(`📝 Adding dynamic routes: ${dynamicRoutes.length} articles`);
        dynamicRoutes.forEach((route) => {
            const articlePath = route.url.startsWith("/") ? route.url : `/${route.url}`;
            const langs = getLanguagesForPath(articlePath);
            const links = buildHreflangLinks(articlePath);
            // English: /breaking-news/slug (no /en/ prefix)   Others: /ar/breaking-news/slug
            langs.forEach((lang) => {
                sitemap.write({
                    url: sitemapUrl(lang, articlePath),
                    changefreq: route.changefreq || "monthly",
                    priority: route.priority ?? 0.8,
                    lastmod: route.lastmod,
                    links,
                });
            });
        });

        sitemap.end();
        await streamToPromise(sitemap);
        console.log("✅ Sitemap generated successfully!");
    } catch (err) {
        console.error("❌ Error generating sitemap:", err);
    }
}

generateSitemap();
