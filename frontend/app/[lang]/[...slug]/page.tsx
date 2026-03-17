import { notFound } from "next/navigation";

/**
 * Catch-all fallback for /[lang]/... routes that don't match any specific page.
 * All known routes now have explicit App Router pages (see app/[lang]/ siblings).
 * Any unknown path hits this handler and returns a proper 404.
 *
 * If you add a new section (e.g. /en/newsletters), create a dedicated page at
 * app/[lang]/newsletters/page.tsx — do not rely on this catch-all for real content.
 */
export default async function LangFallbackPage({
	params,
}: {
	params: Promise<{ lang: string; slug: string[] }>;
}) {
	// Emit a proper 404 so search engines don't index unknown routes
	await params; // consume params to satisfy Next.js async params requirement
	notFound();
}
