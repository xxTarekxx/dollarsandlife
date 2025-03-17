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

const Budget: React.FC = () => {
	const [budgetPosts, setBudgetPosts] = useState<BlogPost[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);
	const location = useLocation();
	const [isDataFetched, setIsDataFetched] = useState(false);

	// Fetch data only once
	useEffect(() => {
		if (isDataFetched) return; // Prevent re-fetching the data

		const fetchData = async () => {
			try {
				const response = await fetch("/data/budgetdata.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: BlogPost[] = await response.json();
				setBudgetPosts(data);
				setIsDataFetched(true); // Data fetched
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, [isDataFetched]); // Runs only once when the data isn't fetched

	// Function to get the excerpt of the first section of content
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
					href='https://www.dollarsandlife.com/extra-income/budget/'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: budgetPosts.map((post, index) => ({
							"@type": "Article",
							position: index + 1,
							headline: post.headline,
							image: post.image.url,
							author: { "@type": "Person", name: post.author.name },
							datePublished: post.datePublished,
							url: `https://www.dollarsandlife.com/extra-income/budget/${post.id}`,
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
												to={`/extra-income/budget/${post.id}`}
												aria-label={`Read more about ${post.headline}`}
											>
												<BlogPostCard
													id={post.id}
													headline={post.headline}
													image={post.image}
													content={getExcerpt(post.content)}
													author={post.author}
													datePublished={post.datePublished}
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
