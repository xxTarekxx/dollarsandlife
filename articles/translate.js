"use strict";

/**
 * Translates article JSON files into multiple languages via OpenAI.
 * Preserves HTML, URLs, emojis, and icons; uses RTL-friendly output for Arabic.
 *
 * Supported input files (set INPUT_FILE env or default breakingnews.json):
 *   budgetdata.json, freelancejobs.json, remotejobs.json, moneymakingapps.json, startablogdata.json, breakingnews.json
 *
 * Usage:
 *   node translate.js
 *   INPUT_FILE=budgetdata.json node translate.js
 *
 * Idempotency:
 *   - Skips a target language if that locale already looks complete (headline + content
 *     section count matches English). Does not query MongoDB.
 *   - On load, removes `languages` keys not listed in SUPPORTED_LANGUAGES (drops retired
 *     locales so you do not keep duplicate/orphan translations).
 */

const fs = require("fs");
const path = require("path");

/* -------------------------------------------------- */
/* ENV */
/* -------------------------------------------------- */

function loadEnv() {
    const envPath = path.join(__dirname, ".env");
    if (!fs.existsSync(envPath)) return;

    const content = fs.readFileSync(envPath, "utf8");

    for (const line of content.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;

        const eq = trimmed.indexOf("=");
        if (eq <= 0) continue;

        const key = trimmed.slice(0, eq).trim();
        let val = trimmed.slice(eq + 1).trim();

        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);

        process.env[key] = val;
    }
}

loadEnv();

/* -------------------------------------------------- */
/* CONFIG */
/* -------------------------------------------------- */

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) throw new Error("Missing OPENAI_API_KEY");

const MODEL = "gpt-4.1-mini";
const RATE_LIMIT_MS = 50;
const BATCH_SIZE = Math.max(1, Number(process.env.BATCH_SIZE || "12"));
const INPUT_FILES = (process.env.INPUT_FILES
    ? process.env.INPUT_FILES.split(",")
    : [
        "budgetdata.json",
        "freelancejobs.json",
        "remotejobs.json",
        "moneymakingapps.json",
        "startablogdata.json",
        "breakingnews.json",
    ]
).map(s => s.trim()).filter(Boolean);

let CURRENT_INPUT_BASENAME = "";
let CURRENT_INPUT_FILE = "";
let CURRENT_PARTIAL_FILE = "";

const TRANSLATABLE_KEYS = new Set([
    "headline",
    "description",
    "subtitle",
    "text",
    "textContinuationNote",
    "stats",
    "keywords",
    "caption",
    "caseStudies",
    "authorityLinks",
    "bulletPoints",
    "expertQuotes",
    "personalTips",
    "articleBody",
    "articleSection"
]);

const RTL_LANG_CODES = new Set(["ar"]);

/** Source (en) + target locales only. */
const SUPPORTED_LANGUAGES = [
    { code: "en", name: "English" },
    { code: "zh", name: "Chinese (Simplified)" },
    { code: "es", name: "Spanish" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
    { code: "pt", name: "Portuguese (Brazil)" },
    { code: "ru", name: "Russian" },
    { code: "fr", name: "French" },
    { code: "ja", name: "Japanese" },
    { code: "de", name: "German" },
    { code: "vi", name: "Vietnamese" }
];

/* -------------------------------------------------- */
/* GLOBAL STATE */
/* -------------------------------------------------- */

let workingData = null;

let progressState = {
    articleIndex: 0,
    totalArticles: 0,
    languageIndex: 0,
    totalLanguages: 0,
    translatedElements: 0,
    totalElements: 0,
    currentLanguage: ""
};

let lastRenderTime = 0;
const RENDER_INTERVAL = 300;

/* -------------------------------------------------- */
/* UTILS */
/* -------------------------------------------------- */

function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

function delay(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function saveProgress() {
    if (!workingData) return;
    if (!CURRENT_PARTIAL_FILE || !CURRENT_INPUT_FILE) return;
    fs.writeFileSync(CURRENT_PARTIAL_FILE, JSON.stringify(workingData, null, 2));
    fs.writeFileSync(CURRENT_INPUT_FILE, JSON.stringify(workingData, null, 2));
}

function getLanguageName(code) {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)?.name || code;
}

function getTargetLanguages() {
    const requested = (process.env.TARGET_LANGS || "")
        .split(",")
        .map(s => s.trim())
        .filter(Boolean);
    if (requested.length === 0) {
        return SUPPORTED_LANGUAGES.filter(l => l.code !== "en").map(l => l.code);
    }
    const set = new Set(requested);
    return SUPPORTED_LANGUAGES.filter(l => l.code !== "en" && set.has(l.code)).map(l => l.code);
}

const ALLOWED_LANG_CODES = new Set(SUPPORTED_LANGUAGES.map(l => l.code));

/**
 * Drop languages.* keys not in SUPPORTED_LANGUAGES (e.g. old it, fa, hu).
 * Prevents carrying duplicate/orphan locales alongside the current set.
 */
function stripUnsupportedLanguages(articles) {
    if (!Array.isArray(articles)) return;
    let removed = 0;
    for (const wrapper of articles) {
        if (!wrapper.languages || typeof wrapper.languages !== "object") continue;
        for (const code of Object.keys(wrapper.languages)) {
            if (!ALLOWED_LANG_CODES.has(code)) {
                delete wrapper.languages[code];
                removed++;
            }
        }
    }
    if (removed > 0) {
        console.log(
            `🧹 Removed ${removed} language block(s) not in SUPPORTED_LANGUAGES`
        );
    }
}

/**
 * True only if we should skip API translation for this locale (already done).
 * Stricter than "any headline": content section count must match English when English has sections.
 */
function hasCompletedTranslation(article, langCode, english) {
    const lang = article.languages?.[langCode];
    if (!lang || typeof lang !== "object") return false;

    if (typeof lang.headline !== "string" || !lang.headline.trim()) return false;

    const enContent = english.content;
    if (Array.isArray(enContent) && enContent.length > 0) {
        if (!Array.isArray(lang.content) || lang.content.length !== enContent.length) {
            return false;
        }
    }

    return true;
}

/**
 * Convert flat article format (budgetdata, freelancejobs, etc.) to wrapper format
 * (articleId + languages.en) so the same translation loop works for all files.
 */
function normalizeToWrapperFormat(data) {
    if (!Array.isArray(data)) return data;
    return data.map((item, index) => {
        if (item.languages && item.languages.en) {
            return item;
        }
        if (item.id && (item.content || item.headline)) {
            return {
                articleId: item.id,
                sortOrder: item.sortOrder != null ? item.sortOrder : index,
                languages: { en: deepClone(item) }
            };
        }
        return item;
    });
}

/* -------------------------------------------------- */
/* PROGRESS BAR */
/* -------------------------------------------------- */

function progressBar(current, total, width = 30) {

    if (total <= 0) total = 1;

    const safeCurrent = Math.max(0, Math.min(current, total));
    const ratio = safeCurrent / total;

    const filled = Math.round(ratio * width);
    const safeFilled = Math.max(0, Math.min(width, filled));

    const empty = width - safeFilled;

    const bar =
        "█".repeat(safeFilled) +
        "░".repeat(empty);

    return `[${bar}] ${Math.round(ratio * 100)}%`;
}

function showStatus(articleId) {

    process.stdout.write("\x1Bc");

    const safeCurrent = Math.min(
        progressState.translatedElements,
        progressState.totalElements
    );

    const remaining = Math.max(
        0,
        progressState.totalElements - safeCurrent
    );

    console.log("========================================================");

    console.log(
        `ARTICLE ${progressState.articleIndex + 1} / ${progressState.totalArticles}`
    );

    console.log(`ID: ${articleId}`);

    console.log(
        `Languages completed: ${progressState.languageIndex} / ${progressState.totalLanguages}`
    );

    console.log(
        `Languages remaining: ${progressState.totalLanguages - progressState.languageIndex
        }`
    );

    console.log("");
    console.log(`Translating: ${progressState.currentLanguage}`);
    console.log("");

    console.log(
        `Elements translated: ${safeCurrent} / ${progressState.totalElements}`
    );

    console.log(`Remaining: ${remaining}`);
    console.log("");

    console.log(progressBar(safeCurrent, progressState.totalElements));

    console.log("========================================================");
}

/* -------------------------------------------------- */
/* COUNT */
/* -------------------------------------------------- */

function countTranslatableElements(node) {

    let count = 0;

    function walk(n) {

        if (!n) return;

        if (Array.isArray(n)) {
            n.forEach(walk);
            return;
        }

        if (typeof n !== "object") return;

        for (const key of Object.keys(n)) {

            const val = n[key];

            if (TRANSLATABLE_KEYS.has(key)) {

                if (typeof val === "string") count++;

                if (Array.isArray(val)) {
                    val.forEach(v => {
                        if (typeof v === "string") count++;
                    });
                }
            }

            if (typeof val === "object") walk(val);
        }
    }

    walk(node);
    return count;
}

/* -------------------------------------------------- */
/* OPENAI */
/* -------------------------------------------------- */

async function translateText(text, language, langCode) {

    if (!text || typeof text !== "string") return text;

    const rtlNote = RTL_LANG_CODES.has(langCode)
        ? " Use natural right-to-left ordering for this language. "
        : "";
    const preserveNote = " Preserve all emojis, icons, and Unicode symbols exactly; do not translate or remove them. ";

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {

        const res = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                input: `Translate into ${language}. Keep HTML and URLs unchanged.${preserveNote}${rtlNote}\n\n${text}`
            }),
            signal: controller.signal
        });

        clearTimeout(timeout);

        if (!res.ok) return text;

        const data = await res.json();

        return (
            data.output?.[0]?.content?.[0]?.text ||
            data.output_text ||
            text
        ).trim();

    } catch {
        return text;
    }
}

async function translateTextsBatch(texts, language, langCode) {
    if (!Array.isArray(texts) || texts.length === 0) return [];
    const rtlNote = RTL_LANG_CODES.has(langCode)
        ? " Use natural right-to-left ordering for this language. "
        : "";
    const preserveNote = " Preserve all emojis, icons, and Unicode symbols exactly; do not translate or remove them. ";
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);
    try {
        const payload = texts.map((t, i) => ({ i, text: t }));
        const res = await fetch("https://api.openai.com/v1/responses", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: MODEL,
                input:
                    `Translate each item into ${language}. Keep HTML and URLs unchanged.${preserveNote}${rtlNote}\n` +
                    `Return ONLY a valid JSON array where each element is {"i":number,"text":string}.\n` +
                    `Do not skip items. Do not add extra keys.\n\n` +
                    JSON.stringify(payload)
            }),
            signal: controller.signal
        });
        clearTimeout(timeout);
        if (!res.ok) return texts;
        const data = await res.json();
        const raw =
            data.output?.[0]?.content?.[0]?.text ||
            data.output_text ||
            "";
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return texts;
        const out = [...texts];
        for (const item of parsed) {
            if (
                item &&
                typeof item.i === "number" &&
                item.i >= 0 &&
                item.i < out.length &&
                typeof item.text === "string"
            ) {
                out[item.i] = item.text.trim();
            }
        }
        return out;
    } catch {
        return texts;
    }
}

/* -------------------------------------------------- */
/* RECURSIVE */
/* -------------------------------------------------- */

async function translateRecursive(node, language, langCode, articleId) {

    if (!node) return;

    if (Array.isArray(node)) {

        const stringIndexes = [];
        const stringValues = [];
        for (let i = 0; i < node.length; i++) {
            if (typeof node[i] === "string") {
                stringIndexes.push(i);
                stringValues.push(node[i]);
            }
        }
        for (let start = 0; start < stringValues.length; start += BATCH_SIZE) {
            await delay(RATE_LIMIT_MS);
            const chunkValues = stringValues.slice(start, start + BATCH_SIZE);
            const translatedChunk = await translateTextsBatch(chunkValues, language, langCode);
            for (let j = 0; j < translatedChunk.length; j++) {
                const originalIndex = stringIndexes[start + j];
                node[originalIndex] = translatedChunk[j];
                progressState.translatedElements++;
            }
            const now = Date.now();
            if (now - lastRenderTime > RENDER_INTERVAL) {
                showStatus(articleId);
                lastRenderTime = now;
            }
            saveProgress();
        }
        for (let i = 0; i < node.length; i++) {
            if (typeof node[i] !== "string") {
                await translateRecursive(node[i], language, langCode, articleId);
            }
        }

        return;
    }

    if (typeof node !== "object") return;

    for (const key of Object.keys(node)) {

        const val = node[key];

        if (!TRANSLATABLE_KEYS.has(key)) {
            if (typeof val === "object") {
                await translateRecursive(val, language, langCode, articleId);
            }
            continue;
        }

        if (typeof val === "string") {

            await delay(RATE_LIMIT_MS);

            node[key] = await translateText(val, language, langCode);

            progressState.translatedElements++;

            const now = Date.now();
            if (now - lastRenderTime > RENDER_INTERVAL) {
                showStatus(articleId);
                lastRenderTime = now;
            }

            saveProgress();

        } else if (Array.isArray(val)) {

            const stringIndexes = [];
            const stringValues = [];
            for (let i = 0; i < val.length; i++) {
                if (typeof val[i] === "string") {
                    stringIndexes.push(i);
                    stringValues.push(val[i]);
                }
            }
            for (let start = 0; start < stringValues.length; start += BATCH_SIZE) {
                await delay(RATE_LIMIT_MS);
                const chunkValues = stringValues.slice(start, start + BATCH_SIZE);
                const translatedChunk = await translateTextsBatch(chunkValues, language, langCode);
                for (let j = 0; j < translatedChunk.length; j++) {
                    const originalIndex = stringIndexes[start + j];
                    val[originalIndex] = translatedChunk[j];
                    progressState.translatedElements++;
                }
                const now = Date.now();
                if (now - lastRenderTime > RENDER_INTERVAL) {
                    showStatus(articleId);
                    lastRenderTime = now;
                }
                saveProgress();
            }
            for (let i = 0; i < val.length; i++) {
                if (typeof val[i] !== "string") {
                    await translateRecursive(val[i], language, langCode, articleId);
                }
            }
        }
    }
}

/* -------------------------------------------------- */
/* MAIN */
/* -------------------------------------------------- */

async function main() {
    const languages = getTargetLanguages();
    if (languages.length === 0) {
        throw new Error("No target languages selected. Check TARGET_LANGS.");
    }
    for (const basename of INPUT_FILES) {
        CURRENT_INPUT_BASENAME = basename;
        CURRENT_INPUT_FILE = path.join(__dirname, basename);
        CURRENT_PARTIAL_FILE = path.join(__dirname, basename.replace(/\.json$/, "") + ".partial.json");

        if (fs.existsSync(CURRENT_PARTIAL_FILE)) {
            workingData = JSON.parse(fs.readFileSync(CURRENT_PARTIAL_FILE, "utf8"));
            console.log(`⚡ Resuming from partial file for ${basename}`);
        } else {
            if (!fs.existsSync(CURRENT_INPUT_FILE)) {
                console.warn(`⚠ Input file not found: ${CURRENT_INPUT_FILE}. Skipping.`);
                continue;
            }
            workingData = JSON.parse(fs.readFileSync(CURRENT_INPUT_FILE, "utf8"));
            workingData = normalizeToWrapperFormat(workingData);
        }

        stripUnsupportedLanguages(workingData);
        console.log(`📂 Input: ${basename} (${workingData.length} articles)`);
        progressState.totalArticles = workingData.length;
        progressState.totalLanguages = languages.length;

        for (let i = 0; i < workingData.length; i++) {

            const wrapper = workingData[i];

            progressState.articleIndex = i;
            progressState.languageIndex = 0;

            if (!wrapper.languages) wrapper.languages = {};
            if (!wrapper.languages.en) {
                console.warn(`⚠ Skipping article ${i + 1}: no English source (languages.en)`);
                continue;
            }

            const english = deepClone(wrapper.languages.en);

            for (const langCode of languages) {

                if (hasCompletedTranslation(wrapper, langCode, english)) {
                    if (process.env.VERBOSE) {
                        console.log(
                            `  ⏭ skip ${langCode} (already complete for ${wrapper.articleId})`
                        );
                    }
                    progressState.languageIndex++;
                    continue;
                }

                const languageName = getLanguageName(langCode);

                progressState.translatedElements = 0;
                progressState.totalElements =
                    countTranslatableElements(english) + 10;

                progressState.currentLanguage = `${languageName} (${langCode})`;

                const translated = deepClone(english);

                await translateRecursive(translated, languageName, langCode, wrapper.articleId);

                showStatus(wrapper.articleId);
                console.log(`✔ Finished ${langCode}`);

                translated.language = langCode;

                wrapper.languages[langCode] = translated;

                progressState.languageIndex++;

                saveProgress();
            }
        }

        saveProgress();

        if (fs.existsSync(CURRENT_PARTIAL_FILE)) fs.unlinkSync(CURRENT_PARTIAL_FILE);
        console.log(`✅ Finished file: ${basename}`);
    }

    console.log("\n✅ COMPLETE (all input files)");
}

/* -------------------------------------------------- */
/* CTRL+C */
/* -------------------------------------------------- */

process.on("SIGINT", () => {
    console.log("\n⚠ Saving before exit...");
    saveProgress();
    process.exit();
});

/* -------------------------------------------------- */

main().catch(console.error);