/**
 * Use for client-side fetch only. Returns same-origin proxy in browser so
 * production never calls localhost. Server-side code should use
 * process.env.NEXT_PUBLIC_REACT_APP_API_BASE directly.
 */
export function getClientApiBase(): string {
	if (typeof window !== "undefined") {
		return "/api/proxy";
	}
	return process.env.NEXT_PUBLIC_REACT_APP_API_BASE || "";
}
