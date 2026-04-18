import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { prefixLang } from "@/lib/i18n/prefixLang";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { sanitizeAndTruncateHTML } from "@/utils/sanitization.server";

export const revalidate = 3600;

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

type ProductResponse = {
	id: string;
	headline?: string | string[];
	shortName?: string;
	image: { url: string; caption: string };
	description?: string;
	currentPrice: string;
	discountPercentage?: string;
	brand?: { name: string };
	purchaseUrl: string;
	offers?: { availability?: string; displayShippingInfo?: string };
	specialOffer?: string;
	aggregateRating?: {
		ratingValue: string;
		reviewCount: string;
	};
	canonicalUrl?: string;
	availableLangs?: string[];
	metaDescription?: string;
	[key: string]: unknown;
};

type ProductComponentProps = {
	id: string;
	headline: string;
	shortName?: string;
	canonicalUrl?: string;
	image: { url: string; caption: string };
	description: string;
	currentPrice: string;
	discountPercentage?: string;
	brand?: { name: string };
	purchaseUrl: string;
	offers?: { availability?: string; displayShippingInfo?: string };
	specialOffer?: string;
	aggregateRating?: {
		ratingValue: string;
		reviewCount: string;
	};
	metaDescription?: string;
};

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

function getAllowedLangs(product: ProductResponse | null): string[] {
	if (!product || !Array.isArray(product.availableLangs) || product.availableLangs.length === 0) {
		return ["en"];
	}
	return product.availableLangs.includes("en")
		? product.availableLangs
		: ["en", ...product.availableLangs];
}

function getCanonicalProductPath(productId: string, canonicalUrl?: string): string {
	const canonicalSlug = canonicalUrl ? getProductSlugFromCanonicalUrl(canonicalUrl) : null;
	return `/shopping-deals/products/${canonicalSlug || productId}`;
}

function normalizeHeadline(headline: ProductResponse["headline"]): string {
	if (Array.isArray(headline)) return headline.join("").trim();
	if (typeof headline === "string") return headline.trim();
	return "";
}

function toProductComponentProps(product: ProductResponse): ProductComponentProps {
	return {
		id: product.id,
		headline: normalizeHeadline(product.headline),
		shortName: product.shortName,
		canonicalUrl: product.canonicalUrl,
		image: product.image,
		description: typeof product.description === "string" ? product.description : "",
		currentPrice: product.currentPrice,
		discountPercentage: product.discountPercentage,
		brand: product.brand,
		purchaseUrl: product.purchaseUrl,
		offers: product.offers,
		specialOffer: product.specialOffer,
		aggregateRating: product.aggregateRating,
		metaDescription: product.metaDescription,
	};
}

const getProduct = cache(async (lang: string, numericId: string) => {
	const res = await fetch(
		`${INTERNAL_API}/shopping-deals/${encodeURIComponent(numericId)}?lang=${lang}`,
		{ next: { revalidate: 3600 } },
	);
	if (!res.ok) {
		return { ok: false as const, status: res.status, product: null };
	}
	const product = (await res.json()) as ProductResponse;
	return { ok: true as const, status: res.status, product };
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string; productId: string }>;
}): Promise<Metadata> {
	const { lang, productId } = await params;
	const numericId = productId.split("-")[0];
	if (!numericId || isNaN(parseInt(numericId, 10))) return {};
	try {
		const result = await getProduct(lang, numericId);
		if (!result.ok || !result.product) return {};

		const allowedLangs = getAllowedLangs(result.product);
		if (!allowedLangs.includes(lang)) return {};

		const canonicalPath = getCanonicalProductPath(productId, result.product.canonicalUrl);
		const canonical = buildCanonicalUrl(prefixLang(canonicalPath, lang));
		const languages: Record<string, string> = {};
		for (const locale of allowedLangs) {
			languages[locale] = buildCanonicalUrl(prefixLang(canonicalPath, locale));
		}
		languages["x-default"] = buildCanonicalUrl(canonicalPath);

		const headline = normalizeHeadline(result.product.headline);
		const description =
			typeof result.product.description === "string"
				? sanitizeAndTruncateHTML(result.product.description, 160)
				: undefined;

		return {
			title: headline ? `${headline} | Shopping Deals` : "Shopping Deals",
			description,
			alternates: { canonical, languages },
		};
	} catch {
		return {};
	}
}

export default async function ProductDetailPage({
	params,
}: {
	params: Promise<{ lang: string; productId: string }>;
}) {
	const { lang, productId } = await params;
	if (!productId || typeof productId !== "string" || productId.length > 200) {
		notFound();
	}
	const numericId = productId.split("-")[0];
	if (!numericId || isNaN(parseInt(numericId, 10))) {
		notFound();
	}

	try {
		const result = await getProduct(lang, numericId);
		if (!result.ok || !result.product) {
			if (result.status === 404) notFound();
			throw new Error(`Fetch failed: ${result.status}`);
		}

		const product = result.product;
		if (!getAllowedLangs(product).includes(lang)) {
			notFound();
		}

		if (typeof product.description === "string") {
			product.metaDescription = sanitizeAndTruncateHTML(product.description, 160);
		}

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
		return <Component product={toProductComponentProps(product)} productSlug={productSlug} />;
	} catch (e) {
		if (e && typeof e === "object" && "digest" in e) throw e;
		notFound();
	}
}
