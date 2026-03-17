/**
 * translateContent.ts — STUB
 *
 * The LibreTranslate runtime translation system has been removed.
 * Article content is now pre-translated in MongoDB under each document's
 * `languages` map. The API returns the correct locale directly via ?lang=
 *
 * This stub is kept so any remaining import references compile without
 * error while the codebase finishes migrating. Remove it once all
 * call sites have been cleaned up.
 */

/** No-op: returns the original text unchanged. */
export async function translateContent(text: string, _lang: string): Promise<string> {
	return text;
}

/** No-op: returns the original post unchanged. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function translateArticle<T extends Record<string, any>>(post: T, _lang: string): Promise<T> {
	return post;
}

/** No-op: returns the original fields unchanged. */
export async function translateFields<T extends Record<string, string>>(fields: T, _lang: string): Promise<T> {
	return fields;
}
