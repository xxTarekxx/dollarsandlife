import type { Metadata } from "next";
import { headers } from "next/headers";
import { generateHreflangLinks } from "@/lib/i18n/hreflang";
import { buildCanonicalUrl } from "@/lib/seo/canonical";

import AboutUsClient from "./AboutUsClient";

const baseUrl = "https://www.dollarsandlife.com";

// Page metadata — article content is pre-translated in MongoDB via ?lang=; UI strings use ui-translations.ts
const TITLE = "About Dollars & Life | Developer-Built Personal Finance Platform";
const DESC = "The story behind Dollars & Life: A custom-built platform by developer Tarek I. to decode personal finance through technology and real-world experience.";
const OG_DESC = "Learn how a developer obsession with real-world financial problems led to a custom-built platform for everyone.";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const headersList = await headers();
	const pathname = headersList.get("x-pathname") ?? `/${lang}/about-us`;
	const canonical = buildCanonicalUrl(pathname);
	const hreflangLinks = generateHreflangLinks(pathname);
	const languages: Record<string, string> = {};
	for (const { hreflang, href } of hreflangLinks) {
		languages[hreflang] = href;
	}

	return {
		title: TITLE,
		description: DESC,
		alternates: {
			canonical,
			languages,
		},
		openGraph: {
			title: TITLE,
			description: OG_DESC,
			type: "website",
			url: canonical,
			images: [`${baseUrl}/og-image-homepage.jpg`],
		},
		twitter: {
			card: "summary_large_image",
			title: TITLE,
			description: OG_DESC,
			images: [`${baseUrl}/og-image-homepage.jpg`],
		},
	};
}

export default function AboutUsPage() {
	return <AboutUsClient />;
}
