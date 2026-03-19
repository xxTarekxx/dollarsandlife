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

const ALL_LANGS_SET = new Set(ALL_LANGS);

/**
 * Sitemap rule: only include a URL when translation exists.
 * - Static pages: only the default (en) URL — no /es, /de, etc. until translated.
 * - MongoDB pages: only languages present in doc.languages (no URL if no translation).
 */
const STATIC_PATHS = new Set([
    "/", "/about-us", "/contact-us", "/privacy-policy", "/return-policy",
    "/terms-of-service", "/financial-calculators", "/shopping-deals",
    "/start-a-blog", "/extra-income", "/extra-income/budget",
    "/extra-income/freelance-jobs", "/extra-income/remote-online-jobs",
    "/extra-income/money-making-apps", "/breaking-news", "/forum",
]);

/** Languages to emit for a static path — only default (en); no URL without translation. */
function getLanguagesForStaticPath(rawPath) {
    const normalized = rawPath.split("?")[0].replace(/\/$/, "") || "/";
    return STATIC_PATHS.has(normalized) ? [DEFAULT_LANG] : [DEFAULT_LANG];
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
 * Build hreflang links for a given path using the provided langs array.
 * x-default always points at the English (no-prefix) URL.
 */
function buildHreflangLinks(pathWithoutLangArg, langs) {
    const p = pathWithoutLangArg === "/" ? "" : pathWithoutLangArg;

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
 * Root is "/" → final URL ends as …/ ; all other paths have no trailing slash.
 * English: /breaking-news/slug  (no /en/ prefix)
 * Others:  /ar/breaking-news/slug
 */
function sitemapUrl(lang, normalizedPath) {
    const path = normalizedPath === "/" ? "/" : normalizedPath.replace(/\/+$/, "");
    if (lang === DEFAULT_LANG) {
        return path === "/" ? "/" : path;
    }
    return path === "/" ? `/${lang}` : `/${lang}${path}`;
}

/**
 * Pretty-print XML: insert newlines and indent each tag.
 * Applied after SitemapStream writes its compact single-line output.
 */
function prettifyXml(xml) {
    const INDENT = "  ";
    let depth = 0;
    let output = "";

    // Split on tag boundaries while keeping the delimiters
    const tokens = xml.split(/(<[^>]+>)/g);

    for (const token of tokens) {
        if (!token) continue;

        if (token.startsWith("</")) {
            // Closing tag — dedent first
            depth = Math.max(0, depth - 1);
            output += INDENT.repeat(depth) + token + "\n";
        } else if (token.startsWith("<?") || token.startsWith("<!")) {
            // Declaration or processing instruction
            output += token + "\n";
        } else if (token.startsWith("<") && token.endsWith("/>")) {
            // Self-closing tag
            output += INDENT.repeat(depth) + token + "\n";
        } else if (token.startsWith("<")) {
            // Opening tag
            output += INDENT.repeat(depth) + token + "\n";
            depth++;
        } else {
            // Text content — skip pure whitespace
            const trimmed = token.trim();
            if (trimmed) {
                output += INDENT.repeat(depth) + trimmed + "\n";
            }
        }
    }

    return output.trimEnd();
}

// ── XSL stylesheet content ────────────────────────────────────────────────────
// Generated alongside sitemap.xml so the browser renders a styled table view.
// Google's crawler ignores the stylesheet and reads the raw XML.
const SITEMAP_XSL = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">

  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>

  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <meta charset="UTF-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Sitemap — Dollars &amp; Life</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #f7f5ff; color: #333; padding: 0 0 60px; }
          .header { background: linear-gradient(135deg, #700877 0%, #b0196b 55%, #ff2759 100%); color: #fff; padding: 28px 40px 24px; display: flex; align-items: center; gap: 18px; }
          .header-logo { font-size: 1.7rem; font-weight: 800; letter-spacing: -0.5px; }
          .header-logo span { color: #ffd966; }
          .header-sub { font-size: 0.9rem; opacity: 0.85; margin-top: 3px; }
          .header-right { margin-left: auto; text-align: right; }
          .header-count { font-size: 2rem; font-weight: 700; line-height: 1; }
          .header-count-label { font-size: 0.78rem; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.06em; }
          .info-bar { background: #fff; border-bottom: 1px solid #e8e0f5; padding: 12px 40px; font-size: 0.82rem; color: #777; }
          .info-bar a { color: #700877; text-decoration: none; }
          .info-bar a:hover { text-decoration: underline; }
          .container { max-width: 1100px; margin: 32px auto 0; padding: 0 20px; }
          table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 4px 24px rgba(112,8,119,0.08); }
          thead tr { background: linear-gradient(135deg, #700877 0%, #b0196b 100%); color: #fff; }
          thead th { padding: 13px 18px; text-align: left; font-size: 0.78rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em; white-space: nowrap; }
          tbody tr { border-bottom: 1px solid #f0eaff; transition: background 0.12s; }
          tbody tr:last-child { border-bottom: none; }
          tbody tr:hover { background: #faf7ff; }
          tbody td { padding: 11px 18px; font-size: 0.85rem; vertical-align: middle; }
          .url-cell a { color: #700877; text-decoration: none; word-break: break-all; }
          .url-cell a:hover { color: #ff2759; text-decoration: underline; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 0.72rem; font-weight: 600; background: #f0eaff; color: #700877; }
          .priority-bar-wrap { display: flex; align-items: center; gap: 8px; }
          .priority-bar { flex: 1; height: 6px; background: #eee; border-radius: 3px; overflow: hidden; min-width: 60px; }
          .priority-bar-fill { height: 100%; background: linear-gradient(90deg, #700877, #ff2759); border-radius: 3px; }
          .priority-val { font-size: 0.8rem; color: #555; min-width: 24px; }
          .lastmod { color: #888; white-space: nowrap; font-size: 0.8rem; }
          @media (max-width: 640px) {
            .header { padding: 20px 16px; } .info-bar { padding: 10px 16px; } .container { padding: 0 10px; }
            thead th:nth-child(3), tbody td:nth-child(3) { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="header-logo">Dollars <span>&amp;</span> Life</div>
            <div class="header-sub">XML Sitemap — indexed pages for search engines</div>
          </div>
          <div class="header-right">
            <div class="header-count"><xsl:value-of select="count(sitemap:urlset/sitemap:url)"/></div>
            <div class="header-count-label">URLs</div>
          </div>
        </div>
        <div class="info-bar">
          This sitemap is intended for search engine crawlers. &#183;
          <a href="https://www.dollarsandlife.com">&#8592; Back to Dollars &amp; Life</a>
        </div>
        <div class="container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>URL</th>
                <th>Last Modified</th>
                <th>Change Freq</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              <xsl:for-each select="sitemap:urlset/sitemap:url">
                <tr>
                  <td style="color:#aaa;font-size:0.75rem;"><xsl:value-of select="position()"/></td>
                  <td class="url-cell">
                    <a href="{sitemap:loc}" target="_blank" rel="noopener"><xsl:value-of select="sitemap:loc"/></a>
                  </td>
                  <td class="lastmod"><xsl:if test="sitemap:lastmod"><xsl:value-of select="substring(sitemap:lastmod,1,10)"/></xsl:if></td>
                  <td><xsl:if test="sitemap:changefreq"><span class="badge"><xsl:value-of select="sitemap:changefreq"/></span></xsl:if></td>
                  <td>
                    <xsl:if test="sitemap:priority">
                      <div class="priority-bar-wrap">
                        <div class="priority-bar">
                          <div class="priority-bar-fill">
                            <xsl:attribute name="style">width: <xsl:value-of select="sitemap:priority * 100"/>%</xsl:attribute>
                          </div>
                        </div>
                        <span class="priority-val"><xsl:value-of select="sitemap:priority"/></span>
                      </div>
                    </xsl:if>
                  </td>
                </tr>
              </xsl:for-each>
            </tbody>
          </table>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;

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
    "/forum/create-post",
    "/forum/my-posts",
];

// ✅ Static page routes only (no ads.txt, rss.xml — not indexable pages)
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
    ];
}

// ✅ Fetch dynamic routes from MongoDB
// Each route now includes `availableLangs` — only the languages actually
// present in doc.languages (or ['en'] for legacy flat-structure documents).
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
                // Support both new multilingual structure (doc.languages.en.*)
                // and legacy flat structure (doc.canonicalUrl etc.)
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

                const rawDate = dateModified?.trim() || datePublished;
                const parsedDate = new Date(rawDate);
                if (isNaN(parsedDate.getTime())) continue;

                // Convert absolute URL to relative for SitemapStream
                let relativeUrl = canonicalUrl.toLowerCase().replace(/^https?:\/\/[^/]+/, "");

                // Strip any lang prefix stored in the DB
                // (e.g. /en/breaking-news/slug → /breaking-news/slug)
                const langPrefixRe = new RegExp(`^/(${ALL_LANGS.join("|")})/`);
                const langPrefixMatch = relativeUrl.match(langPrefixRe);
                if (langPrefixMatch) {
                    relativeUrl = relativeUrl.slice(langPrefixMatch[1].length + 1);
                }
                // No trailing slash (except root): …/start-a-blog not …/start-a-blog/
                if (relativeUrl !== "/" && relativeUrl.endsWith("/")) {
                    relativeUrl = relativeUrl.replace(/\/+$/, "");
                }

                // ── ACTUAL languages for this document ──────────────────────
                // Only emit sitemap entries for languages that have real content.
                // New multilingual docs: use the keys of doc.languages.
                // Legacy flat docs: English only.
                let availableLangs;
                if (doc.languages && typeof doc.languages === "object") {
                    availableLangs = Object.keys(doc.languages)
                        .filter(l => ALL_LANGS_SET.has(l));
                    // Always ensure English is included (it's the canonical version)
                    if (!availableLangs.includes(DEFAULT_LANG)) {
                        availableLangs.unshift(DEFAULT_LANG);
                    }
                } else {
                    // Legacy flat structure — English only
                    availableLangs = [DEFAULT_LANG];
                }

                dynamicRoutes.push({
                    url: relativeUrl,
                    changefreq: "monthly",
                    priority: 0.8,
                    lastmod: parsedDate.toISOString(),
                    availableLangs,
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

        // streamToPromise collects the entire stream into a Buffer — use it
        // directly instead of manually collecting chunks via .on("data").
        const sitemap = new SitemapStream({
            hostname: BASE_URL,
            xmlns: { xhtml: true },
        });

        // ── Static: only default (en) URL per path — no URL if no translation ─────────────
        let staticRoutes = extractStaticRoutes();
        staticRoutes = staticRoutes.filter(route =>
            !EXCLUDED_ROUTES.some(r => route.toLowerCase() === r.toLowerCase())
        );
        // Root stays "/"; all other paths normalized to no trailing slash (e.g. /start-a-blog not /start-a-blog/)
        const pathNorm = (r) => {
            const raw = (!r || r === "/") ? "/" : (r.startsWith("/") ? r : "/" + r).toLowerCase();
            return raw !== "/" && raw.endsWith("/") ? raw.replace(/\/+$/, "") : raw;
        };
        console.log("📝 Adding static routes (default language only)...");

        staticRoutes.forEach((route) => {
            const normalizedPath = pathNorm(route);
            const langs = getLanguagesForStaticPath(normalizedPath);
            const links = buildHreflangLinks(normalizedPath, langs);
            langs.forEach((lang) => {
                sitemap.write({
                    url: sitemapUrl(lang, normalizedPath),
                    changefreq: "hourly",
                    priority: 0.8,
                    links,
                });
            });
        });

        // ── Dynamic (MongoDB): only languages in doc.languages — no URL if no translation ─
        const dynamicRoutes = await fetchDynamicRoutes();
        console.log(`📝 Adding dynamic routes: ${dynamicRoutes.length} articles`);

        let totalLangEntries = 0;
        dynamicRoutes.forEach((route) => {
            const articlePath = route.url.startsWith("/") ? route.url : `/${route.url}`;
            const langs = route.availableLangs; // ← actual langs from DB, not assumed
            const links = buildHreflangLinks(articlePath, langs);

            langs.forEach((lang) => {
                sitemap.write({
                    url: sitemapUrl(lang, articlePath),
                    changefreq: route.changefreq || "monthly",
                    priority: route.priority ?? 0.8,
                    lastmod: route.lastmod,
                    links,
                });
                totalLangEntries++;
            });
        });

        console.log(`📊 Total article lang entries: ${totalLangEntries}`);

        sitemap.end();

        // ── Prettify and write ──────────────────────────────────────────────
        // streamToPromise resolves with the full Buffer of the sitemap output
        const buffer = await streamToPromise(sitemap);
        let rawXml = buffer.toString("utf8");

        // Inject XSL stylesheet reference so browsers render a styled table view.
        // Insert after the <?xml ...?> declaration on the first line.
        rawXml = rawXml.replace(
            /(<\?xml[^?]*\?>)/,
            '$1\n<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>'
        );

        const prettyXml = prettifyXml(rawXml);
        fs.writeFileSync(sitemapPath, prettyXml, "utf8");

        // Write the XSL stylesheet so browsers render a styled view
        const xslPath = path.resolve(__dirname, "../public/sitemap.xsl");
        fs.writeFileSync(xslPath, SITEMAP_XSL, "utf8");

        console.log("✅ Sitemap generated successfully!");
    } catch (err) {
        console.error("❌ Error generating sitemap:", err);
    }
}

generateSitemap();
