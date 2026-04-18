import { defaultLanguage, supportedLanguages } from "./languages";
import { LEGAL_LANGS } from "./legal-page-content";
import { GENERATED_CONTENT_ROUTE_LANGUAGES } from "./generated-content-language-manifest";

/** All language codes as a plain array — used to populate PATH_LANGUAGES below. */
const ALL_LANGS = [...supportedLanguages];
const LEGAL_PAGE_LANGS = [...LEGAL_LANGS];

// ─────────────────────────────────────────────────────────────────────────────
// PATH NORMALIZATION
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Normalize a raw path for consistent lookup:
 *   - Strip query parameters  (/about-us?ref=footer → /about-us)
 *   - Remove trailing slash   (/about-us/         → /about-us)
 *   - Preserve root           (/                  → /)
 */
export function normalizePath(path: string): string {
	return path.split("?")[0].replace(/\/$/, "") || "/";
}

/**
 * Small LRU-like cache so repeated requests do not recompute normalization.
 * Keys  : raw paths (may contain query strings or trailing slashes).
 * Values: normalized path string.
 */
const normalizedCache = new Map<string, string>();

/**
 * Return (and cache) the normalized form of a raw path.
 * Use this everywhere instead of calling normalizePath() directly
 * to avoid repeated string operations on every request.
 */
export function getNormalizedPath(path: string): string {
	if (normalizedCache.has(path)) return normalizedCache.get(path)!;
	const normalized = normalizePath(path);
	normalizedCache.set(path, normalized);
	return normalized;
}

// ─────────────────────────────────────────────────────────────────────────────
// PATH_LANGUAGES CONFIG
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Declares which languages have content for each path (or wildcard).
 *
 * Rules:
 *   - Exact paths  : "/about-us"          → specific page only
 *   - Wildcard (/*): "/breaking-news/*"   → matches /breaking-news AND /breaking-news/<any-slug>
 *     Safe match: path === prefix OR path.startsWith(prefix + "/")
 *     This prevents "/breaking-newsletters" from matching "/breaking-news/*".
 *
 * Route availability here must reflect real content availability.
 * Do not advertise a locale for a page/article unless the page copy or backing
 * content actually exists in that language.
 *
 * IMMUTABLE: Object.freeze() prevents accidental runtime mutation.
 */
export const PATH_LANGUAGES: Readonly<Record<string, readonly string[]>> = Object.freeze({
	// ── Static pages ─────────────────────────────────────────────────────────
	"/": ALL_LANGS,
	"/about-us": ALL_LANGS,
	"/contact-us": ALL_LANGS,
	"/privacy-policy": LEGAL_PAGE_LANGS,
	"/return-policy": ALL_LANGS,
	"/terms-of-service": LEGAL_PAGE_LANGS,
	"/financial-calculators": ALL_LANGS,
	"/shopping-deals": ALL_LANGS,
	"/start-a-blog": GENERATED_CONTENT_ROUTE_LANGUAGES["/start-a-blog"] ?? [defaultLanguage],
	"/extra-income":
		GENERATED_CONTENT_ROUTE_LANGUAGES["/extra-income"] ?? ALL_LANGS,
	"/extra-income/budget":
		GENERATED_CONTENT_ROUTE_LANGUAGES["/extra-income/budget"] ?? [defaultLanguage],
	"/extra-income/freelance-jobs":
		GENERATED_CONTENT_ROUTE_LANGUAGES["/extra-income/freelance-jobs"] ?? [defaultLanguage],
	"/extra-income/remote-online-jobs":
		GENERATED_CONTENT_ROUTE_LANGUAGES["/extra-income/remote-online-jobs"] ?? [defaultLanguage],
	"/extra-income/money-making-apps":
		GENERATED_CONTENT_ROUTE_LANGUAGES["/extra-income/money-making-apps"] ?? [defaultLanguage],
	"/breaking-news":
		GENERATED_CONTENT_ROUTE_LANGUAGES["/breaking-news"] ?? [defaultLanguage],
	"/forum": [defaultLanguage],

	// ── Wildcard routes (article / product / post detail pages) ───────────────
	// Each wildcard covers slugs under that prefix.
	// Example: "/breaking-news/*" matches /breaking-news/article-slug
	"/breaking-news/*":
		GENERATED_CONTENT_ROUTE_LANGUAGES["/breaking-news/*"] ?? [defaultLanguage],
	"/extra-income/budget/*":
		GENERATED_CONTENT_ROUTE_LANGUAGES["/extra-income/budget/*"] ?? [defaultLanguage],
	"/extra-income/freelance-jobs/*":
		GENERATED_CONTENT_ROUTE_LANGUAGES["/extra-income/freelance-jobs/*"] ?? [defaultLanguage],
	"/extra-income/remote-online-jobs/*":
		GENERATED_CONTENT_ROUTE_LANGUAGES["/extra-income/remote-online-jobs/*"] ?? [defaultLanguage],
	"/extra-income/money-making-apps/*":
		GENERATED_CONTENT_ROUTE_LANGUAGES["/extra-income/money-making-apps/*"] ?? [defaultLanguage],
	"/shopping-deals/products/*": ALL_LANGS,
	"/start-a-blog/*":
		GENERATED_CONTENT_ROUTE_LANGUAGES["/start-a-blog/*"] ?? [defaultLanguage],
	"/forum/post/*": [defaultLanguage],
});

// ─────────────────────────────────────────────────────────────────────────────
// WILDCARD RULES (PRECOMPUTED)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Precomputed wildcard rules extracted from PATH_LANGUAGES.
 * Sorted longest-first so more-specific rules win over shorter ones.
 * Built ONCE at module initialization — no string operations during request handling.
 *
 * Structure: [{ rule: "/breaking-news/*", prefix: "/breaking-news" }, ...]
 *
 * IMMUTABLE: Object.freeze() applied to the array and each entry.
 */
const WILDCARD_RULES: ReadonlyArray<Readonly<{ rule: string; prefix: string }>> = Object.freeze(
	Object.keys(PATH_LANGUAGES)
		.filter((p) => p.endsWith("/*"))
		.sort((a, b) => b.length - a.length)
		.map((rule) => Object.freeze({ rule, prefix: rule.slice(0, -2) })),
);

// ─────────────────────────────────────────────────────────────────────────────
// LANGUAGE LOOKUP
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Return the languages that have content for a given path.
 *
 * Lookup priority:
 *   1. Exact normalized path  (fastest, O(1) map lookup)
 *   2. First wildcard match   (longest prefix wins, precomputed, no re-sort)
 *   3. [defaultLanguage]      (fallback: English)
 *
 * Uses getNormalizedPath() so callers can pass raw paths with query strings
 * or trailing slashes and still get a consistent result.
 */
export function getLanguagesForPath(path: string): readonly string[] {
	const normalized = getNormalizedPath(path);

	// 1. Exact match
	const exact = PATH_LANGUAGES[normalized];
	if (exact) return exact;

	// 2. Wildcard match — safe boundary check prevents false positives
	//    e.g. /breaking-newsletters must NOT match /breaking-news/*
	for (const { rule, prefix } of WILDCARD_RULES) {
		if (normalized === prefix || normalized.startsWith(prefix + "/")) {
			return PATH_LANGUAGES[rule] ?? [defaultLanguage];
		}
	}

	// 3. Fallback
	return [defaultLanguage];
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Set of paths that have at least one non-English translation.
 * Derived from PATH_LANGUAGES at module load time.
 * Use isTranslated() for per-path, per-language checks.
 */
export const TRANSLATED_PATHS: ReadonlySet<string> = new Set(
	Object.keys(PATH_LANGUAGES).filter(
		(path) => (PATH_LANGUAGES[path] ?? []).some((l) => l !== defaultLanguage),
	),
);

/**
 * Whether a specific language has translated content for the given path.
 * Uses getNormalizedPath() internally.
 *
 * Use for: translation badge, analytics, language-switcher active states.
 */
export function isTranslated(path: string, lang: string): boolean {
	if (lang === defaultLanguage) return false; // English is always the default, not a "translation"
	const normalized = getNormalizedPath(path);
	return getLanguagesForPath(normalized).includes(lang);
}

export function isLanguageAllowedForPath(path: string, lang: string): boolean {
	const normalized = getNormalizedPath(path);
	return getLanguagesForPath(normalized).includes(lang);
}
