"use client";

import { usePathname } from "next/navigation";
import React from "react";
import { pathWithoutLang, prefixLang } from "@/lib/i18n/prefixLang";
import type { BreadcrumbLabels } from "@/lib/i18n/ui-translations";
import Breadcrumb from "./Breadcrumb";
// Eager import — LanguageSwitcher is visible on every page so lazy-loading it
// causes a CSS flash (styles arrive a tick after the element). Importing directly
// bundles it with BreadcrumbWrapper so styles are ready on first paint.
import LanguageSwitcher from "../LanguageSwitcher";

/**
 * Build the breadcrumb name map from translated labels.
 * Falls back to English strings when labels are not provided.
 */
function buildNameMap(labels?: BreadcrumbLabels): Record<string, string> {
	return {
		"/": labels?.home ?? "Home",
		"/forum": labels?.forum ?? "Forum",
		"/extra-income": labels?.extraIncome ?? "Extra Income",
		"/extra-income/freelance-jobs": labels?.freelanceJobs ?? "Freelance Jobs",
		"/extra-income/budget": labels?.budgeting ?? "Budgeting",
		"/extra-income/remote-online-jobs": labels?.remoteOnlineJobs ?? "Remote Online Jobs",
		"/extra-income/money-making-apps": labels?.moneyMakingApps ?? "Money Making Apps",
		"/shopping-deals": labels?.shoppingDeals ?? "Shopping Deals",
		"/start-a-blog": labels?.startABlog ?? "Start A Blog",
		"/breaking-news": labels?.breakingNews ?? "Breaking News",
		"/financial-calculators": labels?.financialCalculators ?? "Financial Calculators",
		"/about-us": labels?.aboutUs ?? "About Us",
		"/contact-us": labels?.contactUs ?? "Contact Us",
		"/privacy-policy": labels?.privacyPolicy ?? "Privacy Policy",
		"/terms-of-service": labels?.termsOfService ?? "Terms of Service",
		"/return-policy": labels?.returnPolicy ?? "Return Policy",
		"/forum/create-post": labels?.createPost ?? "Create Post",
	};
}

const BreadcrumbWrapper: React.FC<{ lang?: string; labels?: BreadcrumbLabels }> = ({ lang, labels }) => {
	const pathname = usePathname() ?? "";
	const withoutLang = pathWithoutLang(pathname);
	const paths = withoutLang.split("/").filter(Boolean);

	// Build name map with translated labels (rebuilt on each render — labels are stable server props)
	const breadcrumbNameMap = buildNameMap(labels);

	const breadcrumbPaths = paths.reduce<{ title: string; url: string }[]>(
		(acc, path, index) => {
			const url = `/${paths.slice(0, index + 1).join("/")}`;
			let title = breadcrumbNameMap[url];
			if (!title) {
				title = decodeURIComponent(path)
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ");
			}
			acc.push({ title, url: prefixLang(url, lang) });
			return acc;
		},
		[{ title: labels?.home ?? "Home", url: prefixLang("/", lang) }],
	);

	const isHomePage =
		breadcrumbPaths.length <= 1 &&
		breadcrumbPaths[0]?.title === (labels?.home ?? "Home");

	// Always render the bar so the language switcher is accessible on every page.
	// On the home page the breadcrumb trail is hidden but the switcher still shows.
	return (
		<div className="breadcrumb-bar">
			{!isHomePage && <Breadcrumb paths={breadcrumbPaths} />}
			{lang != null && <LanguageSwitcher />}
		</div>
	);
};

export default BreadcrumbWrapper;
