import React, { useEffect, useState, useRef } from "react";
import AdComponent from "../../../components/AdComponent";
import Breadcrumb from "../../../components/Breadcrumb";
import PaginationContainer from "../../../components/PaginationContainer";
import BlogPostCard from "../../../components/BlogPostCard";
import { Link } from "react-router-dom";
import "../../../components/CommonStyles.css";

const MoneyMakingApps: React.FC = () => {
	const [apps, setApps] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Money Making Apps";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/moneymakingapps.json");
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const data = await response.json();
				setApps(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		if (pageRef.current) {
			pageRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [currentPage]);

	const currentPosts = apps.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const breadcrumbPaths = [
		{ title: "Home", url: "/" },
		{ title: "Extra Income", url: "/category/extra-income" },
		{
			title: "Money Making Apps",
			url: "/category/extra-income/money-making-apps",
		},
	];

	return (
		<div className='page-container' ref={pageRef}>
			<div className='breadcrumb-container'>
				<Breadcrumb paths={breadcrumbPaths} />
			</div>
			<div className='top-ad-container'>
				<AdComponent width={728} height={90} />
			</div>
			<h2 className='section-heading'>Money Making Apps</h2>
			<div className='content-wrapper'>
				{currentPosts.map((appData, index) => (
					<React.Fragment key={appData.id}>
						<div className='row-container'>
							<Link
								to={`/category/extra-income/money-making-apps/${appData.id}`}
							>
								<BlogPostCard
									id={appData.id}
									title={appData.title}
									imageUrl={appData.imageUrl}
									content={appData.content}
									author={appData.author}
									datePosted={appData.datePosted}
								/>
							</Link>
						</div>
						{index > 0 && index % 2 === 0 && (
							<div className='ad-row-container'>
								<AdComponent width={660} height={440} />
							</div>
						)}
						{index % 2 === 0 && (
							<div className='mobile-box-ad-container'>
								<AdComponent width={250} height={250} />
							</div>
						)}
						{index % 4 === 0 && (
							<div className='mobile-ad-container'>
								<AdComponent width={320} height={100} />
							</div>
						)}
					</React.Fragment>
				))}
			</div>
			<PaginationContainer
				totalItems={apps.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</div>
	);
};

export default MoneyMakingApps;
