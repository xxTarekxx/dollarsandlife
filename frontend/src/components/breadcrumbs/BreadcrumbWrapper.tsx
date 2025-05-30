import React from "react";
import { useLocation } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";

// Map of URL paths to breadcrumb titles
const breadcrumbNameMap: Record<string, string> = {
	"/": "Home",
	"/extra-income": "Extra Income",
	"/extra-income/freelancers": "Freelancers",
	"/extra-income/budget": "Budgeting",
	"/extra-income/remote-jobs": "Remote Jobs",
	"/extra-income/side-hustles": "Side Hustles",
	"/extra-income/money-making-apps": "Money Making Apps",
	"/shopping-deals": "Shopping Deals",
	"/start-a-blog": "Start A Blog",
	"/breaking-news": "Breaking News",
	"/financial-calculators": "Financial Calculators",
};

const BreadcrumbWrapper: React.FC = () => {
	const location = useLocation();

	const paths = location.pathname.split("/").filter(Boolean); // Removes empty strings from splitting

	const breadcrumbPaths = paths.reduce<{ title: string; url: string }[]>(
		(acc, path, index) => {
			const url = `/${paths.slice(0, index + 1).join("/")}`;
			const title = breadcrumbNameMap[url] || decodeURIComponent(path);
			acc.push({ title, url });
			return acc;
		},
		[{ title: "Home", url: "/" }], // Initial breadcrumb always Home
	);

	return <Breadcrumb paths={breadcrumbPaths} />;
};

export default BreadcrumbWrapper;
