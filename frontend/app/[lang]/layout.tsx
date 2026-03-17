import type { Metadata } from "next";
import { headers } from "next/headers";
import React from "react";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { generateHreflangLinks } from "@/lib/i18n/hreflang";
import { getBreadcrumbLabels, getFooterLabels, getNavLabels } from "@/lib/i18n/ui-translations";
import { LangHtml } from "@/components/LangHtml";
import BreadcrumbWrapper from "@/components/breadcrumbs/BreadcrumbWrapper";
import Footer from "@/components/footer/Footer";
import NavBar from "@/components/navbar/NavBar";
import RssTicker from "@/components/rss-news/RssTicker";

import "@/components/articles-content/BlogPostContent.css";
import "@/components/articles-postcards/BlogPostCard.css";
import "@/components/breadcrumbs/Breadcrumb.css";
import "@/components/LanguageSwitcher.css";
import "@/components/calculators/FinancialCalculators.css";
import "@/components/footer/Footer.css";
import "@/components/navbar/NavBar.css";
import "@/components/pagination/PaginationContainer.css";
import "@/components/rss-news/RssTicker.css";
import "../../pages/extra-income/CommonStyles.css";
import "../../pages/extra-income/ExtraIncome.css";
import "../../pages/forum/ForumHomePage.css";
import "../../pages/forum/post/ViewPostPage.css";
import "../../pages/HomePage.css";
import "../../pages/return-policy/return-policy.css";
import "../../pages/shopping-deals/ProductDetails.css";
import "../../pages/shopping-deals/ShoppingDeals.css";

// ISR: cache layout (navbar/footer translations) per language for 1 hour.
// UI labels translated on first request are saved and reused for all visitors.
export const revalidate = 3600;

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string }>;
}): Promise<Metadata> {
	const { lang } = await params;
	const headersList = await headers();
	const pathname = headersList.get("x-pathname") ?? `/${lang}`;
	const canonical = buildCanonicalUrl(pathname);
	const hreflangLinks = generateHreflangLinks(pathname);
	const languages: Record<string, string> = {};
	for (const { hreflang, href } of hreflangLinks) {
		languages[hreflang] = href;
	}
	return {
		alternates: {
			canonical,
			languages,
		},
	};
}

export default async function LangLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;

	// Translate all UI labels server-side in parallel, then pass as props.
	// Client components (NavBar, Footer, BreadcrumbWrapper) receive pre-translated
	// strings — they never call the translation API directly.
	const [navLabels, footerLabels, breadcrumbLabels] = await Promise.all([
		getNavLabels(lang),
		getFooterLabels(lang),
		getBreadcrumbLabels(lang),
	]);

	return (
		<>
			<LangHtml />
			<div className="app-container">
				<header>
					<NavBar lang={lang} labels={navLabels} />
				</header>
				<aside>
					<RssTicker />
				</aside>
				<BreadcrumbWrapper lang={lang} labels={breadcrumbLabels} />
				<main>{children}</main>
				<footer>
					<Footer lang={lang} labels={footerLabels} />
				</footer>
			</div>
		</>
	);
}
