import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async"; // For SEO
import { Link, Route, Routes } from "react-router-dom";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "../Extra-Income/CommonStyles.css";

interface BlogPost {
	id: string;
	title: string;
	imageUrl: string;
	content: { text: string }[];
	author: string;
	datePosted: string;
}

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

const StartABlog: React.FC = () => {
	const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/startablogdata.json");
				if (!response.ok)
					throw new Error(`Failed to fetch data: ${response.statusText}`);
				const data: BlogPost[] = await response.json();
				if (Array.isArray(data)) setBlogPosts(data);
				else console.error("Invalid data format: Expected an array.");
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

	const currentPosts = blogPosts.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	return (
		<div className='page-container' ref={pageRef}>
			{/* SEO Metadata & Structured Data */}
			<Helmet>
				<title>How to Start a Blog in 2025 Step-by-Step Guide</title>
				<meta
					name='description'
					content='Learn how to start a successful blog in 2025 with our step-by-step guide. Discover the best blogging platforms, tools, and strategies for monetization.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/Start-A-Blog'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: blogPosts.map((post, index) => ({
							"@type": "Article",
							position: index + 1,
							headline: post.title,
							image: post.imageUrl,
							author: { "@type": "Person", name: post.author },
							datePublished: post.datePosted,
							url: `https://www.dollarsandlife.com/Start-A-Blog/${post.id}`,
						})),
					})}
				</script>
			</Helmet>

			<Routes>
				<Route
					path='/'
					element={
						<>
							<h1 className='title-heading'>
								How to Start a Successful Blog <br /> in 2025 Step-by-Step Guide
								for Beginners
							</h1>

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
									/>
								</a>
							</div>

							<div className='content-wrapper'>
								{currentPosts.map((post, i) => (
									<React.Fragment key={post.id}>
										<div className='row-container'>
											<Link
												to={`/Start-A-Blog/${post.id}`}
												aria-label={`Read more about ${post.title}`}
											>
												<BlogPostCard
													id={post.id}
													title={post.title}
													imageUrl={post.imageUrl}
													content={getExcerpt(post.content)}
													author={post.author}
													datePosted={post.datePosted}
												/>
											</Link>
										</div>
										{i > 0 && i % 2 === 1 && (
											<div className='postings-container'>
												<ins
													className='adsbygoogle'
													style={{
														display: "block",
														width: "300px",
														height: "250px",
														minWidth: "300px",
														minHeight: "250px",
													}}
													data-ad-client='ca-pub-1079721341426198'
													data-ad-slot='7197282987'
													data-ad-format='auto'
													data-full-width-responsive='true'
												/>
											</div>
										)}
									</React.Fragment>
								))}
							</div>

							<PaginationContainer
								totalItems={blogPosts.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>

							<div className='postings-container'>
								<ins
									className='adsbygoogle-banner'
									style={{
										display: "block",
										width: "728px",
										height: "90px",
										minWidth: "300px",
										minHeight: "90px",
									}}
									data-ad-client='ca-pub-1079721341426198'
									data-ad-slot='6375155907'
									data-ad-format='horizontal'
									data-full-width-responsive='true'
								/>
							</div>
						</>
					}
				/>
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='startablogdata.json' />}
				/>
			</Routes>
		</div>
	);
};

export default StartABlog;
