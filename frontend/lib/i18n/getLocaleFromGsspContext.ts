import type { GetServerSidePropsContext } from "next";

import { defaultLanguage, supportedLanguages } from "./languages";

/**
 * Resolve locale from the request path (first segment), not cookies.
 * Crawlers often have no NEXT_LOCALE cookie; cookie-only locale produced English
 * canonicals in <Head> on /ar/... URLs while app/[lang]/layout used the correct URL
 * ("Duplicate" / wrong canonical in GSC).
 */
export function getLocaleFromGsspContext(
	context: Pick<GetServerSidePropsContext, "resolvedUrl">,
): string {
	const raw = context.resolvedUrl?.split("?")[0] ?? "";
	const pathname = raw.startsWith("http") ? new URL(raw).pathname : raw;
	const first = pathname.split("/").filter(Boolean)[0];
	if (first && supportedLanguages.includes(first as never)) {
		return first;
	}
	return defaultLanguage;
}
