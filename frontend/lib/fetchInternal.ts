/**
 * Fetch from the internal Express API with a hard timeout.
 * Used by App Router Server Components only — never runs in the browser.
 *
 * Combines AbortController (cancels the socket) with Promise.race (guarantees
 * the timeout promise wins even on Windows where AbortController alone may not
 * interrupt an in-progress TCP read fast enough).
 */

export type FetchInternalOptions = {
	/**
	 * Default 3600. Use `false` for `cache: 'no-store'`.
	 * Short values (e.g. 60) help listing pages that must reflect API changes (prices) soon after deploy.
	 */
	revalidate?: number | false;
};

export async function fetchInternal(
	path: string,
	timeoutMs = 15_000,
	options?: FetchInternalOptions,
): Promise<Response> {
	const base =
		process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";
	const url = `${base}${path}`;

	const controller = new AbortController();

	const timeoutPromise = new Promise<never>((_, reject) =>
		setTimeout(() => {
			controller.abort(); // cancel the socket so it doesn't linger
			reject(new Error(`fetchInternal timeout after ${timeoutMs}ms: ${url}`));
		}, timeoutMs),
	);

	const revalidate = options?.revalidate;
	const fetchInit: RequestInit =
		revalidate === false
			? { cache: "no-store", signal: controller.signal }
			: {
					next: { revalidate: revalidate ?? 3600 },
					signal: controller.signal,
				};

	const fetchPromise = fetch(url, fetchInit);

	return Promise.race([fetchPromise, timeoutPromise]);
}
