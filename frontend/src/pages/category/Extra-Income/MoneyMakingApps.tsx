import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import BlogPostContent from "../../../components/articles-content/BlogPostContent";
import BlogPostCard from "../../../components/articles-postcards/BlogPostCard";
import PaginationContainer from "../../../components/pagination/PaginationContainer";
import "./CommonStyles.css";

interface MoneyMakingApp {
	id: string;
	headline: string;
	image: {
		url: string;
		caption: string;
	};
	content?: { text: string }[];
	author: {
		name: string;
	};
	datePublished: string;
	dateModified?: string;
}

const MoneyMakingApps: React.FC = () => {
	const [apps, setApps] = useState<MoneyMakingApp[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					`${import.meta.env.VITE_REACT_APP_API_BASE}/money-making-apps`,
				);
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: MoneyMakingApp[] = await response.json();
				setApps(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		if (apps.length === 0) fetchData();
	}, [apps.length]);

	const getExcerpt = (content?: { text: string }[]): string => {
		if (!content || content.length === 0) return "";
		const firstSection = content[0]?.text || "";
		return firstSection.length > 120
			? `${firstSection.substring(0, 120)}...`
			: firstSection;
	};

	const currentPosts = apps.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	return (
		<div className='page-container'>
			<Helmet>
				<title>Best Money Making Apps to Earn Extra Cash in 2025</title>
				<meta
					name='description'
					content='Discover the best money-making apps to earn extra cash in 2025. Learn about passive income, cashback, and gig economy apps.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/extra-income/money-making-apps'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: apps.map((post, index) => ({
							"@type": "Article",
							position: index + 1,
							headline: post.headline,
							image: post.image,
							author: { "@type": "Organization", name: post.author.name },
							datePublished: post.datePublished,
							url: `https://www.dollarsandlife.com/extra-income/money-making-apps/${post.id}`,
						})),
					})}
				</script>
			</Helmet>

			<Routes>
				<Route
					path='/'
					element={
						<>
							<h1>Money Making Apps</h1>

							<div className='content-wrapper'>
								{currentPosts.length > 0 ? (
									currentPosts.map((post) => (
										<BlogPostCard
											key={post.id}
											id={post.id}
											headline={post.headline}
											image={post.image}
											content={getExcerpt(post.content)}
											author={post.author}
											datePublished={post.datePublished}
											dateModified={post.dateModified}
											canonicalUrl={`https://www.dollarsandlife.com/extra-income/money-making-apps/${post.id}`}
											linkTo={`/extra-income/money-making-apps/${post.id}`}
										/>
									))
								) : (
									<p>No money-making apps found.</p>
								)}
							</div>

							<PaginationContainer
								totalItems={apps.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</>
					}
				/>
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='money-making-apps' />}
				/>
			</Routes>
		</div>
	);
};

export default MoneyMakingApps;
