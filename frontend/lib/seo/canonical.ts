const BASE_URL = "https://www.dollarsandlife.com";

/**
 * Strip a trailing slash so paths match `trailingSlash: false` and sitemap / page Head.
 * Root `/` stays `/`.
 */
export function normalizeTrailingSlashPath(pathname: string): string {
	const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
	if (path.length > 1 && path.endsWith("/")) {
		return path.slice(0, -1);
	}
	return path;
}

/**
 * Build the canonical URL for the current language and path.
 *
 * @param pathname  Full path including language prefix, e.g. /en/about-us or /es/contact-us
 * @returns         Absolute canonical URL, e.g. https://www.dollarsandlife.com/es/about-us
 *
 * The canonical URL matches the language version of the page so that
 * /es/about-us canonicalises to https://…/es/about-us (not the English version).
 * This is intentional: each language URL is its own canonical.
 * The relationship between them is expressed via hreflang, not canonical.
 *
 * Trailing slashes are stripped (matches Next `trailingSlash: false` and page-level
 * `<link rel="canonical">` tags). Otherwise a crawl of `/extra-income/` would emit
 * a different canonical than `/extra-income` in the same HTML.
 */
export function buildCanonicalUrl(pathname: string): string {
	let path = normalizeTrailingSlashPath(pathname);
	// Guard: if somehow passed an absolute URL, return as-is
	if (path.startsWith("http")) return path;
	if (path === "/" || path === "") {
		return BASE_URL;
	}
	return `${BASE_URL}${path}`;
}

export { BASE_URL as SITE_BASE_URL };
