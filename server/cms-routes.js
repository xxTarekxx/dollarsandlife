'use strict';

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const sharp    = require('sharp');
const { Resend } = require('resend');
const { ObjectId } = require('mongodb');

const router      = express.Router();
const resendApiKey = process.env.RESEND_API_KEY;
const resend      = resendApiKey ? new Resend(resendApiKey) : null;
const JWT_SECRET  = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.CMS_ADMIN_EMAIL;
const UPLOAD_DIR  = process.env.CMS_UPLOAD_DIR || path.join(__dirname, '../frontend/public/images');

function sendEmailSafe(payload) {
    if (!resend) {
        console.warn('[cms] RESEND_API_KEY missing; email skipped');
        return;
    }
    resend.emails.send(payload).catch(e => console.warn('[cms] email failed:', e.message));
}

// ── Cookie parser (no extra dependency) ───────────────────────────────────────
function parseCookies(header) {
    const cookies = {};
    if (!header) return cookies;
    header.split(';').forEach(c => {
        const [k, ...v] = c.trim().split('=');
        if (k) cookies[k.trim()] = v.join('=').trim();
    });
    return cookies;
}

// ── JWT helpers ───────────────────────────────────────────────────────────────
function signToken(payload) {
    // Strip JWT metadata so re-signing never conflicts with existing exp/iat
    const { exp, iat, nbf, jti, ...clean } = payload;
    return jwt.sign(clean, JWT_SECRET, { expiresIn: '7d' });
}

function setTokenCookie(res, payload) {
    const token = signToken(payload);
    res.cookie('cms_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
    });
    return token;
}

// ── Auth middleware ────────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
    const cookies = parseCookies(req.headers.cookie);
    const token   = cookies.cms_token;
    if (!token) return res.status(401).json({ error: 'Not authenticated' });
    try {
        req.cmsUser = jwt.verify(token, JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}

function requireAdmin(req, res, next) {
    requireAuth(req, res, () => {
        if (req.cmsUser.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
        next();
    });
}

// ── Multer — author profile images ────────────────────────────────────────────
const authorStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path.join(UPLOAD_DIR, 'authors');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const ext  = path.extname(file.originalname).toLowerCase();
        const slug = req.cmsUser?.slug || 'author';
        cb(null, `${slug}-${Date.now()}${ext}`);
    },
});

// ── Multer — article images ───────────────────────────────────────────────────
const articleStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path.join(UPLOAD_DIR, 'articles');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, `article-${Date.now()}${ext}`);
    },
});

const articlePendingStorage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        const dir = path.join(UPLOAD_DIR, 'articles', '_pending');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
        const safeExt = /^\.[a-z0-9]+$/i.test(ext) ? ext : '.jpg';
        cb(null, `p-${Date.now()}-${Math.random().toString(36).slice(2, 10)}${safeExt}`);
    },
});

const uploadAuthor          = multer({ storage: authorStorage, limits: { fileSize: 5 * 1024 * 1024 } });
const uploadArticle         = multer({ storage: articleStorage, limits: { fileSize: 8 * 1024 * 1024 } });
const uploadArticlePending  = multer({ storage: articlePendingStorage, limits: { fileSize: 8 * 1024 * 1024 } });

const CATEGORY_MAP = {
    'breaking-news':     'breaking_news',
    'budget':            'budget_data',
    'freelance-jobs':    'freelance_jobs',
    'money-making-apps': 'money_making_apps',
    'remote-online-jobs':'remote_jobs',
    'start-a-blog':      'start_a_blog',
};

const ARTICLE_COLLECTIONS = Object.values(CATEGORY_MAP);

const COLLECTION_TO_CATEGORY_SLUG = Object.fromEntries(
    Object.entries(CATEGORY_MAP).map(([slug, col]) => [col, slug])
);

const COLLECTION_LABEL = {
    breaking_news:      'Breaking News',
    budget_data:        'Budget',
    freelance_jobs:     'Freelance Jobs',
    money_making_apps:  'Money Making Apps',
    remote_jobs:        'Remote / Online Jobs',
    start_a_blog:       'Start a Blog',
};

function findArticleFilter(articleId) {
    return { $or: [{ articleId }, { id: articleId }] };
}

function getArticleAuthorName(doc) {
    const en = doc.languages?.en || {};
    return (en.author && en.author.name) || (doc.author && doc.author.name) || '';
}

function imageFieldToUrl(img) {
    if (!img) return '';
    if (typeof img === 'string') return img;
    return img.url || '';
}

/** Merge cover image: DB often uses `{ url, caption }`; CMS forms use a URL string. */
function mergeArticleImage(proposedUrlStr, existing) {
    if (proposedUrlStr === undefined || proposedUrlStr === null || proposedUrlStr === '') {
        return existing;
    }
    const cap = typeof existing === 'object' && existing?.caption != null ? String(existing.caption) : '';
    return { url: String(proposedUrlStr), caption: cap };
}

function imageFieldCaption(img) {
    if (!img || typeof img === 'string') return '';
    return img.caption != null ? String(img.caption) : '';
}

/** Absolute URL for CMS <img src> when the browser page origin differs from the API/static host. */
function absolutePublicUrlFromReq(req, urlPath) {
    if (!urlPath || typeof urlPath !== 'string') return '';
    const u = urlPath.trim();
    if (!u) return '';
    if (/^https?:\/\//i.test(u) || u.startsWith('//')) return u;
    const pathOnly = u.startsWith('/') ? u : `/${u}`;
    let proto = (req.get('x-forwarded-proto') || req.protocol || 'http').split(',')[0].trim();
    if (!/^https?$/i.test(proto)) proto = 'http';
    const host = (req.get('x-forwarded-host') || req.get('host') || '').split(',')[0].trim();
    if (!host) return pathOnly;
    return `${proto}://${host}${pathOnly}`;
}

/** Same shape as `resolveLocale` in routes.js — flat EN slice for preview. */
function cmsResolveLocaleFlat(doc, locale = 'en') {
    if (!doc) return null;
    if (doc.languages && typeof doc.languages === 'object') {
        const localized =
            doc.languages[locale] && Object.keys(doc.languages[locale]).length
                ? doc.languages[locale]
                : doc.languages.en || {};
        return { id: doc.articleId || doc.id || '', sortOrder: doc.sortOrder, ...localized };
    }
    return { ...doc, id: doc.articleId || doc.id || '' };
}

function normalizeImageForBlog(img) {
    const url = imageFieldToUrl(img);
    const caption = imageFieldCaption(img);
    return { url, caption };
}

/** CMS block format → sections `BlogPostContent` understands. */
function contentBlocksToBlogSections(content) {
    if (!Array.isArray(content) || content.length === 0) return [];
    const first = content[0];
    if (!first || typeof first !== 'object' || !('type' in first)) {
        return content;
    }
    return content.map((block) => {
        if (!block || typeof block !== 'object') return {};
        if (block.authorityLinks !== undefined) return { authorityLinks: block.authorityLinks };
        if (block.stats !== undefined) return { stats: block.stats };
        if (!('type' in block)) return block;
        if (block.type === 'list') {
            return { bulletPoints: Array.isArray(block.items) ? block.items : [] };
        }
        if (block.type === 'heading' || block.type === 'subheading') {
            return { subtitle: block.text || '' };
        }
        if (block.type === 'quote') {
            return block.text ? { expertQuotes: [block.text] } : {};
        }
        return { text: block.text || '' };
    });
}

function buildPublicViewFromDoc(doc) {
    const resolved = cmsResolveLocaleFlat(doc, 'en');
    if (!resolved) return null;
    const rawImg = doc.languages?.en?.image !== undefined ? doc.languages.en.image : doc.image;
    const author = resolved.author || { name: getArticleAuthorName(doc) };
    const authorNorm = typeof author === 'object' && author && author.name
        ? author
        : { name: String(author || getArticleAuthorName(doc) || '') };
    return {
        id: resolved.id,
        headline: resolved.headline || '',
        author: authorNorm,
        datePublished: resolved.datePublished || '',
        dateModified: resolved.dateModified || '',
        image: normalizeImageForBlog(rawImg),
        content: contentBlocksToBlogSections(resolved.content || []),
        metaDescription: resolved.metaDescription || '',
        canonicalUrl: resolved.canonicalUrl,
    };
}

function mergeArticleImageForApprove(proposedUrlStr, proposedCaption, existing) {
    const existingUrl = imageFieldToUrl(existing);
    const existingCaption = imageFieldCaption(existing);
    const url = (proposedUrlStr !== undefined && proposedUrlStr !== null && String(proposedUrlStr).trim() !== '')
        ? String(proposedUrlStr).trim()
        : existingUrl;
    if (!url) return existing;
    let caption = '';
    if (proposedCaption !== undefined && String(proposedCaption).trim() !== '') {
        caption = String(proposedCaption).trim();
    } else if (existingCaption) {
        caption = existingCaption;
    }

    // If nothing effectively changed, keep existing DB value untouched.
    if (url === existingUrl && caption === existingCaption) {
        return existing;
    }
    return { url, caption };
}

function isSafePendingArticleBasename(name) {
    return typeof name === 'string' && /^p-\d+-[a-z0-9]+\.[a-z0-9.]+$/i.test(name);
}

function getSafeExistingImageRelativePath(urlPathStr) {
    const s = String(urlPathStr || '').split('?')[0];
    if (!s || !s.startsWith('/images/')) return null;
    if (s.includes('/_pending/')) return null;
    const rel = s.slice('/images/'.length);
    const parts = rel.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    // Only allow safe path segments and a webp output target.
    if (!parts.every((p) => /^[a-z0-9._-]+$/i.test(p))) return null;
    const last = parts[parts.length - 1];
    if (!/^[a-z0-9._-]+\.[a-z0-9]+$/i.test(last)) return null;
    const parsed = path.parse(last);
    if (!parsed.name || !/^[a-z0-9._-]+$/i.test(parsed.name)) return null;
    // Output is always WebP; keep original basename, force `.webp`.
    parts[parts.length - 1] = `${parsed.name}.webp`;
    return parts.join('/');
}

/** Convert `_pending` upload → WebP (~70% quality) in `articles/`, delete temp. Returns final `/images/articles/...` URL. */
async function finalizePendingArticleImage(urlPathStr, preferredOutputBasename = null) {
    const s = String(urlPathStr || '').split('?')[0];
    if (!s.includes('/images/articles/_pending/')) return urlPathStr;
    const base = path.basename(s);
    if (!isSafePendingArticleBasename(base)) return urlPathStr;
    const inputPath = path.join(UPLOAD_DIR, 'articles', '_pending', base);
    if (!fs.existsSync(inputPath)) return urlPathStr;
    const preferredRel = getSafeExistingImageRelativePath(preferredOutputBasename);
    const outRel = preferredRel || `articles/article-${Date.now()}.webp`;
    const outPath = path.join(UPLOAD_DIR, ...outRel.split('/'));
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const ext = path.extname(base).toLowerCase();
    if (ext === '.webp') {
        // Already WebP: bypass conversion but still copy/overwrite to final target path.
        await fs.promises.copyFile(inputPath, outPath);
    } else {
        await sharp(inputPath).rotate().webp({ quality: 70 }).toFile(outPath);
    }
    await fs.promises.unlink(inputPath).catch(() => {});
    return `/images/${outRel.replace(/\\/g, '/')}`;
}

async function deletePendingArticleFileIfAny(urlPathStr) {
    const s = String(urlPathStr || '').split('?')[0];
    if (!s.includes('/images/articles/_pending/')) return;
    const base = path.basename(s);
    if (!isSafePendingArticleBasename(base)) return;
    const p = path.join(UPLOAD_DIR, 'articles', '_pending', base);
    await fs.promises.unlink(p).catch(() => {});
}

/** Strip dangerous markup; keep safe `<a href="http(s):…">` and `<br>`. */
function sanitizeArticleBodyHtml(input) {
    if (input == null || typeof input !== 'string') return input;
    let s = input.replace(/<script[\s\S]*?<\/script>/gi, '');
    s = s.replace(/<style[\s\S]*?<\/style>/gi, '');
    s = s.replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '');
    s = s.replace(/javascript:/gi, '');
    s = s.replace(/<\s*iframe[^>]*>/gi, '');
    s = s.replace(/<a\s+([^>]*?)>([\s\S]*?)<\/a>/gi, (_m, attrs, inner) => {
        const hrefM = /href\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+))/i.exec(attrs);
        const href = (hrefM && (hrefM[2] || hrefM[3] || hrefM[4] || '')).trim();
        if (!/^https?:\/\//i.test(href)) return inner.replace(/<[^>]+>/g, '');
        const escHref = href.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        const innerPlain = String(inner).replace(/<[^>]+>/g, '');
        return `<a href="${escHref}" target="_blank" rel="noopener noreferrer">${innerPlain}</a>`;
    });
    s = s.replace(/<(?!\/?(?:br|a)\b)[^>]+>/gi, '');
    return s;
}

function stripAllHtml(s) {
    return String(s || '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function sanitizeProposedContentArray(content) {
    if (!Array.isArray(content)) return content;
    return content.map((section) => {
        if (!section || typeof section !== 'object') return section;
        const next = { ...section };
        if (typeof next.text === 'string') next.text = sanitizeArticleBodyHtml(next.text);
        if (typeof next.details === 'string') next.details = sanitizeArticleBodyHtml(next.details);
        if (typeof next.additionalInsights === 'string') next.additionalInsights = sanitizeArticleBodyHtml(next.additionalInsights);
        if (typeof next.authorityLinks === 'string') next.authorityLinks = sanitizeArticleBodyHtml(next.authorityLinks);
        if (Array.isArray(next.authorityLinks)) {
            next.authorityLinks = next.authorityLinks.map((x) => sanitizeArticleBodyHtml(String(x)));
        }
        if (typeof next.stats === 'string') next.stats = sanitizeArticleBodyHtml(next.stats);
        if (Array.isArray(next.stats)) next.stats = next.stats.map((x) => sanitizeArticleBodyHtml(String(x)));
        if (Array.isArray(next.items)) next.items = next.items.map((x) => sanitizeArticleBodyHtml(String(x)));
        return next;
    });
}

function validateArticleContentBlocks(content) {
    if (!Array.isArray(content) || content.length === 0) {
        return 'At least one content section is required';
    }
    let hasSubstantial = false;
    for (const section of content) {
        if (!section || typeof section !== 'object') {
            return 'Invalid content section';
        }
        if (section.authorityLinks !== undefined) {
            const v = section.authorityLinks;
            const ok = typeof v === 'string'
                ? v.trim().length >= 2
                : Array.isArray(v) && v.some((x) => String(x).trim().length >= 2);
            if (!ok) return 'Authority links section must have content';
            hasSubstantial = true;
            continue;
        }
        if (section.stats !== undefined) {
            const v = section.stats;
            const ok = typeof v === 'string'
                ? v.trim().length >= 2
                : Array.isArray(v) && v.some((x) => String(x).trim().length >= 2);
            if (!ok) return 'Stats section must have content';
            hasSubstantial = true;
            continue;
        }
        if (section.type === 'list') {
            const items = Array.isArray(section.items) ? section.items : [];
            if (!items.some((i) => String(i).trim().length > 0)) {
                return 'List sections must have at least one non-empty item';
            }
            hasSubstantial = true;
            continue;
        }
        if (section.type && section.type !== 'list') {
            if (!section.text || section.text.trim().length === 0) {
                return 'Text sections cannot be empty';
            }
            hasSubstantial = true;
            continue;
        }
        if (section.text !== undefined && !section.type) {
            if (!section.text || section.text.trim().length === 0) {
                return 'Text sections cannot be empty';
            }
            hasSubstantial = true;
        }
    }
    if (!hasSubstantial) return 'Article body cannot be empty';
    return null;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/cms/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = String(email || '').toLowerCase().trim();
        const rawPassword = String(password || '');
        if (!normalizedEmail || !rawPassword) return res.status(400).json({ error: 'Email and password required' });

        const author = await req.db.collection('authors').findOne({ email: normalizedEmail });
        if (!author) return res.status(401).json({ error: 'Invalid credentials' });
        if (author.disabled) return res.status(403).json({ error: 'Account disabled' });

        // Allow accidental leading/trailing spaces from copied temp passwords.
        const valid =
            await bcrypt.compare(rawPassword, author.passwordHash || '') ||
            (rawPassword !== rawPassword.trim() && await bcrypt.compare(rawPassword.trim(), author.passwordHash || ''));
        if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

        const payload = {
            id:                 author._id.toString(),
            slug:               author.slug,
            name:               author.name,
            email:              author.email,
            role:               author.role,
            mustChangePassword: author.mustChangePassword,
        };

        setTokenCookie(res, payload);
        res.json({ ok: true, mustChangePassword: author.mustChangePassword, role: author.role });
    } catch (err) {
        console.error('[cms] login error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cms/logout
router.post('/logout', (_req, res) => {
    res.clearCookie('cms_token', { path: '/' });
    res.json({ ok: true });
});

// GET /api/cms/me
router.get('/me', requireAuth, async (req, res) => {
    try {
        const author = await req.db.collection('authors').findOne(
            { email: req.cmsUser.email },
            { projection: { passwordHash: 0 } }
        );
        if (!author) return res.status(404).json({ error: 'Author not found' });
        res.json(author);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PASSWORD
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/cms/change-password
router.post('/change-password', requireAuth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' });
        if (newPassword.length < 8) return res.status(400).json({ error: 'New password must be at least 8 characters' });

        const author = await req.db.collection('authors').findOne({ email: req.cmsUser.email });
        const valid  = await bcrypt.compare(currentPassword, author.passwordHash || '');
        if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

        const hash = await bcrypt.hash(newPassword, 12);
        await req.db.collection('authors').updateOne(
            { email: req.cmsUser.email },
            { $set: { passwordHash: hash, mustChangePassword: false } }
        );

        // Re-issue token without mustChangePassword flag
        setTokenCookie(res, { ...req.cmsUser, mustChangePassword: false });
        res.json({ ok: true, role: author.role });
    } catch (err) {
        console.error('[cms] change-password error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// PROFILE
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/cms/profile
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const author = await req.db.collection('authors').findOne(
            { email: req.cmsUser.email },
            { projection: { passwordHash: 0 } }
        );
        res.json(author);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/cms/profile
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const { name, bio, title, expertise, linkedin, achievements, joinedDate } = req.body;
        const update = { profileComplete: true };
        if (name !== undefined) {
            const nextName = String(name).trim();
            if (!nextName) return res.status(400).json({ error: 'Display name cannot be empty' });
            update.name = nextName;
        }
        if (bio          !== undefined) update.bio               = bio;
        if (title        !== undefined) update.title             = title;
        if (expertise    !== undefined) update.expertise         = Array.isArray(expertise) ? expertise : [expertise];
        if (linkedin     !== undefined) update['social.linkedin']= linkedin;
        if (achievements !== undefined) update.achievements      = achievements;
        // Super user only: controls "Contributing since" shown on /authors cards.
        if (joinedDate !== undefined && req.cmsUser.role === 'admin') {
            const date = String(joinedDate || '').trim();
            if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
                return res.status(400).json({ error: 'joinedDate must be YYYY-MM-DD' });
            }
            update.joinedDate = date;
        }

        await req.db.collection('authors').updateOne({ email: req.cmsUser.email }, { $set: update });
        // Author pages are cached by /authors and /authors/:slug routes.
        const cache = require('./cache');
        await cache.flush().catch(() => {});
        if (update.name) {
            setTokenCookie(res, { ...req.cmsUser, name: update.name });
        }
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cms/upload-profile-image
router.post('/upload-profile-image', requireAuth, uploadAuthor.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    try {
        const inputPath = req.file.path;
        const parsed = path.parse(req.file.filename);
        const outputFileName = `${parsed.name}.webp`;
        const outputPath = path.join(path.dirname(inputPath), outputFileName);

        // Compress to WebP (80% quality) before storing on server.
        await sharp(inputPath)
            .rotate()
            .webp({ quality: 80 })
            .toFile(outputPath);

        // Remove original upload once WebP is written.
        await fs.promises.unlink(inputPath).catch(() => {});

        const url = `/images/authors/${outputFileName}`;
        await req.db.collection('authors').updateOne(
            { email: req.cmsUser.email },
            { $set: { image: url } }
        ).catch(() => {});
        res.json({ ok: true, url });
    } catch (err) {
        console.error('[cms] upload-profile-image error:', err.message);
        res.status(500).json({ error: 'Image processing failed' });
    }
});

// POST /api/cms/upload-article-image
router.post('/upload-article-image', requireAuth, uploadArticle.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ ok: true, url: `/images/articles/${req.file.filename}` });
});

// POST /api/cms/upload-article-image-pending — temp file until an edit request is approved (WebP ~70% + move on approve)
router.post('/upload-article-image-pending', requireAuth, uploadArticlePending.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ ok: true, url: `/images/articles/_pending/${req.file.filename}` });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ARTICLES
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/cms/my-articles
router.get('/my-articles', requireAuth, async (req, res) => {
    try {
        const authorName = req.cmsUser.name;
        const results    = [];

        for (const col of ARTICLE_COLLECTIONS) {
            const docs = await req.db.collection(col).find({
                $or: [
                    { 'author.name': authorName },
                    { 'languages.en.author.name': authorName },
                ],
            }, {
                projection: {
                    _id: 0, articleId: 1, id: 1,
                    'languages.en.headline': 1, 'languages.en.datePublished': 1,
                    headline: 1, datePublished: 1,
                },
            }).toArray();

            for (const doc of docs) {
                const lang = doc.languages?.en || {};
                results.push({
                    id:            doc.articleId || doc.id,
                    headline:      lang.headline || doc.headline,
                    datePublished: lang.datePublished || doc.datePublished,
                    collection:    col,
                    category:      COLLECTION_TO_CATEGORY_SLUG[col] || col,
                    status:        'published',
                });
            }
        }

        // Also return their drafts
        const drafts = await req.db.collection('cms_drafts')
            .find({ authorEmail: req.cmsUser.email })
            .sort({ submittedAt: -1 })
            .toArray();

        for (const d of drafts) {
            results.push({
                id:            d._id.toString(),
                headline:      d.headline,
                datePublished: d.submittedAt,
                collection:    d.category,
                status:        d.status,
                reviewNote:    d.reviewNote,
            });
        }

        results.sort((a, b) => new Date(b.datePublished) - new Date(a.datePublished));
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/cms/browse-articles — catalog for proposing edits (grouped by collection)
router.get('/browse-articles', requireAuth, async (req, res) => {
    try {
        const groups = [];
        for (const col of ARTICLE_COLLECTIONS) {
            const docs = await req.db.collection(col).find({}, {
                projection: {
                    _id: 0,
                    articleId: 1,
                    id: 1,
                    sortOrder: 1,
                    headline: 1,
                    'languages.en.headline': 1,
                    'languages.en.author.name': 1,
                    author: 1,
                },
            }).sort({ sortOrder: -1 }).limit(400).toArray();

            const articles = docs.map((doc) => {
                const lang = doc.languages?.en || {};
                return {
                    id:          doc.articleId || doc.id,
                    headline:    lang.headline || doc.headline || '(Untitled)',
                    authorName:  lang.author?.name || doc.author?.name || '',
                };
            }).filter((a) => a.id);

            groups.push({
                collection:   col,
                categorySlug: COLLECTION_TO_CATEGORY_SLUG[col] || col,
                label:        COLLECTION_LABEL[col] || col,
                articles,
            });
        }
        res.json({ groups });
    } catch (err) {
        console.error('[cms] browse-articles:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/cms/published-article/:collection/:articleId — EN fields + same-shape payload as public article API (read-only; Mongo unchanged)
router.get('/published-article/:collection/:articleId', requireAuth, async (req, res) => {
    try {
        const { collection: col, articleId } = req.params;
        if (!ARTICLE_COLLECTIONS.includes(col)) {
            return res.status(400).json({ error: 'Invalid collection' });
        }
        const doc = await req.db.collection(col).findOne(findArticleFilter(articleId));
        if (!doc) return res.status(404).json({ error: 'Article not found' });

        const en = doc.languages?.en || {};
        const headline = en.headline || doc.headline || '';
        const content = en.content || doc.content || [];
        const metaDescription = en.metaDescription || doc.metaDescription || '';
        const imageRaw = en.image !== undefined ? en.image : doc.image;
        const imageUrl = imageFieldToUrl(imageRaw);
        const imageCaption = imageFieldCaption(imageRaw);
        const publicView = buildPublicViewFromDoc(doc);
        const coverRelPath = imageUrl || (publicView && publicView.image && publicView.image.url) || '';
        const coverImageAbsoluteUrl = absolutePublicUrlFromReq(req, coverRelPath);
        let availableLangs = ['en'];
        if (doc.languages && typeof doc.languages === 'object') {
            availableLangs = Object.keys(doc.languages);
        }

        res.json({
            articleId: doc.articleId || doc.id,
            collection: col,
            categorySlug: COLLECTION_TO_CATEGORY_SLUG[col] || col,
            headline,
            content,
            image: imageUrl,
            coverImageAbsoluteUrl,
            imageCaption,
            metaDescription,
            authorName: getArticleAuthorName(doc),
            publicView: publicView
                ? { ...publicView, availableLangs }
                : null,
        });
    } catch (err) {
        console.error('[cms] published-article:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cms/article-edit-drafts/open
// Creates (or returns) a Mongo draft copy for this author+article.
router.post('/article-edit-drafts/open', requireAuth, async (req, res) => {
    try {
        const { collection: collectionName, articleId } = req.body || {};
        if (!collectionName || !articleId) {
            return res.status(400).json({ error: 'collection and articleId are required' });
        }
        if (!ARTICLE_COLLECTIONS.includes(collectionName)) {
            return res.status(400).json({ error: 'Invalid collection' });
        }

        const q = {
            collectionName: String(collectionName),
            articleId: String(articleId),
            authorEmail: req.cmsUser.email,
        };

        const article = await req.db.collection(collectionName).findOne(findArticleFilter(String(articleId)));
        if (!article) return res.status(404).json({ error: 'Article not found' });

        const en = article.languages?.en || {};
        const imgExisting = en.image !== undefined ? en.image : article.image;
        const now = new Date().toISOString();
        const draft = {
            collectionName: String(collectionName),
            articleId: String(articleId),
            authorEmail: req.cmsUser.email,
            authorName: req.cmsUser.name,
            targetArticleObjectId: article._id ? article._id.toString() : null,
            headline: en.headline || article.headline || '',
            content: Array.isArray(en.content || article.content) ? (en.content || article.content) : [],
            image: imageFieldToUrl(imgExisting),
            imageCaption: imageFieldCaption(imgExisting),
            metaDescription: en.metaDescription || article.metaDescription || '',
            updatedAt: now,
        };

        await req.db.collection('cms_article_edit_drafts').updateOne(
            q,
            {
                $set: draft,
                $setOnInsert: { createdAt: now },
            },
            { upsert: true }
        );

        const fresh = await req.db.collection('cms_article_edit_drafts').findOne(q);
        if (!fresh) return res.status(500).json({ error: 'Could not create draft' });
        return res.json({
            _id: fresh._id.toString(),
            collectionName: fresh.collectionName,
            articleId: fresh.articleId,
            headline: fresh.headline || '',
            content: Array.isArray(fresh.content) ? fresh.content : [],
            image: fresh.image || '',
            imageCaption: fresh.imageCaption || '',
            metaDescription: fresh.metaDescription || '',
            updatedAt: fresh.updatedAt || fresh.createdAt || null,
        });
    } catch (err) {
        console.error('[cms] article-edit-drafts/open:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cms/article-edit-drafts/save
// Updates the Mongo draft copy while user edits.
router.post('/article-edit-drafts/save', requireAuth, async (req, res) => {
    try {
        const { collection: collectionName, articleId, headline, content, image, imageCaption, metaDescription } = req.body || {};
        if (!collectionName || !articleId) {
            return res.status(400).json({ error: 'collection and articleId are required' });
        }
        const q = {
            collectionName: String(collectionName),
            articleId: String(articleId),
            authorEmail: req.cmsUser.email,
        };
        const now = new Date().toISOString();
        const $set = {
            headline: headline !== undefined ? String(headline) : '',
            content: Array.isArray(content) ? content : [],
            image: image !== undefined ? String(image) : '',
            imageCaption: imageCaption !== undefined ? String(imageCaption) : '',
            metaDescription: metaDescription !== undefined ? String(metaDescription) : '',
            updatedAt: now,
        };
        await req.db.collection('cms_article_edit_drafts').updateOne(q, { $set }, { upsert: true });
        res.json({ ok: true, updatedAt: now });
    } catch (err) {
        console.error('[cms] article-edit-drafts/save:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/cms/article-edit-drafts/:collection/:articleId
router.delete('/article-edit-drafts/:collection/:articleId', requireAuth, async (req, res) => {
    try {
        const collectionName = String(req.params.collection || '');
        const articleId = String(req.params.articleId || '');
        if (!collectionName || !articleId) {
            return res.status(400).json({ error: 'collection and articleId are required' });
        }
        const q = {
            collectionName,
            articleId,
            authorEmail: req.cmsUser.email,
        };
        const draft = await req.db.collection('cms_article_edit_drafts').findOne(q);
        if (draft && typeof draft.image === 'string' && draft.image.includes('/images/articles/_pending/')) {
            await deletePendingArticleFileIfAny(draft.image);
        }
        // If draft row is already gone (manual DB cleanup), still allow caller to provide current pending image path.
        if ((!draft || !draft.image) && typeof req.query.image === 'string') {
            await deletePendingArticleFileIfAny(String(req.query.image));
        }
        await req.db.collection('cms_article_edit_drafts').deleteOne(q);
        res.json({ ok: true });
    } catch (err) {
        console.error('[cms] article-edit-drafts/delete:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cms/article-edit-requests
router.post('/article-edit-requests', requireAuth, async (req, res) => {
    try {
        const { collection: collectionName, articleId, headline, content, image, imageCaption, metaDescription } = req.body;

        if (!collectionName || !articleId || !headline) {
            return res.status(400).json({ error: 'collection, articleId and headline are required' });
        }
        if (!ARTICLE_COLLECTIONS.includes(collectionName)) {
            return res.status(400).json({ error: 'Invalid collection' });
        }
        if (!Array.isArray(content) || content.length === 0) {
            return res.status(400).json({ error: 'content is required' });
        }
        const contentErr = validateArticleContentBlocks(content);
        if (contentErr) return res.status(400).json({ error: contentErr });

        const article = await req.db.collection(collectionName).findOne(findArticleFilter(String(articleId)));
        if (!article) return res.status(404).json({ error: 'Article not found' });

        const originalAuthorName = getArticleAuthorName(article);
        const isOwnArticle = originalAuthorName.trim().toLowerCase() === String(req.cmsUser.name || '').trim().toLowerCase();

        const dup = await req.db.collection('cms_article_edit_requests').findOne({
            collectionName,
            articleId: String(articleId),
            submittedByEmail: req.cmsUser.email,
            status: 'pending',
        });
        if (dup) {
            return res.status(400).json({ error: 'You already have a pending edit request for this article.' });
        }

        const en = article.languages?.en || {};
        const originalHeadline = en.headline || article.headline || '';

        const imgExisting = en.image !== undefined ? en.image : article.image;
        const proposedEn = {
            headline: stripAllHtml(String(headline).trim()),
            content: sanitizeProposedContentArray(content),
            image: image !== undefined && image !== null ? String(image) : imageFieldToUrl(imgExisting),
            imageCaption: imageCaption !== undefined ? String(imageCaption) : imageFieldCaption(imgExisting),
            metaDescription: stripAllHtml(
                metaDescription !== undefined ? String(metaDescription) : (en.metaDescription || article.metaDescription || '')
            ),
        };

        const row = {
            collectionName,
            articleId: String(articleId),
            targetArticleObjectId: article._id ? article._id.toString() : null,
            originalHeadline,
            originalAuthorName,
            isOwnArticle,
            proposedEn,
            submittedByEmail: req.cmsUser.email,
            submittedByName:  req.cmsUser.name,
            status:             'pending',
            submittedAt:      new Date().toISOString(),
            reviewedAt:       null,
            reviewNote:       null,
        };

        await req.db.collection('cms_article_edit_requests').insertOne(row);
        await req.db.collection('cms_article_edit_drafts').deleteOne({
            collectionName,
            articleId: String(articleId),
            authorEmail: req.cmsUser.email,
        });

        sendEmailSafe({
            from:    'CMS Notifications <contact@dollarsandlife.com>',
            to:      ADMIN_EMAIL,
            subject: `✏️ Article edit proposed: "${proposedEn.headline}"`,
            html: `
                <h2>Edit request</h2>
                <p><strong>Proposed by:</strong> ${req.cmsUser.name} (${req.cmsUser.email})</p>
                <p><strong>Collection:</strong> ${collectionName}</p>
                <p><strong>Article ID:</strong> ${articleId}</p>
                <p><strong>Original headline:</strong> ${originalHeadline}</p>
                <br>
                <a href="https://www.dollarsandlife.com/cms/admin?section=articles&queue=edits&status=pending" style="background:#700877;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                    Review in Admin →
                </a>
            `,
        });

        res.json({ ok: true });
    } catch (err) {
        console.error('[cms] article-edit-requests POST:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/cms/article-edit-requests — current user's requests
router.get('/article-edit-requests', requireAuth, async (req, res) => {
    try {
        const selfOnly = req.query.selfOnly === '1' || req.query.selfOnly === 'true';
        const q = { submittedByEmail: req.cmsUser.email };
        // selfOnly = "my submissions" (all articles). ownArticleOnly = restrict to edits on articles I authored.
        const ownArticleOnly = req.query.ownArticleOnly === '1' || req.query.ownArticleOnly === 'true';
        if (selfOnly && ownArticleOnly) q.isOwnArticle = true;

        const rows = await req.db.collection('cms_article_edit_requests')
            .find(q)
            .sort({ submittedAt: -1 })
            .limit(200)
            .toArray();

        res.json(rows.map((r) => ({
            _id: r._id.toString(),
            collectionName: r.collectionName,
            articleId: r.articleId,
            originalHeadline: r.originalHeadline,
            proposedHeadline: r.proposedEn?.headline,
            status: r.status,
            submittedAt: r.submittedAt,
            reviewedAt: r.reviewedAt,
            reviewNote: r.reviewNote,
            isOwnArticle: r.isOwnArticle,
        })));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cms/submit
router.post('/submit', requireAuth, async (req, res) => {
    try {
        const { headline, category, content, image, metaDescription } = req.body;

        if (!headline || !category || !image) {
            return res.status(400).json({ error: 'headline, category and image are required' });
        }
        if (!CATEGORY_MAP[category]) {
            return res.status(400).json({ error: 'Invalid category' });
        }
        const contentErr = validateArticleContentBlocks(content);
        if (contentErr) return res.status(400).json({ error: contentErr });

        const draft = {
            headline:       stripAllHtml(String(headline).trim()),
            category,
            content:        sanitizeProposedContentArray(content),
            image,
            metaDescription: stripAllHtml(String(metaDescription || '')),
            authorName:     req.cmsUser.name,
            authorSlug:     req.cmsUser.slug,
            authorEmail:    req.cmsUser.email,
            status:         'pending',
            submittedAt:    new Date().toISOString(),
            reviewedAt:     null,
            reviewNote:     null,
        };

        await req.db.collection('cms_drafts').insertOne(draft);

        // Notify admin
        sendEmailSafe({
            from:    'CMS Notifications <contact@dollarsandlife.com>',
            to:      ADMIN_EMAIL,
            subject: `📝 New article submitted: "${headline}"`,
            html: `
                <h2>New Article Submission</h2>
                <p><strong>Author:</strong> ${req.cmsUser.name} (${req.cmsUser.email})</p>
                <p><strong>Headline:</strong> ${headline}</p>
                <p><strong>Category:</strong> ${category}</p>
                <p><strong>Submitted:</strong> ${new Date().toLocaleString()}</p>
                <br>
                <a href="https://www.dollarsandlife.com/cms/admin" style="background:#700877;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                    Review in Admin →
                </a>
            `,
        });

        res.json({ ok: true });
    } catch (err) {
        console.error('[cms] submit error:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — DRAFTS
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/cms/drafts
router.get('/drafts', requireAdmin, async (req, res) => {
    try {
        const { status = 'pending' } = req.query;
        const drafts = await req.db.collection('cms_drafts')
            .find({ status })
            .sort({ submittedAt: -1 })
            .toArray();
        res.json(drafts);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/cms/drafts/:id
router.get('/drafts/:id', requireAdmin, async (req, res) => {
    try {
        const draft = await req.db.collection('cms_drafts').findOne({ _id: new ObjectId(req.params.id) });
        if (!draft) return res.status(404).json({ error: 'Draft not found' });
        res.json(draft);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cms/approve/:id
router.post('/approve/:id', requireAdmin, async (req, res) => {
    try {
        const { reviewNote } = req.body;
        const draft = await req.db.collection('cms_drafts').findOne({ _id: new ObjectId(req.params.id) });
        if (!draft) return res.status(404).json({ error: 'Draft not found' });

        const collectionName = CATEGORY_MAP[draft.category];
        if (!collectionName) return res.status(400).json({ error: 'Invalid category' });

        // Build slug from headline
        const slug      = draft.headline.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').slice(0, 80);
        const articleId = `${slug}-${Date.now()}`;

        const article = {
            articleId,
            sortOrder: Date.now(),
            languages: {
                en: {
                    headline:        draft.headline,
                    author:          { name: draft.authorName },
                    datePublished:   new Date().toISOString(),
                    dateModified:    new Date().toISOString(),
                    image:           draft.image,
                    content:         draft.content,
                    metaDescription: draft.metaDescription,
                },
            },
        };

        await req.db.collection(collectionName).insertOne(article);
        await req.db.collection('cms_drafts').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status: 'approved', reviewedAt: new Date().toISOString(), reviewNote: reviewNote || '' } }
        );

        // Flush cache
        const cache = require('./cache');
        cache.flush().catch(() => {});

        // Notify author
        sendEmailSafe({
            from:    'Dollars & Life <contact@dollarsandlife.com>',
            to:      draft.authorEmail,
            subject: `✅ Your article is live: "${draft.headline}"`,
            html: `
                <h2>Your article is published!</h2>
                <p>Hi ${draft.authorName},</p>
                <p>Your article <strong>"${draft.headline}"</strong> is now live on Dollars & Life.</p>
                ${reviewNote ? `<p><strong>Note from editor:</strong> ${reviewNote}</p>` : ''}
                <a href="https://www.dollarsandlife.com" style="background:#700877;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                    View on site →
                </a>
            `,
        });

        res.json({ ok: true, articleId });
    } catch (err) {
        console.error('[cms] approve error:', err.message);
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// POST /api/cms/reject/:id
router.post('/reject/:id', requireAdmin, async (req, res) => {
    try {
        const { reviewNote } = req.body;
        const draft = await req.db.collection('cms_drafts').findOne({ _id: new ObjectId(req.params.id) });
        if (!draft) return res.status(404).json({ error: 'Draft not found' });

        await req.db.collection('cms_drafts').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { status: 'rejected', reviewedAt: new Date().toISOString(), reviewNote: reviewNote || '' } }
        );

        sendEmailSafe({
            from:    'Dollars & Life <contact@dollarsandlife.com>',
            to:      draft.authorEmail,
            subject: `📋 Article needs revision: "${draft.headline}"`,
            html: `
                <h2>Your article needs revisions</h2>
                <p>Hi ${draft.authorName},</p>
                <p>Your article <strong>"${draft.headline}"</strong> needs some changes before publishing.</p>
                ${reviewNote ? `<p><strong>Editor feedback:</strong> ${reviewNote}</p>` : ''}
                <a href="https://www.dollarsandlife.com/cms/articles" style="background:#700877;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                    Go to your dashboard →
                </a>
            `,
        });

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — ARTICLE EDIT REQUESTS (existing articles)
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/cms/admin/article-edit-requests
router.get('/admin/article-edit-requests', requireAdmin, async (req, res) => {
    try {
        const status = req.query.status === 'approved' || req.query.status === 'rejected' ? req.query.status : 'pending';
        const rows = await req.db.collection('cms_article_edit_requests')
            .find({ status })
            .sort({ submittedAt: -1 })
            .limit(300)
            .toArray();
        res.json(rows.map((r) => ({
            _id: r._id.toString(),
            collectionName: r.collectionName,
            articleId: r.articleId,
            originalHeadline: r.originalHeadline,
            proposedHeadline: r.proposedEn?.headline,
            submittedByName: r.submittedByName,
            submittedByEmail: r.submittedByEmail,
            isOwnArticle: r.isOwnArticle,
            status: r.status,
            submittedAt: r.submittedAt,
            reviewedAt: r.reviewedAt,
            reviewNote: r.reviewNote,
        })));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/cms/admin/article-edit-requests/:id
router.get('/admin/article-edit-requests/:id', requireAdmin, async (req, res) => {
    try {
        const row = await req.db.collection('cms_article_edit_requests').findOne({
            _id: new ObjectId(req.params.id),
        });
        if (!row) return res.status(404).json({ error: 'Request not found' });
        res.json({
            ...row,
            _id: row._id.toString(),
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cms/admin/article-edit-requests/:id/approve
router.post('/admin/article-edit-requests/:id/approve', requireAdmin, async (req, res) => {
    try {
        const { reviewNote } = req.body;
        const request = await req.db.collection('cms_article_edit_requests').findOne({
            _id: new ObjectId(req.params.id),
        });
        if (!request) return res.status(404).json({ error: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ error: 'Request is not pending' });

        const col = request.collectionName;
        if (!ARTICLE_COLLECTIONS.includes(col)) return res.status(400).json({ error: 'Invalid collection' });

        let targetFilter = findArticleFilter(request.articleId);
        if (request.targetArticleObjectId && ObjectId.isValid(request.targetArticleObjectId)) {
            targetFilter = { _id: new ObjectId(request.targetArticleObjectId) };
        }

        const article = await req.db.collection(col).findOne(targetFilter);
        if (!article) return res.status(404).json({ error: 'Article not found' });

        const now = new Date().toISOString();
        const p = request.proposedEn;
        const lastEditedBy = {
            name: request.submittedByName,
            email: request.submittedByEmail,
        };

        let imageUrlMerged = p.image;
        const existingImageForName = (article.languages?.en && article.languages.en.image !== undefined)
            ? article.languages.en.image
            : article.image;
        const preferredLiveImagePath = imageFieldToUrl(existingImageForName);
        if (typeof imageUrlMerged === 'string' && imageUrlMerged.includes('/images/articles/_pending/')) {
            try {
                imageUrlMerged = await finalizePendingArticleImage(imageUrlMerged, preferredLiveImagePath);
            } catch (e) {
                console.error('[cms] finalize pending cover:', e.message);
                return res.status(400).json({ error: 'Could not process cover image' });
            }
        }

        if (article.languages && article.languages.en && typeof article.languages.en === 'object') {
            const existingEn = article.languages.en;
            const mergedEn = {
                ...existingEn,
                headline: p.headline,
                content: p.content,
                dateModified: now,
                lastEditedBy,
            };
            const existingImg = existingEn.image !== undefined ? existingEn.image : article.image;
            mergedEn.image = mergeArticleImageForApprove(imageUrlMerged, p.imageCaption, existingImg);
            if (p.metaDescription !== undefined) mergedEn.metaDescription = p.metaDescription;

            await req.db.collection(col).updateOne(
                targetFilter,
                { $set: { 'languages.en': mergedEn } }
            );
        } else {
            const $set = {
                headline: p.headline,
                content: p.content,
                dateModified: now,
                lastEditedBy,
            };
            $set.image = mergeArticleImageForApprove(imageUrlMerged, p.imageCaption, article.image);
            if (p.metaDescription !== undefined) $set.metaDescription = p.metaDescription;
            await req.db.collection(col).updateOne(targetFilter, { $set });
        }

        await req.db.collection('cms_article_edit_requests').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: {
                status: 'approved',
                reviewedAt: now,
                reviewNote: reviewNote || '',
            } },
        );

        const cache = require('./cache');
        cache.flush().catch(() => {});

        sendEmailSafe({
            from:    'Dollars & Life <contact@dollarsandlife.com>',
            to:      request.submittedByEmail,
            subject: `✅ Edit approved: "${p.headline}"`,
            html: `
                <h2>Your article edit was approved</h2>
                <p>Hi ${request.submittedByName},</p>
                <p>Your proposed changes to <strong>"${request.originalHeadline}"</strong> are now live.</p>
                ${reviewNote ? `<p><strong>Note from editor:</strong> ${reviewNote}</p>` : ''}
                <a href="https://www.dollarsandlife.com/cms/articles" style="background:#700877;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                    My Articles →
                </a>
            `,
        });

        res.json({ ok: true });
    } catch (err) {
        console.error('[cms] approve article-edit-request:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cms/admin/article-edit-requests/:id/reject
router.post('/admin/article-edit-requests/:id/reject', requireAdmin, async (req, res) => {
    try {
        const { reviewNote } = req.body;
        if (!reviewNote || !String(reviewNote).trim()) {
            return res.status(400).json({ error: 'reviewNote is required' });
        }
        const request = await req.db.collection('cms_article_edit_requests').findOne({
            _id: new ObjectId(req.params.id),
        });
        if (!request) return res.status(404).json({ error: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ error: 'Request is not pending' });

        await deletePendingArticleFileIfAny(
            typeof request.proposedEn?.image === 'string' ? request.proposedEn.image : ''
        );

        const now = new Date().toISOString();
        await req.db.collection('cms_article_edit_requests').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: {
                status: 'rejected',
                reviewedAt: now,
                reviewNote: String(reviewNote).trim(),
            } },
        );

        sendEmailSafe({
            from:    'Dollars & Life <contact@dollarsandlife.com>',
            to:      request.submittedByEmail,
            subject: `📋 Edit not approved: "${request.proposedEn?.headline || request.originalHeadline}"`,
            html: `
                <h2>Your article edit was not approved</h2>
                <p>Hi ${request.submittedByName},</p>
                <p>Your proposed changes to <strong>"${request.originalHeadline}"</strong> were not merged.</p>
                <p><strong>Feedback:</strong> ${String(reviewNote).trim()}</p>
                <a href="https://www.dollarsandlife.com/cms/articles" style="background:#700877;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                    My Articles →
                </a>
            `,
        });

        res.json({ ok: true });
    } catch (err) {
        console.error('[cms] reject article-edit-request:', err.message);
        res.status(500).json({ error: 'Server error' });
    }
});

// ═══════════════════════════════════════════════════════════════════════════════
// ADMIN — AUTHORS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════════

// GET /api/cms/authors-list (admin only)
router.get('/authors-list', requireAdmin, async (req, res) => {
    try {
        const authors = await req.db.collection('authors')
            .find({}, { projection: { passwordHash: 0 } })
            .sort({ joinedDate: 1, name: 1 })
            .toArray();
        res.json(authors);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/cms/authors-public-list (admin only)
router.get('/authors-public-list', requireAdmin, async (req, res) => {
    try {
        const authors = await req.db.collection('authors')
            .find({}, {
                projection: {
                    passwordHash: 0,
                },
            })
            .sort({ joinedDate: 1, name: 1 })
            .toArray();
        res.json(authors);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/cms/authors-public/:id (admin only)
router.get('/authors-public/:id', requireAdmin, async (req, res) => {
    try {
        const author = await req.db.collection('authors').findOne(
            { _id: new ObjectId(req.params.id) },
            { projection: { passwordHash: 0 } }
        );
        if (!author) return res.status(404).json({ error: 'Author not found' });
        res.json(author);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/cms/authors-public/:id (admin only)
router.put('/authors-public/:id', requireAdmin, async (req, res) => {
    try {
        const { name, title, bio, achievements, expertise, linkedin, joinedDate, editedCount, active } = req.body;
        const author = await req.db.collection('authors').findOne({ _id: new ObjectId(req.params.id) });
        if (!author) return res.status(404).json({ error: 'Author not found' });

        const update = {};
        if (name !== undefined) update.name = String(name).trim();
        if (title !== undefined) update.title = String(title);
        if (bio !== undefined) update.bio = String(bio);
        if (achievements !== undefined) update.achievements = String(achievements);
        if (expertise !== undefined) update.expertise = Array.isArray(expertise) ? expertise : [];
        if (linkedin !== undefined) update['social.linkedin'] = String(linkedin || '');
        if (joinedDate !== undefined) update.joinedDate = String(joinedDate || '');
        if (editedCount !== undefined) update.editedCount = Number.isFinite(Number(editedCount)) ? Number(editedCount) : 0;
        if (active !== undefined) update.active = Boolean(active);

        if (name !== undefined) {
            update.slug = String(name)
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
        }

        await req.db.collection('authors').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: update }
        );
        const cache = require('./cache');
        await cache.flush().catch(() => {});

        res.json({ ok: true });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: 'Slug already exists' });
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/cms/authors-public/:id (admin only)
router.delete('/authors-public/:id', requireAdmin, async (req, res) => {
    try {
        const author = await req.db.collection('authors').findOne({ _id: new ObjectId(req.params.id) });
        if (!author) return res.status(404).json({ error: 'Author not found' });
        if (author.role === 'admin') return res.status(400).json({ error: 'Admin accounts cannot be deleted from Authors tab' });

        // Authors tab "Delete Author" now permanently deletes from DB.
        await req.db.collection('authors').deleteOne({ _id: new ObjectId(req.params.id) });
        const cache = require('./cache');
        await cache.flush().catch(() => {});
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cms/add-author (admin only)
router.post('/add-author', requireAdmin, async (req, res) => {
    try {
        const { name, email, tempPassword } = req.body;
        const normalizedName = String(name || '').trim();
        const normalizedEmail = String(email || '').toLowerCase().trim();
        const normalizedTempPassword = String(tempPassword || '').trim();
        if (!normalizedName || !normalizedEmail || !normalizedTempPassword) {
            return res.status(400).json({ error: 'name, email and tempPassword required' });
        }
        if (normalizedTempPassword.length < 8) {
            return res.status(400).json({ error: 'tempPassword must be at least 8 characters' });
        }

        const slug = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const passwordHash = await bcrypt.hash(normalizedTempPassword, 12);

        await req.db.collection('authors').insertOne({
            slug,
            name: normalizedName,
            email: normalizedEmail,
            passwordHash,
            title: 'Contributor',
            bio: '',
            image: '',
            expertise: [],
            social: { linkedin: '' },
            achievements: '',
            active: true,
            joinedDate: new Date().toISOString().slice(0, 10),
            role: 'contributor',
            mustChangePassword: true,
            profileComplete: false,
            editedCount: 0,
            disabled: false,
        });

        // Send welcome email to new author
        sendEmailSafe({
            from:    'Dollars & Life <contact@dollarsandlife.com>',
            to:      normalizedEmail,
            subject: 'Welcome to Dollars & Life — Your contributor account is ready',
            html: `
                <h2>Welcome to Dollars & Life, ${normalizedName}!</h2>
                <p>Your contributor account has been created. Here are your login details:</p>
                <p><strong>Email:</strong> ${normalizedEmail}</p>
                <p><strong>Temporary password:</strong> ${normalizedTempPassword}</p>
                <p>You will be asked to change your password on first login.</p>
                <br>
                <a href="https://www.dollarsandlife.com/cms/login" style="background:#700877;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                    Log in now →
                </a>
            `,
        });

        res.json({ ok: true, slug });
    } catch (err) {
        if (err.code === 11000) return res.status(409).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Server error', details: err.message });
    }
});

// POST /api/cms/authors/:id/disable (admin only)
router.post('/authors/:id/disable', requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const author = await req.db.collection('authors').findOne({ _id: new ObjectId(id) });
        if (!author) return res.status(404).json({ error: 'Author not found' });
        if (author.email === req.cmsUser.email) return res.status(400).json({ error: 'You cannot disable your own account' });

        await req.db.collection('authors').updateOne(
            { _id: new ObjectId(id) },
            { $set: { disabled: true } }
        );

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cms/authors/:id/enable (admin only)
router.post('/authors/:id/enable', requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const author = await req.db.collection('authors').findOne({ _id: new ObjectId(id) });
        if (!author) return res.status(404).json({ error: 'Author not found' });

        await req.db.collection('authors').updateOne(
            { _id: new ObjectId(id) },
            { $set: { disabled: false } }
        );

        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/cms/authors/:id (admin only)
router.delete('/authors/:id', requireAdmin, async (req, res) => {
    try {
        const id = req.params.id;
        const author = await req.db.collection('authors').findOne({ _id: new ObjectId(id) });
        if (!author) return res.status(404).json({ error: 'Author not found' });
        if (author.email === req.cmsUser.email) return res.status(400).json({ error: 'You cannot delete your own account' });
        if (author.role === 'admin') return res.status(400).json({ error: 'Admin accounts cannot be revoked' });

        // Contributors tab "delete" should revoke CMS access, not erase author data.
        await req.db.collection('authors').updateOne(
            { _id: new ObjectId(id) },
            { $set: { disabled: true } }
        );
        res.json({ ok: true, revoked: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
