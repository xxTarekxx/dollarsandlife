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

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

const MoneyMakingApps: React.FC = () => {
	const [apps, setApps] = useState<MoneyMakingApp[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	// Fetch data only once
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

		if (apps.length === 0) fetchData();
	}, [apps.length]);

	// Push AdSense ads
	useEffect(() => {
		if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
			try {
				window.adsbygoogle.push({});
			} catch (e) {
				console.error("Adsense Error:", e);
			}
		}
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

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, [currentPage]);

	return (
		<div className='page-container'>
			{/* SEO Metadata */}
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

							{/* Top Banner Ad */}
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
										loading='eager'
										width='728'
										height='90'
										{...{ fetchpriority: "high" }}
									/>
								</a>
							</div>

							{/* Posts */}
							<div className='content-wrapper'>
								{currentPosts.length > 0 ? (
									currentPosts.map((post, i) => (
										<React.Fragment key={post.id || `post-${i}`}>
											<div className='row-container'>
												<Link
													to={`/extra-income/money-making-apps/${post.id}`}
													style={{ textDecoration: "none" }}
												>
													<BlogPostCard
														id={post.id}
														headline={post.headline}
														image={post.image}
														content={getExcerpt(post.content)}
														author={post.author}
														datePublished={post.datePublished}
														dateModified={post.dateModified}
													/>
												</Link>
											</div>

											{/* AdSense ad after every two posts */}
											{i > 0 && i % 2 === 1 && (
												<div className='postings-container'>
													<ins
														className='adsbygoogle'
														style={{
															display: "block",
															width: "300px",
															height: "250px",
														}}
														data-ad-client='ca-pub-1079721341426198'
														data-ad-slot='7197282987'
														data-ad-format='auto'
														data-full-width-responsive='true'
													></ins>
												</div>
											)}
										</React.Fragment>
									))
								) : (
									<p>No money-making apps found.</p>
								)}
							</div>

							{/* Bottom Banner Ad */}
							<div className='postings-container'>
								<ins
									className='adsbygoogle-banner'
									style={{
										display: "block",
										width: "728px",
										height: "90px",
									}}
									data-ad-client='ca-pub-1079721341426198'
									data-ad-slot='6375155907'
									data-ad-format='horizontal'
									data-full-width-responsive='true'
								></ins>
							</div>

							{/* Pagination */}
							<PaginationContainer
								totalItems={apps.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</>
					}
				/>

				{/* Detailed Blog Post */}
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='moneymakingapps.json' />}
				/>
			</Routes>
		</div>
	);
};

export default MoneyMakingApps;
