import { notFound, redirect } from "next/navigation";
import { sanitizeAndTruncateHTML } from "@/utils/sanitization.server";

// ISR: cache per language — pre-translated content served from MongoDB via ?lang=
export const revalidate = 3600;

function getProductSlugFromCanonicalUrl(canonicalUrl: string): string | null {
	if (!canonicalUrl || typeof canonicalUrl !== "string") return null;
	let pathname = canonicalUrl.trim();
	if (pathname.startsWith("http://") || pathname.startsWith("https://")) {
		try {
			pathname = new URL(canonicalUrl).pathname;
		} catch {
			return null;
		}
	}
	const match = pathname.match(/\/shopping-deals\/products\/(.+)/);
	return match ? match[1].replace(/\/+$/, "") : null;
}

export default async function ProductDetailPage({
	params,
}: {
	params: Promise<{ lang: string; productId: string }>;
}) {
	const { lang, productId } = await params;
	if (!productId || typeof productId !== "string" || productId.length > 200)
		notFound();
	const numericId = productId.split("-")[0];
	if (!numericId || isNaN(parseInt(numericId, 10))) notFound();
	const base = process.env.NEXT_PUBLIC_REACT_APP_API_BASE;
	if (!base) notFound();
	try {
		const res = await fetch(
			`${base}/shopping-deals/${encodeURIComponent(numericId)}?lang=${lang}`,
			{ next: { revalidate: 3600 } },
		);
		if (!res.ok) {
			if (res.status === 404) notFound();
			throw new Error(`Fetch failed: ${res.status}`);
		}
		const product = await res.json();
		product.metaDescription = sanitizeAndTruncateHTML(product.description, 160);
		const canonicalSlug = product.canonicalUrl
			? getProductSlugFromCanonicalUrl(product.canonicalUrl)
			: null;
		if (canonicalSlug && productId !== canonicalSlug) {
			redirect(`/${lang}/shopping-deals/products/${canonicalSlug}`);
		}
		const productSlug = canonicalSlug || productId;
		const Component = (
			await import("@pages/shopping-deals/products/[productId]")
		).default;
		return <Component product={product} productSlug={productSlug} />;
	} catch (e) {
		if (e && typeof e === "object" && "digest" in e) throw e;
		notFound();
	}
}
