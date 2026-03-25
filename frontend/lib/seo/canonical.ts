const BASE_URL = "https://dollarsandlife.com";

/**
 * Build the canonical URL for the current language and path.
 *
 * @param pathname  Full path including language prefix, e.g. /en/about-us or /es/contact-us
 * @returns         Absolute canonical URL, e.g. https://dollarsandlife.com//es/about-us
 *
 * The canonical URL matches the language version of the page so that
 * /es/about-us canonicalises to https://…/es/about-us (not the English version).
 * This is intentional: each language URL is its own canonical.
 * The relationship between them is expressed via hreflang, not canonical.
 */
export function buildCanonicalUrl(pathname: string): string {
	const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
	// Guard: if somehow passed an absolute URL, return as-is
	if (path.startsWith("http")) return path;
	return `${BASE_URL}${path}`;
}

export { BASE_URL as SITE_BASE_URL };
