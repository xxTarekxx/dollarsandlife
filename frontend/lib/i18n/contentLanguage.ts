import { defaultLanguage } from "./languages";
import { pathWithoutLang } from "./prefixLang";
import { getLanguagesForPath } from "./translationStatus";

/**
 * Language to use when rendering content for this URL.
 * Fallback: if translation is missing, serve English but keep URL language.
 *
 * @param urlLang - language from the URL (e.g. "es" for /es/about-us)
 * @param pathname - full pathname including lang (e.g. /es/about-us)
 * @returns language code to use when loading/displaying content
 */
export function getContentLanguage(urlLang: string, pathname: string): string {
	const path = pathWithoutLang(pathname);
	const available = getLanguagesForPath(path);
	if (urlLang !== defaultLanguage && !available.includes(urlLang)) {
		return defaultLanguage;
	}
	return urlLang;
}

/**
 * Whether the current page has translated content for the given lang.
 * Use to avoid showing "translated" labels when we're actually serving English.
 */
export function hasTranslation(pathname: string, lang: string): boolean {
	if (lang === defaultLanguage) return true;
	const path = pathWithoutLang(pathname);
	return getLanguagesForPath(path).includes(lang);
}
