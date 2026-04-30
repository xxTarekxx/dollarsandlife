"use strict";

/**
 * check-sitemap.cjs
 * Run from the public/ folder:  node check-sitemap.cjs
 * Reads sitemap.xml, checks for duplicate <loc> URLs, and prints a report.
 */

const fs   = require("fs");
const path = require("path");

// ── Colours ───────────────────────────────────────────────────────────────────
const c = {
    reset:  "\x1b[0m",
    bold:   "\x1b[1m",
    dim:    "\x1b[2m",
    green:  "\x1b[32m",
    yellow: "\x1b[33m",
    red:    "\x1b[31m",
    cyan:   "\x1b[36m",
    white:  "\x1b[37m",
};
const ok    = `${c.green}✔${c.reset}`;
const warn  = `${c.yellow}⚠${c.reset}`;
const fail  = `${c.red}✖${c.reset}`;
const info  = `${c.cyan}ℹ${c.reset}`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function hr(char = "─", len = 60) {
    return c.dim + char.repeat(len) + c.reset;
}

function step(icon, label, value = "") {
    const val = value ? `  ${c.dim}${value}${c.reset}` : "";
    console.log(`  ${icon}  ${label}${val}`);
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log("\n" + hr("═"));
console.log(`  ${c.bold}${c.cyan}Sitemap Duplicate Checker${c.reset}`);
console.log(hr("═") + "\n");

// 1. Locate sitemap.xml
const sitemapPath = path.resolve(__dirname, "sitemap.xml");
step(info, "Looking for sitemap.xml...", sitemapPath);

if (!fs.existsSync(sitemapPath)) {
    step(fail, `${c.red}sitemap.xml not found. Run the build first.${c.reset}`);
    process.exit(1);
}

const stat = fs.statSync(sitemapPath);
step(ok, "File found", `${(stat.size / 1024).toFixed(1)} KB`);

// 2. Read & parse
step(info, "Reading file...");
const xml = fs.readFileSync(sitemapPath, "utf8");

step(info, "Extracting <loc> URLs...");
const locRegex = /<loc>\s*(.*?)\s*<\/loc>/g;
const urls = [];
let match;
while ((match = locRegex.exec(xml)) !== null) {
    urls.push(match[1].trim());
}

step(ok, "URLs extracted", `${urls.length} total`);

// 3. Find duplicates
step(info, "Scanning for duplicates...");
const seen   = new Map(); // url → first occurrence index
const dupes  = new Map(); // url → count

urls.forEach((url, idx) => {
    if (seen.has(url)) {
        dupes.set(url, (dupes.get(url) || 1) + 1);
    } else {
        seen.set(url, idx + 1);
    }
});

// 4. Report
console.log("\n" + hr());
console.log(`  ${c.bold}Results${c.reset}`);
console.log(hr() + "\n");

step(info, "Total URLs",       `${c.white}${urls.length}${c.reset}`);
step(info, "Unique URLs",      `${c.green}${seen.size}${c.reset}`);
step(info, "Duplicate groups", dupes.size > 0
    ? `${c.red}${c.bold}${dupes.size}${c.reset}`
    : `${c.green}0${c.reset}`);

if (dupes.size === 0) {
    console.log("\n" + hr());
    console.log(`\n  ${ok}  ${c.green}${c.bold}No duplicates found — sitemap looks clean!${c.reset}\n`);
} else {
    console.log("\n" + hr());
    console.log(`\n  ${warn}  ${c.yellow}${c.bold}Duplicate URLs detected:${c.reset}\n`);

    let n = 0;
    for (const [url, count] of [...dupes.entries()].sort((a, b) => b[1] - a[1])) {
        n++;
        console.log(`  ${c.red}${n}.${c.reset} ${c.bold}×${count}${c.reset}  ${url}`);
    }

    console.log("\n" + hr());
    console.log(`\n  ${fail}  ${c.red}Fix duplicates in mongo-generate-sitemap.cjs before submitting to Google.${c.reset}\n`);
    process.exit(1);
}
