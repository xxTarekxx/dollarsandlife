"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");

// Load .env from script directory (no dotenv dependency)
function loadEnv() {
    const envPath = path.join(__dirname, ".env");
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, "utf-8");
        for (const line of content.split("\n")) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#")) {
                const eq = trimmed.indexOf("=");
                if (eq > 0) {
                    const key = trimmed.slice(0, eq).trim();
                    let val = trimmed.slice(eq + 1).trim();
                    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
                    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
                    if (key && !process.env[key]) process.env[key] = val;
                }
            }
        }
    }
}
loadEnv();

// --- Configuration (from .env — do not commit credentials) ---
const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.MONGO_DB_NAME || "dollarsandlife_data";
const STATUS_FILE_PATH = path.resolve(__dirname, "upload_status.json");

// Known JSON files and their collections (fallback: file basename)
const FILE_COLLECTION_MAPPINGS = [
    { fileName: "breakingnews.json", collectionName: "breaking_news" },
    { fileName: "budgetdata.json", collectionName: "budget_data" },
    { fileName: "freelancejobs.json", collectionName: "freelance_jobs" },
    { fileName: "moneymakingapps.json", collectionName: "money_making_apps" },
    { fileName: "remotejobs.json", collectionName: "remote_jobs" },
    { fileName: "startablogdata.json", collectionName: "start_a_blog" }
];

// --- Helper Functions ---

function getFileHash(filePath) {
    const content = fs.readFileSync(filePath, "utf-8");
    return crypto.createHash("sha256").update(content).digest("hex");
}

function stableStringify(value) {
    const seen = new WeakSet();
    const normalize = (v) => {
        if (v === null || typeof v !== "object") return v;
        if (seen.has(v)) return "[Circular]";
        seen.add(v);

        if (Array.isArray(v)) return v.map(normalize);

        const out = {};
        for (const key of Object.keys(v).sort()) out[key] = normalize(v[key]);
        return out;
    };

    return JSON.stringify(normalize(value));
}

function getItemKey(item) {
    if (item && typeof item === "object") {
        // Prefer stable IDs for multilingual wrapper format:
        // { articleId, languages: { en: { ... } } }
        if (item.articleId) return { field: "articleId", value: String(item.articleId) };
        if (item.languages?.en?.id) return { field: "articleId", value: String(item.languages.en.id) };
        if (item.id) return { field: "id", value: String(item.id) };
        if (item.canonicalUrl) return { field: "canonicalUrl", value: String(item.canonicalUrl) };
        if (item.languages?.en?.canonicalUrl)
            return { field: "canonicalUrl", value: String(item.languages.en.canonicalUrl) };
        if (item.url) return { field: "url", value: String(item.url) };
        // sortOrder is less stable and should be the last fallback
        if (item.sortOrder !== undefined && item.sortOrder !== null && item.sortOrder !== "")
            return { field: "sortOrder", value: item.sortOrder };
    }
    return null;
}

function getItemHash(item) {
    return crypto.createHash("sha256").update(stableStringify(item)).digest("hex");
}

function getItemDisplayName(item) {
    if (!item || typeof item !== "object") return "Unknown item";
    return (
        item.articleId ||
        item.headline ||
        item.languages?.en?.headline ||
        item.title ||
        item.name ||
        item.id ||
        item.canonicalUrl ||
        item.languages?.en?.canonicalUrl ||
        item.url ||
        "Unknown item"
    );
}

function loadUploadStatuses() {
    if (fs.existsSync(STATUS_FILE_PATH)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(STATUS_FILE_PATH, "utf-8"));
            // Back-compat: old format was { [fileName]: "fileHash" }
            if (parsed && typeof parsed === "object" && !parsed.files) {
                return { version: 2, files: {} };
            }
            return parsed;
        } catch (err) {
            console.warn("⚠️ Could not parse upload_status.json. Starting fresh.", err.message);
            return { version: 2, files: {} };
        }
    }
    return { version: 2, files: {} };
}

function saveUploadStatuses(statuses) {
    try {
        fs.writeFileSync(STATUS_FILE_PATH, JSON.stringify(statuses, null, 2), "utf-8");
    } catch (err) {
        console.error("❌ Error saving upload_status.json:", err);
    }
}

function discoverJsonFilesInDir(dirPath) {
    // Only process known article data files so we don't accidentally scan
    // unrelated JSON files (package.json, status files, etc.).
    return FILE_COLLECTION_MAPPINGS
        .map((m) => m.fileName)
        .filter((fileName) => fs.existsSync(path.resolve(dirPath, fileName)));
}

function getCollectionNameForFile(fileName) {
    const found = FILE_COLLECTION_MAPPINGS.find((m) => m.fileName === fileName);
    if (found) return found.collectionName;
    return path.basename(fileName, ".json");
}

// --- Main Sync Logic ---

(async () => {
    if (!MONGO_URI) {
        console.error("❌ MONGO_URI is not set. Add it to blog/articles/.env");
        process.exit(1);
    }

    const uploadStatuses = loadUploadStatuses();
    const newUploadStatuses = { version: 2, files: { ...(uploadStatuses.files || {}) } };
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        console.log("✅ Connected to MongoDB.");
        const db = client.db(DB_NAME);

        const jsonFiles = discoverJsonFilesInDir(__dirname);
        for (const fileName of jsonFiles) {
            const filePath = path.resolve(__dirname, fileName);
            const collectionName = getCollectionNameForFile(fileName);

            const currentHash = getFileHash(filePath);
            const prior = newUploadStatuses.files[fileName] || {};
            const lastHash = prior.fileHash;

            if (lastHash && currentHash === lastHash) {
                console.log(`ℹ️ No content change for ${fileName}. Skipping.`);
                continue;
            }

            console.log(`🔄 Processing ${fileName} (content changed or first time)...`);

            let jsonData;
            try {
                jsonData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
            } catch (err) {
                console.error(`❌ Error parsing ${fileName}: ${err.message}. Skipping.`);
                continue;
            }

            if (!Array.isArray(jsonData)) {
                console.error(`❌ ${fileName} does not contain a JSON array. Skipping.`);
                continue;
            }

            const collection = db.collection(collectionName);
            const priorItemHashes = prior.itemHashes && typeof prior.itemHashes === "object" ? prior.itemHashes : {};
            const nextItemHashes = { ...priorItemHashes };
            let updated = 0,
                inserted = 0,
                skippedMissingKey = 0,
                skippedUnchanged = 0;

            for (const item of jsonData) {
                const key = getItemKey(item);
                if (!key) {
                    console.warn(`⚠️ Skipped item in ${fileName} — missing sortOrder, canonicalUrl, url, or id.`);
                    skippedMissingKey++;
                    continue;
                }

                const compositeKey = `${key.field}:${key.value}`;
                const itemHash = getItemHash(item);
                if (nextItemHashes[compositeKey] && nextItemHashes[compositeKey] === itemHash) {
                    skippedUnchanged++;
                    continue;
                }

                try {
                    const query = { [key.field]: key.value };
                    const result = await collection.updateOne(query, { $set: item }, { upsert: true });
                    const name = getItemDisplayName(item);
                    if (result.upsertedCount > 0) {
                        inserted++;
                        console.log(`  ➕ Inserted: ${name} (${key.field}=${key.value})`);
                    } else if (result.modifiedCount > 0) {
                        updated++;
                        console.log(`  🔄 Updated:  ${name} (${key.field}=${key.value})`);
                    }
                    nextItemHashes[compositeKey] = itemHash;
                } catch (err) {
                    console.error(`❌ MongoDB error in ${fileName}:`, err.message);
                }
            }

            console.log(
                `✅ Finished ${fileName} → ${collectionName}: ➕ ${inserted} inserted, 🔄 ${updated} updated, ⏭️ ${skippedUnchanged} unchanged, ⚠️ ${skippedMissingKey} missing key`
            );

            newUploadStatuses.files[fileName] = {
                fileHash: currentHash,
                itemHashes: nextItemHashes,
                lastSyncedAt: new Date().toISOString(),
                collectionName
            };
        }

    } catch (err) {
        console.error("❌ Main error:", err);
    } finally {
        await client.close();
        saveUploadStatuses(newUploadStatuses);
        console.log("🚪 MongoDB disconnected. 💾 Upload statuses saved.");
    }
})();
