export const supportedLanguages = [
	"en",  // English
	"es",  // Spanish
	"de",  // German
	"ja",  // Japanese
	"fr",  // French
	"pt",  // Portuguese
	"ru",  // Russian
	"it",  // Italian
	"nl",  // Dutch
	"pl",  // Polish
	"tr",  // Turkish
	"fa",  // Persian (RTL)
	"zh",  // Chinese
	"vi",  // Vietnamese
	"id",  // Indonesian
	"cs",  // Czech
	"ko",  // Korean
	"uk",  // Ukrainian
	"hu",  // Hungarian
	"ar",  // Arabic (RTL)
] as const;

export type SupportedLang = (typeof supportedLanguages)[number];

export const defaultLanguage = "en" as const;

export const rtlLanguages = ["ar", "fa"] as const;

export function isRtl(lang: string): boolean {
	return rtlLanguages.includes(lang as (typeof rtlLanguages)[number]);
}
