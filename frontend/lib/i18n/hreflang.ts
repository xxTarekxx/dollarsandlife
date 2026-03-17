import { defaultLanguage } from "./languages";
import { pathWithoutLang } from "./prefixLang";
import { getLanguagesForPath } from "./translationStatus";

const BASE_URL = "https://www.dollarsandlife.com";

export type HreflangLink = { hreflang: string; href: string };

/**
 * Build the absolute URL for a given lang + path combination.
 *
 * English (defaultLanguage) has NO prefix:
 *   en + /about-us  →  https://www.dollarsandlife.com/about-us
 *   en + /          →  https://www.dollarsandlife.com
 *
 * Other languages have a /{lang}/ prefix:
 *   ar + /about-us  →  https://www.dollarsandlife.com/ar/about-us
 *   ar + /          →  https://www.dollarsandlife.com/ar
 */
function langUrl(lang: string, path: string): string {
	if (lang === defaultLanguage) {
		return path === "/" ? BASE_URL : `${BASE_URL}${path}`;
	}
	return path === "/" ? `${BASE_URL}/${lang}` : `${BASE_URL}/${lang}${path}`;
}

/**
 * Generate hreflang alternate links for a given pathname.
 *
 * @param pathname  Full URL path, with or without language prefix.
 *                  e.g.  /ar/about-us  or  /about-us  (English)
 *
 * Behaviour:
 *   - Strips any lang prefix to get the canonical content path (/about-us)
 *   - Calls getLanguagesForPath() so only languages with actual content are emitted
 *   - English href uses NO prefix:  https://www.dollarsandlife.com/about-us
 *   - Other langs use /{lang}/ prefix: https://www.dollarsandlife.com/ar/about-us
 *   - x-default always points at the English (no-prefix) URL
 *
 * Reciprocity guarantee: every language variant of a path produces the same
 * link set because getLanguagesForPath() is path-based, not lang-based.
 * Google requires all alternate pages to cross-reference each other — met here.
 *
 * Example output for /ar/about-us:
 *   { hreflang:"en",        href:"https://…/about-us"    }
 *   { hreflang:"ar",        href:"https://…/ar/about-us" }
 *   { hreflang:"x-default", href:"https://…/about-us"    }
 */
export function generateHreflangLinks(pathname: string): HreflangLink[] {
	// Strip any lang prefix → /about-us, /breaking-news/slug, /  etc.
	const path = pathWithoutLang(pathname);
	// Only emit languages that have actual content for this path
	const langs = getLanguagesForPath(path);
	const links: HreflangLink[] = [];

	for (const lang of langs) {
		links.push({ hreflang: lang, href: langUrl(lang, path) });
	}

	// x-default: points at the English (no-prefix) URL
	links.push({ hreflang: "x-default", href: langUrl(defaultLanguage, path) });

	return links;
}
