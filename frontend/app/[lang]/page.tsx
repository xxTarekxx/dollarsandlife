import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

const siteUrl = "https://www.dollarsandlife.com/";
const siteName = "DollarsAndLife.com";
const shortSiteName = "Dollars & Life";
const ogImageContent = `${siteUrl}og-image-homepage.jpg`;

// Page metadata — article content is pre-translated in MongoDB via ?lang=; UI strings use ui-translations.ts
const TITLE = `${shortSiteName} | Smart Personal Finance & Extra Income`;
const DESCRIPTION = "Smart budgeting guides, extra income strategies, shopping deals, and blogging tips to help you take control of your financial future.";
const OG_TITLE = `${shortSiteName} | Smart Personal Finance & Online Income`;
const TW_TITLE = `${shortSiteName} | Actionable Finance Tips for a Better Life`;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const pageUrl = `https://www.dollarsandlife.com/${lang}`;

	return {
		title: TITLE,
		description: DESCRIPTION,
		keywords: "personal finance, budgeting, earn extra income, shopping deals, start a blog, financial freedom, money management, Tarek I",
		openGraph: {
			locale: lang === "en" ? "en_US" : undefined,
			type: "website",
			url: pageUrl,
			title: OG_TITLE,
			description: DESCRIPTION,
			images: [{ url: ogImageContent, width: 1200, height: 630 }],
			siteName,
		},
		twitter: {
			card: "summary_large_image",
			title: TW_TITLE,
			description: DESCRIPTION,
			images: [ogImageContent],
		},
	};
}

export default function HomePage() {
	return <HomePageClient />;
}
