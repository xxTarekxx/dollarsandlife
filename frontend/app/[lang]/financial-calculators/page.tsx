import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { headers } from "next/headers";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { generateHreflangLinks } from "@/lib/i18n/hreflang";

const TITLE = "Financial Calculators | Free Money Tools by Dollars & Life";
const DESC =
	"Use our free financial calculators for budgeting, savings, loan repayment, and more. Practical money tools built to help you take control of your finances.";
const OG_IMAGE = "https://www.dollarsandlife.com/og-image-homepage.jpg";

const FinancialCalculatorsPage = dynamic(
	() => import("@pages/financial-calculators"),
	{ ssr: true },
);

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const headersList = await headers();
	const pathname = headersList.get("x-pathname") ?? `/${lang}/financial-calculators`;
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
	return <FinancialCalculatorsPage />;
}
