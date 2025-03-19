import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Route, Routes } from "react-router-dom";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "./CommonStyles.css";

interface FreelanceJob {
	id: string;
	headline: string;
	image: {
		url: string;
		caption: string;
	};
	content: { text: string }[];
	author: {
		name: string;
	};
	datePublished: string;
	dateModified?: string;
}

const FreelanceJobs: React.FC = () => {
	const [freelanceJobs, setFreelanceJobs] = useState<FreelanceJob[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const [isDataFetched, setIsDataFetched] = useState(false);

	useEffect(() => {
		if (isDataFetched) return;

		const fetchData = async () => {
			try {
				const response = await fetch("/data/freelancejobs.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: FreelanceJob[] = await response.json();
				setFreelanceJobs(data);
				setIsDataFetched(true); // Data fetched
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, [isDataFetched]);

	useEffect(() => {
		if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
			try {
				window.adsbygoogle.push({});
			} catch (e) {
				console.error("Adsense Error:", e);
			}
		}
	}, []);

	useEffect(() => {
		// your fetch logic
	}, []);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		let excerpt = firstSection?.text || "";
		return excerpt.length > 200 ? `${excerpt.substring(0, 200)}...` : excerpt;
	};

	const currentPosts = freelanceJobs.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	return (
		<div className='page-container'>
			{/* SEO Metadata with Helmet */}
			<Helmet>
				<title>Freelance Jobs & Opportunities | Earn Money Online</title>
				<meta
					name='description'
					content='Discover top freelance jobs and online work opportunities. Explore remote work, side gigs, and contract jobs to increase your income.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/extra-income/freelancers'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Freelance Jobs & Opportunities",
						url: "https://www.dollarsandlife.com/extra-income/freelancers",
						description:
							"Discover top freelance jobs and online work opportunities. Explore remote work, side gigs, and contract jobs to increase your income.",
						publisher: {
							"@type": "Organization",
							name: "Dollars & Life",
							logo: {
								"@type": "ImageObject",
								url: "/images/favicon/favicon.webp",
							},
						},
					})}
				</script>
			</Helmet>

			<Routes>
				<Route
					path='/'
					element={
						<>
							<h1>Freelancers Opportunities</h1>

							{/* Ad Banner */}
							<div className='top-banner-container'>
								<a
									href='https://lycamobileusa.sjv.io/c/5513478/2107177/25589'
									target='_blank'
									rel='noopener noreferrer'
									className='TopBanner'
								>
									<img
										src='/images/shoppinganddeals/Lyca-Mobile-728x90.webp'
										alt='Lyca Mobile Banner - Affordable International Calling'
										className='TopBannerImage'
										loading='eager'
									/>
								</a>
							</div>

							{/* Freelance Job Listings */}
							<div className='content-wrapper'>
								{currentPosts.map((post, i) => (
									<React.Fragment key={post.id}>
										<div className='row-container'>
											<Link to={`/extra-income/freelancers/${post.id}`}>
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
										{/* Insert AdSense ad after every two posts */}
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
								))}
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
								totalItems={freelanceJobs.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</>
					}
				/>
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='freelancejobs.json' />}
				/>
			</Routes>
		</div>
	);
};

export default FreelanceJobs;
