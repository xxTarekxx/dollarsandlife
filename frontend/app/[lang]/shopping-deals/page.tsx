import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { headers } from "next/headers";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { generateHreflangLinks } from "@/lib/i18n/hreflang";

const TITLE = "Deals and Savings | Best Online Shopping Discounts";
const DESC =
	"Find the best deals and savings on top-rated products. Discover curated discounts, coupons, and money-saving picks to stretch your budget further.";
const OG_IMAGE = "https://www.dollarsandlife.com/og-image-homepage.jpg";

const ShoppingDealsPage = dynamic(() => import("@pages/shopping-deals"), {
	ssr: true,
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const headersList = await headers();
	const pathname = headersList.get("x-pathname") ?? `/${lang}/shopping-deals`;
	const canonical = buildCanonicalUrl(pathname);
	const hreflangLinks = generateHreflangLinks(pathname);
	const languages: Record<string, string> = {};
	for (const { hreflang, href } of hreflangLinks) languages[hreflang] = href;

	return {
		title: TITLE,
		description: DESC,
		alternates: { canonical, languages },
		openGraph: {
			title: TITLE,
			description: DESC,
			type: "website",
			url: canonical,
			images: [OG_IMAGE],
		},
		twitter: {
			card: "summary_large_image",
			title: TITLE,
			description: DESC,
			images: [OG_IMAGE],
		},
	};
}

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

async function fetchShoppingDeals() {
	try {
		const res = await fetch(`${INTERNAL_API}/shopping-deals`, {
			next: { revalidate: 3600 },
		});
		if (!res.ok) {
			console.error(`[shopping-deals] API returned ${res.status}`);
			return { initialProducts: [], error: `API error ${res.status}` };
		}
		const data = await res.json();
		return { initialProducts: Array.isArray(data) ? data : [] };
	} catch (err) {
		console.error("[shopping-deals] fetch failed:", err);
		return { initialProducts: [], error: "Failed to load deals from server." };
	}
}

// Server Component — fetches data before rendering, no client-side waterfall
export default async function Page() {
	const { initialProducts, error } = await fetchShoppingDeals();
	return <ShoppingDealsPage initialProducts={initialProducts} error={error} />;
}
