import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async"; // For SEO
import { Link, Route, Routes, useLocation } from "react-router-dom";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "./CommonStyles.css";

interface BlogPost {
	id: string;
	title: string;
	imageUrl: string;
	content: { text: string }[];
	author: string;
	datePosted: string;
}

const Budget: React.FC = () => {
	const [budgetPosts, setBudgetPosts] = useState<BlogPost[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);
	const location = useLocation();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/budgetdata.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: BlogPost[] = await response.json();
				setBudgetPosts(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	// Remove auto-scrolling
	useEffect(() => {}, [currentPage]);

	useEffect(() => {
		const updateTitle = () => {
			const pathSegments = location.pathname.split("/");
			const postId = pathSegments[pathSegments.length - 1];
			if (postId && postId !== "budget") {
				const post = budgetPosts.find((post) => post.id === postId);
				if (post) {
					document.title = post.title;
				}
			} else {
				document.title = "Budget Guides - Smart Financial Planning";
			}
		};

		updateTitle();
	}, [budgetPosts, location.pathname]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		let excerpt = firstSection?.text || "";
		return excerpt.length > 200 ? `${excerpt.substring(0, 200)}...` : excerpt;
	};

	const currentPosts = budgetPosts.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	return (
		<div className='page-container' ref={pageRef}>
			{/* SEO Meta & Structured Data */}
			<Helmet>
				<title>Budget Guides - Smart Financial Planning</title>
				<meta
					name='description'
					content='Discover expert budgeting tips, financial planning strategies, and money-saving techniques. Manage your finances smarter with our guides!'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/Extra-Income/Budget/'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: budgetPosts.map((post, index) => ({
							"@type": "Article",
							position: index + 1,
							headline: post.title,
							image: post.imageUrl,
							author: { "@type": "Person", name: post.author },
							datePublished: post.datePosted,
							url: `https://www.dollarsandlife.com/Extra-Income/Budget/${post.id}`,
						})),
					})}
				</script>
			</Helmet>

			<Routes>
				<Route
					path='/'
					element={
						<>
							<h1>Budget Guides</h1>

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
												to={`/Extra-Income/Budget/${post.id}`}
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
										{/* Insert ad after every two posts */}
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

							<div className='postings-container'>
								<ins
									className='adsbygoogle'
									style={{
										display: "block",
										width: "728px",
										height: "90px",
										minWidth: "728px",
										minHeight: "90px",
									}}
									data-ad-client='ca-pub-1079721341426198'
									data-ad-slot='6375155907'
									data-ad-format='horizontal'
									data-full-width-responsive='true'
								/>
							</div>

							<PaginationContainer
								totalItems={budgetPosts.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</>
					}
				/>
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='budgetdata.json' />}
				/>
			</Routes>
		</div>
	);
};

export default Budget;
