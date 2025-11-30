import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
    throw new Error("❌ MONGODB_URI is missing in environment variables.");
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "dollarsandlife";

let cachedClient: MongoClient | null = null;

export async function getMongoClient(): Promise<MongoClient> {
    if (cachedClient) return cachedClient;

    // Use globalThis in dev to avoid multiple connections
    const globalAny: any = globalThis as any;

    if (globalAny._mongoClient) {
        cachedClient = globalAny._mongoClient as MongoClient;
        return cachedClient;
    }

    const client = new MongoClient(uri);
    await client.connect();

    if (process.env.NODE_ENV !== "production") {
        globalAny._mongoClient = client;
    }

    cachedClient = client;
    return client;
}

export async function db() {
    const client = await getMongoClient();
    return client.db(dbName);
}

