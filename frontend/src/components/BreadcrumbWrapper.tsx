import React from "react";
import { useLocation } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";

const breadcrumbNameMap: { [key: string]: string } = {
	"/": "Home",
	"/extra-income": "Extra Income",
	"/extra-income/freelancers": "Freelance Jobs",
	"/extra-income/budgetting": "Budgeting",
	"/extra-income/remote-jobs": "Remote Jobs",
	"/extra-income/side-hustles": "Side Hustles",
	"/extra-income/money-making-apps": "Money Making Apps",
	"/deals-and-savings": "Deals and Savings",
	"/start-a-blog": "Start A Blog",
	"/My-Story": "My Story",
};

const BreadcrumbWrapper: React.FC = () => {
	const location = useLocation();
	const paths = location.pathname
		.split("/")
		.filter((x) => x && x !== "category");
	const breadcrumbPaths = [{ title: "Home", url: "/" }]; // Start with Home

	paths.forEach((path, index) => {
		const url = `/${paths.slice(0, index + 1).join("/")}`;
		breadcrumbPaths.push({ title: breadcrumbNameMap[url] || path, url });
	});

	return <Breadcrumb paths={breadcrumbPaths} />;
};

export default BreadcrumbWrapper;
