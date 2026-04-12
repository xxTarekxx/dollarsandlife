import type { Metadata } from "next";
import { headers } from "next/headers";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { generateHreflangLinks } from "@/lib/i18n/hreflang";
import ShoppingDealsPage from "@pages/shopping-deals";
import { fetchInternal } from "@/lib/fetchInternal";

const TITLE = "Deals and Savings | Best Online Shopping Discounts";
const DESC =
	"Find the best deals and savings on top-rated products. Discover curated discounts, coupons, and money-saving picks to stretch your budget further.";
const OG_IMAGE = "https://www.dollarsandlife.com/og-image-homepage.jpg";

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

async function fetchShoppingDeals() {
	try {
		// Short cache / fresh prices: list API + cards must not stay stale for 1h after backend fixes.
		const res = await fetchInternal("/shopping-deals", 15_000, { revalidate: 60 });
		if (!res.ok) return { initialProducts: [], error: `API error ${res.status}` };
		const data = await res.json();
		return { initialProducts: Array.isArray(data) ? data : [] };
	} catch {
		return { initialProducts: [], error: "Failed to load deals from server." };
	}
}

// Server Component — fetches data before rendering, no client-side waterfall
export default async function Page() {
	const { initialProducts, error } = await fetchShoppingDeals();
	return <ShoppingDealsPage initialProducts={initialProducts} error={error} />;
}
