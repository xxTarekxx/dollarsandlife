'use strict';

const express  = require('express');
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const multer   = require('multer');
const path     = require('path');
const fs       = require('fs');
const { Resend } = require('resend');
const { ObjectId } = require('mongodb');

const router      = express.Router();
const resend      = new Resend(process.env.RESEND_API_KEY);
const JWT_SECRET  = process.env.JWT_SECRET;
const ADMIN_EMAIL = process.env.CMS_ADMIN_EMAIL;
const UPLOAD_DIR  = process.env.CMS_UPLOAD_DIR || path.join(__dirname, '../frontend/public/images');

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

const uploadAuthor  = multer({ storage: authorStorage,  limits: { fileSize: 5 * 1024 * 1024 } });
const uploadArticle = multer({ storage: articleStorage, limits: { fileSize: 8 * 1024 * 1024 } });

const CATEGORY_MAP = {
    'breaking-news':     'breaking_news',
    'budget':            'budget_data',
    'freelance-jobs':    'freelance_jobs',
    'money-making-apps': 'money_making_apps',
    'remote-online-jobs':'remote_jobs',
    'start-a-blog':      'start_a_blog',
};

const ARTICLE_COLLECTIONS = Object.values(CATEGORY_MAP);

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════════════════════════════════════════

// POST /api/cms/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

        const author = await req.db.collection('authors').findOne({ email: email.toLowerCase().trim() });
        if (!author) return res.status(401).json({ error: 'Invalid credentials' });
        if (author.disabled) return res.status(403).json({ error: 'Account disabled' });

        const valid = await bcrypt.compare(password, author.passwordHash || '');
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
        const { bio, title, expertise, linkedin, achievements } = req.body;
        const update = { profileComplete: true };
        if (bio          !== undefined) update.bio               = bio;
        if (title        !== undefined) update.title             = title;
        if (expertise    !== undefined) update.expertise         = Array.isArray(expertise) ? expertise : [expertise];
        if (linkedin     !== undefined) update['social.linkedin']= linkedin;
        if (achievements !== undefined) update.achievements      = achievements;

        await req.db.collection('authors').updateOne({ email: req.cmsUser.email }, { $set: update });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/cms/upload-profile-image
router.post('/upload-profile-image', requireAuth, uploadAuthor.single('image'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const url = `/images/authors/${req.file.filename}`;
    await req.db.collection('authors').updateOne(
        { email: req.cmsUser.email },
        { $set: { image: url } }
    ).catch(() => {});
    res.json({ ok: true, url });
});

// POST /api/cms/upload-article-image
router.post('/upload-article-image', requireAuth, uploadArticle.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({ ok: true, url: `/images/articles/${req.file.filename}` });
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
        if (!Array.isArray(content) || content.length === 0) {
            return res.status(400).json({ error: 'At least one content section is required' });
        }
        // Validate each section has at least text
        for (const section of content) {
            if (!section.text || section.text.trim().length < 50) {
                return res.status(400).json({ error: 'Each section must have at least 50 characters of text' });
            }
        }

        const draft = {
            headline:       headline.trim(),
            category,
            content,
            image,
            metaDescription: metaDescription || '',
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
        resend.emails.send({
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
        }).catch(e => console.warn('[cms] email failed:', e.message));

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
        resend.emails.send({
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
        }).catch(e => console.warn('[cms] email failed:', e.message));

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

        resend.emails.send({
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
        }).catch(e => console.warn('[cms] email failed:', e.message));

        res.json({ ok: true });
    } catch (err) {
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

// POST /api/cms/add-author (admin only)
router.post('/add-author', requireAdmin, async (req, res) => {
    try {
        const { name, email, tempPassword } = req.body;
        if (!name || !email || !tempPassword) return res.status(400).json({ error: 'name, email and tempPassword required' });

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const passwordHash = await bcrypt.hash(tempPassword, 12);

        await req.db.collection('authors').insertOne({
            slug,
            name,
            email: email.toLowerCase().trim(),
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
        resend.emails.send({
            from:    'Dollars & Life <contact@dollarsandlife.com>',
            to:      email,
            subject: 'Welcome to Dollars & Life — Your contributor account is ready',
            html: `
                <h2>Welcome to Dollars & Life, ${name}!</h2>
                <p>Your contributor account has been created. Here are your login details:</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Temporary password:</strong> ${tempPassword}</p>
                <p>You will be asked to change your password on first login.</p>
                <br>
                <a href="https://www.dollarsandlife.com/cms/login" style="background:#700877;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">
                    Log in now →
                </a>
            `,
        }).catch(e => console.warn('[cms] welcome email failed:', e.message));

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

        await req.db.collection('authors').deleteOne({ _id: new ObjectId(id) });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
