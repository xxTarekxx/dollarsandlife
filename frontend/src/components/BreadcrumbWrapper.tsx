import React from "react";
import { useLocation } from "react-router-dom";
import Breadcrumb from "./Breadcrumb";

const breadcrumbNameMap: { [key: string]: string } = {
	"/": "Home",
	"/Extra-Income": "Extra Income",
	"/Extra-Income/Freelancers": "Freelancers",
	"/Extra-Income/budgetting": "Budgeting",
	"/Extra-Income/Remote-Jobs": "Remote Jobs",
	"/Extra-Income/side-hustles": "Side Hustles",
	"/Extra-Income/Money-Making-Apps": "Money Making Apps",
	"/AmazonPicks": "Amazon Picks",
	"/Start-A-Blog": "Start A Blog",
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
