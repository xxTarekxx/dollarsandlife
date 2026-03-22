export const supportedLanguages = [
	"en",  // English      — #1 online
	"zh",  // Chinese      — #2 online
	"es",  // Spanish      — #3 online
	"ar",  // Arabic       — #4 online (RTL)
	"pt",  // Portuguese   — #5 online
	"id",  // Indonesian   — #6 online
	"fr",  // French       — #7 online
	"ja",  // Japanese     — #8 online
	"ru",  // Russian      — #9 online
	"de",  // German       — #10 online
	"ko",  // Korean       — #11 online
	"vi",  // Vietnamese   — #12 online
	"it",  // Italian      — #13 online
	"tr",  // Turkish      — #14 online
	"fa",  // Persian      — #15 online (RTL)
	"nl",  // Dutch        — #16 online
	"pl",  // Polish       — #17 online
	"uk",  // Ukrainian    — #18 online
	"cs",  // Czech        — #19 online
	"hu",  // Hungarian    — #20 online
] as const;

export type SupportedLang = (typeof supportedLanguages)[number];

export const defaultLanguage = "en" as const;

export const rtlLanguages = ["ar", "fa"] as const;

export function isRtl(lang: string): boolean {
	return rtlLanguages.includes(lang as (typeof rtlLanguages)[number]);
}
