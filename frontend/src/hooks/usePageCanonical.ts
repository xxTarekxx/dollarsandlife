import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { defaultLanguage, supportedLanguages } from "@/lib/i18n/languages";
import { buildCanonicalUrl } from "@/lib/seo/canonical";

/**
 * Canonical URL for the current route (matches app/[lang]/layout generateMetadata).
 * Use instead of hardcoded https://www.../english-path in <Head> when the page is
 * embedded under /{lang}/... so GSC does not see "user canonical" vs Google canonical.
 */
export function usePageCanonical(): string {
	const pathname = usePathname();
	return useMemo(() => buildCanonicalUrl(pathname ?? "/"), [pathname]);
}

/**
 * Language for prefixLang() from the URL (English has no /en/ prefix — first segment is not a lang code).
 */
export function useLangFromPath(): string {
	const pathname = usePathname() ?? "";
	return useMemo(() => {
		const first = pathname.split("/").filter(Boolean)[0];
		if (first && supportedLanguages.includes(first as never)) return first;
		return defaultLanguage;
	}, [pathname]);
}
