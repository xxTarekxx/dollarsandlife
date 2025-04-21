import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, Route, Routes } from "react-router-dom";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import PaginationContainer from "../../../components/PaginationContainer";
import "../extra-income/CommonStyles.css"; // Ensure CSS for .content-wrapper grid is here or imported
import "../../../components/BlogPostContent.css"; // Keep if used by BlogPostCard/Content

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

const StartABlog: React.FC = () => {
	const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9; // Adjusted to potentially fit 3x3 grid better
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/startablogdata.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: BlogPost[] = await response.json();
				setBlogPosts(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		if (blogPosts.length === 0) fetchData();
	}, [blogPosts.length]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		let excerpt = firstSection?.text || "";
		// Using a potentially shorter excerpt for card view
		return excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt;
	};

	const currentPosts = blogPosts.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	useEffect(() => {
		if (pageRef.current) {
			window.scrollTo({
				top: 0,
				behavior: "smooth",
			});
		}
	}, [currentPage]);

	return (
		<div className='page-container' ref={pageRef}>
			<Helmet>
				<title>How to Start a Blog in 2025 Step-by-Step Guide</title>
				<meta
					name='description'
					content='Learn how to start a successful blog in 2025 with our step-by-step guide. Discover the best blogging platforms, tools, and strategies for monetization.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/start-a-blog'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: blogPosts.map((post, index) => ({
							"@type": "Article",
							position: index + 1,
							headline: post.headline,
							image: post.image, // Assuming image object is suitable for schema
							author: { "@type": "Person", name: post.author.name }, // Corrected author schema
							datePublished: post.datePublished,
							url: `https://www.dollarsandlife.com/start-a-blog/${post.id}`,
						})),
					})}
				</script>
			</Helmet>

			<Routes>
				<Route
					path='/'
					element={
						<>
							<h1>
								How to Start a Successful Blog <br /> in 2025 Step-by-Step Guide
								for Beginners
							</h1>

							<div className='top-banner-container'>
								{/* Content other than ads can go here if needed */}
							</div>

							<div className='content-wrapper'>
								{currentPosts.map((post) => (
									<Link
										key={post.id}
										to={`/start-a-blog/${post.id}`}
										aria-label={`Read more about ${post.headline}`}
										style={{ textDecoration: "none", display: "block" }}
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
								))}
							</div>

							<PaginationContainer
								totalItems={blogPosts.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>

							{/* Removed Bottom Banner Ad Container */}
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
