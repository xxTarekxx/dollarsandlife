import { useRouter } from "next/router";
import React from "react";
import Breadcrumb from "./Breadcrumb";

// Map of URL paths to breadcrumb titles
const breadcrumbNameMap: Record<string, string> = {
	"/": "Home",
	"/forum": "Forum",
	"/extra-income": "Extra Income",
	"/extra-income/freelance-jobs": "Freelance Jobs",
	"/extra-income/budget": "Budgeting",
	"/extra-income/remote-online-jobs": "Remote Online Jobs",
	"/extra-income/money-making-apps": "Money Making Apps",
	"/shopping-deals": "Shopping Deals",
	"/start-a-blog": "Start A Blog",
	"/breaking-news": "Breaking News",
	"/financial-calculators": "Financial Calculators",
	"/about-us": "About Us",
	"/contact-us": "Contact Us",
	"/privacy-policy": "Privacy Policy",
	"/terms-of-service": "Terms of Service",
	"/return-policy": "Return Policy",
	"/forum/create-post": "Create Post",
};

const BreadcrumbWrapper: React.FC = () => {
	const router = useRouter();

	// Use asPath instead of pathname to get the actual URL path
	const paths = router.asPath.split("/").filter(Boolean); // Removes empty strings from splitting

	const breadcrumbPaths = paths.reduce<{ title: string; url: string }[]>(
		(acc, path, index) => {
			const url = `/${paths.slice(0, index + 1).join("/")}`;
			// Try to get the title from the map, fallback to a formatted version of the path
			let title = breadcrumbNameMap[url];
			if (!title) {
				// For dynamic routes (like [id]), format the actual path segment
				title = decodeURIComponent(path)
					.split("-")
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join(" ");
			}
			acc.push({ title, url });
			return acc;
		},
		[{ title: "Home", url: "/" }], // Initial breadcrumb always Home
	);

	return <Breadcrumb paths={breadcrumbPaths} />;
};

export default BreadcrumbWrapper;
