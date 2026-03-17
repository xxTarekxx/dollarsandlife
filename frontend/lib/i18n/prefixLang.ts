import { defaultLanguage, supportedLanguages } from "./languages";

/**
 * Prefix a path with the given language code.
 *
 * English (defaultLanguage) uses NO prefix — canonical English URLs are:
 *   /breaking-news/slug   (not /en/breaking-news/slug)
 *
 * All other languages use a /{lang}/ prefix:
 *   /ar/breaking-news/slug
 *
 * Idempotent for non-English: if the path already starts with /{lang}/,
 * the path is returned unchanged to prevent double-prefixing.
 *
 * Used by NavBar, Footer, BreadcrumbWrapper, and LanguageSwitcher to ensure
 * all internal links always carry the correct (or absent) language prefix.
 *
 * @example
 *   prefixLang("/about-us", "en") → "/about-us"          (no prefix for English)
 *   prefixLang("/about-us", "es") → "/es/about-us"
 *   prefixLang("/ar/about-us", "ar") → "/ar/about-us"    (idempotent)
 *   prefixLang("/", "ar")         → "/ar"
 *   prefixLang("/about-us")       → "/about-us"           (no lang, passthrough)
 */
export function prefixLang(path: string, lang?: string): string {
	if (!lang) return path;
	// English: no prefix — return the path as-is
	if (lang === defaultLanguage) return path;
	// Already has this lang prefix — avoid /ar/ar/about-us
	if (path === `/${lang}` || path.startsWith(`/${lang}/`)) return path;
	const clean = path === "/" ? "" : path.replace(/^\//, "");
	return clean ? `/${lang}/${clean}` : `/${lang}`;
}

/**
 * Strip the language prefix from a pathname to get the language-agnostic path.
 * Used when building hreflang alternates and canonical URLs.
 *
 * @example
 *   pathWithoutLang("/en/about-us")     → "/about-us"
 *   pathWithoutLang("/es")              → "/"
 *   pathWithoutLang("/contact-us")      → "/contact-us"  (no lang prefix, unchanged)
 */
export function pathWithoutLang(pathname: string): string {
	const segments = pathname.split("/").filter(Boolean);
	if (segments[0] && supportedLanguages.includes(segments[0] as never)) {
		const rest = segments.slice(1);
		return rest.length ? `/${rest.join("/")}` : "/";
	}
	return pathname || "/";
}
