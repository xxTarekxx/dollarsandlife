import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Route, Routes } from "react-router-dom";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "./CommonStyles.css";

interface RemoteJob {
	id: string;
	title: string;
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

const RemoteOnlineJobs: React.FC = () => {
	const [remoteJobs, setRemoteJobs] = useState<RemoteJob[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/remotejobs.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: RemoteJob[] = await response.json();
				setRemoteJobs(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		let excerpt = firstSection?.text || "";
		return excerpt.length > 200 ? `${excerpt.substring(0, 200)}...` : excerpt;
	};

	const currentPosts = remoteJobs.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	return (
		<div className='page-container'>
			{/* SEO Metadata with Helmet */}
			<Helmet>
				<title>Remote Online Jobs | Work from Home & Freelance Gigs</title>
				<meta
					name='description'
					content='Find the best remote jobs, freelance gigs, and online work opportunities. Work from home and earn a stable income in 2024.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/Extra-Income/Remote-Jobs'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Remote Online Jobs - Work from Home & Freelance Gigs",
						url: "https://www.dollarsandlife.com/Extra-Income/Remote-Jobs",
						description:
							"Find the best remote jobs, freelance gigs, and online work opportunities. Work from home and earn a stable income in 2024.",
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
							<h1>Remote Online Jobs</h1>

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

							{/* Remote Jobs Listings */}
							<div className='content-wrapper'>
								{currentPosts.map((post, i) => (
									<React.Fragment key={post.id}>
										<div className='row-container'>
											<Link to={`/Extra-Income/Remote-Jobs/${post.id}`}>
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
												<script
													dangerouslySetInnerHTML={{
														__html:
															"(adsbygoogle = window.adsbygoogle || []).push({});",
													}}
												/>
											</div>
										)}
									</React.Fragment>
								))}
							</div>

							{/* Pagination */}
							<PaginationContainer
								totalItems={remoteJobs.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>

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
							<script
								dangerouslySetInnerHTML={{
									__html: "(adsbygoogle = window.adsbygoogle || []).push({});",
								}}
							/>
						</>
					}
				/>
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='remotejobs.json' />}
				/>
			</Routes>
		</div>
	);
};

export default RemoteOnlineJobs;
