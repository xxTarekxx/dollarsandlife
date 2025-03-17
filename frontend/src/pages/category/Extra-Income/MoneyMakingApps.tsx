import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Route, Routes } from "react-router-dom";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "./CommonStyles.css";

interface MoneyMakingApp {
	id: string;
	title: string;
	image: {
		url: string;
		caption: string;
	};
	content?: { text: string }[];
	author: {
		name: string;
	};
	dateModified?: string;
	datePublished: string;
}

const MoneyMakingApps: React.FC = () => {
	const [apps, setApps] = useState<MoneyMakingApp[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/moneymakingapps.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: MoneyMakingApp[] = await response.json();
				setApps(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	const getExcerpt = (content?: { text: string }[]): string => {
		if (!content || content.length === 0) return "No content available.";
		const firstSection = content[0]?.text || "";
		return firstSection.length > 200
			? `${firstSection.substring(0, 200)}...`
			: firstSection;
	};

	const currentPosts = apps.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	return (
		<div className='page-container'>
			{/*  Add Helmet for SEO */}
			<Helmet>
				<title>Best Money Making Apps to Earn Extra Cash in 2025</title>
				<meta
					name='description'
					content='Discover the best money-making apps to earn extra cash in 2025. Learn about passive income, cashback, and gig economy apps.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/Extra-Income/Money-Making-Apps'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: apps.map((post, index) => ({
							"@type": "Article",
							position: index + 1,
							headline: post.title,
							image: post.image,
							author: { "@type": "Person", name: post.author },
							datePublished: post.datePublished,
							url: `https://www.dollarsandlife.com/Extra-Income/Money-Making-Apps/${post.id}`,
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
							<div className='top-banner-container'>
								<a
									href='https://lycamobileusa.sjv.io/c/5513478/2107177/25589'
									target='_blank'
									rel='noopener noreferrer'
									className='TopBanner'
								>
									<img
										src='/images/shoppinganddeals/Lyca-Mobile-728x90.webp'
										alt='Lyca Mobile Banner'
										className='TopBannerImage'
									/>
								</a>
							</div>
							<div className='content-wrapper'>
								{currentPosts.length > 0 ? (
									currentPosts.map((post, i) => (
										<React.Fragment key={post.id || `post-${i}`}>
											<div className='row-container'>
												<Link to={`/Extra-Income/Money-Making-Apps/${post.id}`}>
													<BlogPostCard
														id={post.id}
														title={post.title}
														image={post.image}
														content={getExcerpt(post.content)}
														author={post.author}
														datePublished={post.datePublished}
														dateModified={post.dateModified}
													/>
												</Link>
											</div>
										</React.Fragment>
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
					element={<BlogPostContent jsonFile='moneymakingapps.json' />}
				/>
			</Routes>
		</div>
	);
};

export default MoneyMakingApps;
