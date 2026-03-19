"use strict";

/**
 * check-articles.cjs
 * Run from the articles/ folder:  node check-articles.cjs
 * Checks breakingnews.json for duplicate articleIds, canonicalUrls, and headlines.
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
    magenta:"\x1b[35m",
};
const ok   = `${c.green}✔${c.reset}`;
const warn = `${c.yellow}⚠${c.reset}`;
const fail = `${c.red}✖${c.reset}`;
const info = `${c.cyan}ℹ${c.reset}`;

function hr(char = "─", len = 62) {
    return c.dim + char.repeat(len) + c.reset;
}
function step(icon, label, value = "") {
    const val = value ? `  ${c.dim}${value}${c.reset}` : "";
    console.log(`  ${icon}  ${label}${val}`);
}
function section(title) {
    console.log("\n" + hr());
    console.log(`  ${c.bold}${title}${c.reset}`);
    console.log(hr() + "\n");
}

// ── Find duplicates in an array, returns Map(value → [indices]) ───────────────
function findDupes(arr) {
    const seen = new Map();
    arr.forEach((val, i) => {
        if (!val) return;
        const key = val.trim().toLowerCase();
        if (!seen.has(key)) seen.set(key, []);
        seen.get(key).push(i + 1); // 1-based
    });
    return new Map([...seen].filter(([, idxs]) => idxs.length > 1));
}

// ── Main ──────────────────────────────────────────────────────────────────────
console.log("\n" + hr("═"));
console.log(`  ${c.bold}${c.cyan}Breaking News — Duplicate Checker${c.reset}`);
console.log(hr("═") + "\n");

// 1. Locate file
const filePath = path.resolve(__dirname, "breakingnews.json");
step(info, "Looking for breakingnews.json...", filePath);

if (!fs.existsSync(filePath)) {
    step(fail, `${c.red}breakingnews.json not found.${c.reset}`);
    process.exit(1);
}

const stat = fs.statSync(filePath);
step(ok, "File found", `${(stat.size / 1024).toFixed(1)} KB`);

// 2. Parse JSON
step(info, "Parsing JSON...");
let articles;
try {
    articles = JSON.parse(fs.readFileSync(filePath, "utf8"));
} catch (e) {
    step(fail, `${c.red}JSON parse error: ${e.message}${c.reset}`);
    process.exit(1);
}

if (!Array.isArray(articles)) {
    step(fail, `${c.red}Expected an array at root level.${c.reset}`);
    process.exit(1);
}

step(ok, "Parsed successfully", `${articles.length} articles`);

// 3. Extract fields
step(info, "Extracting fields...");

const articleIds   = articles.map(a => a.articleId   || "");
const canonicals   = articles.map(a => a.languages?.en?.canonicalUrl || "");
const headlines    = articles.map(a => a.languages?.en?.headline     || "");
const sortOrders   = articles.map(a => a.sortOrder);

// 4. Check each field
const dupeIds       = findDupes(articleIds);
const dupeCanonical = findDupes(canonicals);
const dupeHeadline  = findDupes(headlines);

// sortOrder duplicates (numeric — handle separately)
const sortSeen = new Map();
sortOrders.forEach((s, i) => {
    if (s == null) return;
    if (!sortSeen.has(s)) sortSeen.set(s, []);
    sortSeen.get(s).push(i + 1);
});
const dupeSortOrder = new Map([...sortSeen].filter(([, idxs]) => idxs.length > 1));

// 5. Summary
section("Results");

const totalIssues = dupeIds.size + dupeCanonical.size + dupeHeadline.size + dupeSortOrder.size;

step(info, "Total articles",          `${c.bold}${articles.length}${c.reset}`);
step(
    dupeIds.size       ? fail : ok,
    "Duplicate articleIds",
    dupeIds.size       ? `${c.red}${c.bold}${dupeIds.size} group(s)${c.reset}` : `${c.green}none${c.reset}`
);
step(
    dupeCanonical.size ? fail : ok,
    "Duplicate canonicalUrls",
    dupeCanonical.size ? `${c.red}${c.bold}${dupeCanonical.size} group(s)${c.reset}` : `${c.green}none${c.reset}`
);
step(
    dupeHeadline.size  ? warn : ok,
    "Duplicate headlines",
    dupeHeadline.size  ? `${c.yellow}${c.bold}${dupeHeadline.size} group(s)${c.reset}` : `${c.green}none${c.reset}`
);
step(
    dupeSortOrder.size ? warn : ok,
    "Duplicate sortOrders",
    dupeSortOrder.size ? `${c.yellow}${c.bold}${dupeSortOrder.size} group(s)${c.reset}` : `${c.green}none${c.reset}`
);

// 6. Detail — print each duplicate group
function printDupes(dupeMap, label, valueGetter, color = c.red) {
    if (dupeMap.size === 0) return;
    section(label);
    let n = 0;
    for (const [key, idxs] of dupeMap) {
        n++;
        console.log(`  ${color}${n}. ${c.bold}Appears ${idxs.length}×${c.reset}  (article positions: ${idxs.join(", ")})`);
        console.log(`     ${c.dim}${valueGetter(key)}${c.reset}\n`);
    }
}

printDupes(dupeIds,       "Duplicate articleIds",    k => k,                       c.red);
printDupes(dupeCanonical, "Duplicate canonicalUrls", k => k,                       c.red);
printDupes(dupeHeadline,  "Duplicate Headlines",     k => k,                       c.yellow);
printDupes(dupeSortOrder, "Duplicate sortOrders",    k => `sortOrder: ${k}`,       c.yellow);

// 7. Missing fields check
section("Missing Fields");
let missingCount = 0;
articles.forEach((a, i) => {
    const issues = [];
    if (!a.articleId)                    issues.push("articleId");
    if (!a.languages?.en)                issues.push("languages.en");
    if (!a.languages?.en?.headline)      issues.push("headline");
    if (!a.languages?.en?.canonicalUrl)  issues.push("canonicalUrl");
    if (!a.languages?.en?.datePublished) issues.push("datePublished");
    if (issues.length) {
        missingCount++;
        console.log(`  ${warn}  Article #${i + 1} ${c.dim}(${a.articleId || "NO ID"})${c.reset} missing: ${c.yellow}${issues.join(", ")}${c.reset}`);
    }
});
if (missingCount === 0) {
    step(ok, `${c.green}All articles have required fields${c.reset}`);
}

// 8. Final verdict
console.log("\n" + hr("═"));
if (totalIssues === 0 && missingCount === 0) {
    console.log(`\n  ${ok}  ${c.green}${c.bold}All clear — no duplicates or missing fields found!${c.reset}\n`);
} else {
    console.log(`\n  ${fail}  ${c.red}${c.bold}${totalIssues} duplicate group(s) and ${missingCount} missing-field article(s) found.${c.reset}`);
    console.log(`       ${c.dim}Fix the issues above before uploading to MongoDB.${c.reset}\n`);
    process.exit(1);
}
