import type { Metadata } from "next";
import { headers } from "next/headers";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { generateHreflangLinks } from "@/lib/i18n/hreflang";
import ForumPageClient from "./ForumPageClient";

const TITLE = "Community Forum | Dollars & Life";
const DESC =
	"Join the Dollars & Life community forum to ask money questions, share tips, and discuss budgeting, income, and investing strategies.";
const OG_IMAGE = "https://www.dollarsandlife.com/og-image-homepage.jpg";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const headersList = await headers();
	const pathname = headersList.get("x-pathname") ?? `/${lang}/forum`;
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

export default function Page() {
	return <ForumPageClient />;
}
