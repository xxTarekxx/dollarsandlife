import { NextRequest, NextResponse } from "next/server";
import {
	supportedLanguages,
	defaultLanguage,
} from "./lib/i18n/languages";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

/** Cookie name used to remember the user's preferred language across visits. */
const LOCALE_COOKIE = "NEXT_LOCALE";

/**
 * Auth paths that must NOT be language-prefixed.
 * These are Pages Router routes with Firebase-specific query params (oobCode, mode).
 * Redirecting them to /en/auth/action would break Firebase email action links.
 */
const AUTH_BYPASS_PREFIXES = ["/auth", "/forgot-password", "/new-password"];

// ── CMS auth ──────────────────────────────────────────────────────────────────
async function handleCms(request: NextRequest): Promise<NextResponse> {
	const { pathname } = request.nextUrl;

	const token = request.cookies.get("cms_token")?.value;

	// Pages that are always accessible (no token required)
	if (pathname === "/cms/login" || pathname === "/cms/change-password") {
		return NextResponse.next();
	}

	// All other CMS pages require a valid token
	if (!token) {
		return NextResponse.redirect(new URL("/cms/login", request.url));
	}

	return NextResponse.next();
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract a language code from the first path segment, if it's a supported language.
 * e.g. /en/about-us → "en", /es/forum → "es", /contact-us → null
 */
function getLocaleFromPath(pathname: string): string | null {
	const segments = pathname.split("/").filter(Boolean);
	const first = segments[0];
	if (first && supportedLanguages.includes(first as never)) {
		return first;
	}
	return null;
}

/**
 * Map an Accept-Language header value to the best supported language.
 * Handles quality values (q=0.9) and regional variants (en-US → en).
 * Returns defaultLanguage if no match is found.
 */
function mapAcceptLanguageToLocale(acceptLang: string | null): string {
	if (!acceptLang) return defaultLanguage;
	const preferred = acceptLang
		.split(",")
		.map((entry) => {
			const [lang, q = "q=1"] = entry.trim().split(";");
			const quality = parseFloat(q.replace("q=", "")) || 1;
			const code = lang.split("-")[0].toLowerCase();
			return { code, quality };
		})
		.sort((a, b) => b.quality - a.quality);

	for (const { code } of preferred) {
		if (supportedLanguages.includes(code as never)) return code;
		// Map common regional variants that might not appear in supportedLanguages as-is
		if (code === "en") return "en";
		if (code === "es") return "es";
		if (code === "pt") return "pt";
		if (code === "ar") return "ar";
		if (code === "zh") return "zh";
	}
	return defaultLanguage;
}

// ─────────────────────────────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// ── CMS routes — handle auth, skip i18n entirely ──────────────────────────
	if (pathname.startsWith("/cms")) {
		return handleCms(request);
	}

	// ── Skip static assets, API routes, and known file paths ──────────────────
	// These should never be redirected or have language prefixes injected.
	if (
		pathname.startsWith("/_next") ||
		pathname.startsWith("/api") ||
		pathname.includes(".") ||
		pathname === "/favicon.ico" ||
		pathname === "/website-logo-icon.png" ||
		pathname.startsWith("/og-image") ||
		pathname.startsWith("/logo-")
	) {
		return NextResponse.next();
	}

	// ── Skip auth paths — these are Pages Router routes with Firebase query params ──
	// /auth/action?mode=resetPassword&oobCode=... must reach Pages Router unchanged.
	// /forgot-password and /new-password are noindex auth flows, not multilingual pages.
	if (AUTH_BYPASS_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(prefix + "/"))) {
		return NextResponse.next();
	}

	// ── Already has a language prefix ────────────────────────────────────────
	const existingLocale = getLocaleFromPath(pathname);

	if (existingLocale === defaultLanguage) {
		// /en/... is non-canonical — 308 redirect to the clean English URL.
		// e.g.  /en/breaking-news/slug  →  /breaking-news/slug
		// Preserves any SEO equity for pages already indexed without /en/.
		const cleanPath = pathname.replace(/^\/en/, "") || "/";
		return NextResponse.redirect(new URL(cleanPath, request.url), 308);
	}

	if (existingLocale) {
		// Non-English prefix (/ar/, /es/, …) — pass through unchanged.
		// x-pathname is read by app/[lang]/layout.tsx to build canonical + hreflang.
		const reqHeaders = new Headers(request.headers);
		reqHeaders.set("x-pathname", pathname);
		const res = NextResponse.next({ request: { headers: reqHeaders } });
		res.cookies.set(LOCALE_COOKIE, existingLocale, { maxAge: 60 * 60 * 24 * 365 });
		return res;
	}

	// ── No language prefix ────────────────────────────────────────────────────
	// Language preference order:
	//   1. Cookie  (previous explicit choice via language switcher)
	//   2. defaultLanguage ("en") — all first-time visitors see English
	//
	// Accept-Language auto-detection is intentionally disabled; users choose
	// their language explicitly via the switcher, which writes the cookie.
	const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
	const locale =
		cookieLocale && supportedLanguages.includes(cookieLocale as never)
			? cookieLocale
			: defaultLanguage;

	if (locale !== defaultLanguage) {
		// User prefers a non-English language → redirect to /{lang}/...
		return NextResponse.redirect(
			new URL(`/${locale}${pathname === "/" ? "" : pathname}`, request.url),
		);
	}

	// English: internal REWRITE so the App Router sees /en{path} and resolves
	// params.lang = "en", while the browser URL stays clean (no /en/ prefix).
	// x-pathname is set to the ORIGINAL path so layout builds correct
	// canonical and hreflang URLs (e.g. /breaking-news/slug, not /en/...).
	const reqHeaders = new Headers(request.headers);
	reqHeaders.set("x-pathname", pathname);
	const rewriteTarget = new URL(`/en${pathname === "/" ? "" : pathname}`, request.url);
	const res = NextResponse.rewrite(rewriteTarget, { request: { headers: reqHeaders } });
	res.cookies.set(LOCALE_COOKIE, defaultLanguage, { maxAge: 60 * 60 * 24 * 365 });
	return res;
}

// ─────────────────────────────────────────────────────────────────────────────
// MATCHER
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Apply middleware to all routes except:
 *   - /_next/static  (built assets)
 *   - /_next/image   (image optimisation)
 *   - /favicon.ico
 *   - Files with known image/font extensions
 */
export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
