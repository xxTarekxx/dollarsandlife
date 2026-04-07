import type { Metadata } from "next";
import { headers } from "next/headers";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { generateHreflangLinks } from "@/lib/i18n/hreflang";
import { resolveLegalLang, TERMS_PAGE_CONTENT } from "@/lib/i18n/legal-page-content";

import dynamic from "next/dynamic";

/**
 * App Router entry point for /[lang]/terms-of-service.
 * Dynamically imports the terms-of-service page component from the pages/ directory.
 */
const TermsOfServicePage = dynamic(() => import("@pages/terms-of-service"), { ssr: true });

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const legalLang = resolveLegalLang(lang);
	const copy = TERMS_PAGE_CONTENT[legalLang];
	const headersList = await headers();
	const pathname = headersList.get("x-pathname") ?? `/${lang}/terms-of-service`;
	const canonical = buildCanonicalUrl(pathname);
	const hreflangLinks = generateHreflangLinks(pathname);
	const languages: Record<string, string> = {};
	for (const { hreflang, href } of hreflangLinks) languages[hreflang] = href;

	return {
		title: copy.seoTitle,
		description: copy.seoDescription,
		alternates: { canonical, languages },
		openGraph: {
			title: copy.seoTitle,
			description: copy.seoDescription,
			type: "article",
			url: canonical,
			images: ["https://www.dollarsandlife.com/og-image-homepage.jpg"],
		},
		twitter: {
			card: "summary_large_image",
			title: copy.seoTitle,
			description: copy.seoDescription,
			images: ["https://www.dollarsandlife.com/og-image-homepage.jpg"],
		},
	};
}

export default function Page() {
	return <TermsOfServicePage />;
}
