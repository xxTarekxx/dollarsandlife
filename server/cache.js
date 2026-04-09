// cache.js — Redis-backed cache with automatic in-memory fallback
//
// Usage:
//   const cache = require('./cache');
//   await cache.get(key)          → value or null
//   await cache.set(key, value, ttlSeconds)
//   await cache.del(key)
//   await cache.flush()           → clear all cache entries
//   cache.isRedis()               → true if connected to Redis
//
// Install Redis on VPS:
//   sudo apt install redis-server && sudo systemctl enable redis
// Install package:
//   npm install ioredis

'use strict';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const DEFAULT_TTL = 3600; // 1 hour

// ── In-memory fallback ────────────────────────────────────────────────────────
// Used when Redis is unavailable. Simple Map with TTL.
class MemoryCache {
    constructor() {
        this._store = new Map();
        // Sweep expired entries every 5 minutes so memory doesn't grow unbounded
        this._sweepInterval = setInterval(() => this._sweep(), 5 * 60 * 1000);
        this._sweepInterval.unref(); // don't keep the process alive for this
    }

    async get(key) {
        const entry = this._store.get(key);
        if (!entry) return null;
        if (Date.now() > entry.expiresAt) {
            this._store.delete(key);
            return null;
        }
        return entry.value;
    }

    async set(key, value, ttl = DEFAULT_TTL) {
        this._store.set(key, {
            value,
            expiresAt: Date.now() + ttl * 1000,
        });
    }

    async del(key) {
        this._store.delete(key);
    }

    async flush() {
        this._store.clear();
    }

    _sweep() {
        const now = Date.now();
        for (const [key, entry] of this._store) {
            if (now > entry.expiresAt) this._store.delete(key);
        }
    }

    get size() { return this._store.size; }
}

// ── Redis client ──────────────────────────────────────────────────────────────
let _redis = null;
let _usingRedis = false;
let _memCache = null;

async function init() {
    // Already initialised
    if (_redis || _memCache) return;

    try {
        // Dynamically require so the server still starts if ioredis isn't installed yet
        const Redis = require('ioredis');
        const client = new Redis(REDIS_URL, {
            lazyConnect: true,          // don't auto-connect; we control it
            maxRetriesPerRequest: 1,    // fail fast — don't queue requests while disconnected
            retryStrategy: (times) => {
                if (times > 3) return null; // stop retrying after 3 attempts
                return Math.min(times * 200, 2000);
            },
            enableOfflineQueue: false,  // throw immediately when disconnected
            connectTimeout: 3000,
        });

        await client.connect();
        await client.ping(); // confirm it's actually reachable

        client.on('error', (err) => {
            if (!err.message.includes('ECONNREFUSED')) {
                console.warn('[cache] Redis error:', err.message);
            }
        });

        _redis = client;
        _usingRedis = true;
        console.log(`✅ [cache] Connected to Redis at ${REDIS_URL}`);
    } catch (err) {
        console.warn(`⚠️  [cache] Redis unavailable (${err.message}) — falling back to in-memory cache`);
        _memCache = new MemoryCache();
        _usingRedis = false;
    }
}

// ── Public API ────────────────────────────────────────────────────────────────
const cache = {
    /** Must be called once at startup before any get/set calls */
    init,

    isRedis() { return _usingRedis; },

    async get(key) {
        try {
            if (_usingRedis && _redis) {
                const raw = await _redis.get(key);
                if (raw === null) return null;
                return JSON.parse(raw);
            }
            if (_memCache) return _memCache.get(key);
        } catch (err) {
            console.warn('[cache] get error:', err.message);
        }
        return null;
    },

    async set(key, value, ttl = DEFAULT_TTL) {
        try {
            if (_usingRedis && _redis) {
                await _redis.setex(key, ttl, JSON.stringify(value));
                return;
            }
            if (_memCache) await _memCache.set(key, value, ttl);
        } catch (err) {
            console.warn('[cache] set error:', err.message);
        }
    },

    async del(key) {
        try {
            if (_usingRedis && _redis) { await _redis.del(key); return; }
            if (_memCache) await _memCache.del(key);
        } catch (err) {
            console.warn('[cache] del error:', err.message);
        }
    },

    /** Flush all entries — useful for a cache-bust webhook */
    async flush() {
        try {
            if (_usingRedis && _redis) {
                // Only flush keys belonging to this app (prefixed with 'dl:')
                const keys = await _redis.keys('dl:*');
                if (keys.length) await _redis.del(...keys);
                return;
            }
            if (_memCache) await _memCache.flush();
        } catch (err) {
            console.warn('[cache] flush error:', err.message);
        }
    },

    /** Stats endpoint helper */
    async stats() {
        if (_usingRedis && _redis) {
            const keys = await _redis.keys('dl:*');
            return { backend: 'redis', keys: keys.length, url: REDIS_URL };
        }
        if (_memCache) {
            return { backend: 'memory', keys: _memCache.size };
        }
        return { backend: 'none' };
    },
};

module.exports = cache;
