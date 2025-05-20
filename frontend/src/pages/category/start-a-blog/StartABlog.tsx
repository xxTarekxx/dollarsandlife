import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import PaginationContainer from "../../../components/PaginationContainer";
import "../extra-income/CommonStyles.css";

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
	const postsPerPage = 9;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					`${process.env.REACT_APP_API_BASE}/start-blog`,
				);
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: BlogPost[] = await response.json();
				setBlogPosts(data);
			} catch (error) {
				console.error("Error fetching blog posts:", error);
			}
		};
		if (blogPosts.length === 0) fetchData();
	}, [blogPosts.length]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		let excerpt = firstSection?.text || "";
		return excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt;
	};

	const currentPosts = blogPosts.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	return (
		<div className='page-container'>
			<Helmet>
				<title>How to Start a Blog in 2025 Step-by-Step Guide</title>
				<meta
					name='description'
					content='Learn how to start a successful blog in 2025 with our step-by-step guide. Discover the best blogging platforms, tools, and strategies for monetization.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/extra-income/start-a-blog'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: blogPosts.map((post, index) => ({
							"@type": "Article",
							position: index + 1,
							headline: post.headline,
							image: post.image.url,
							author: { "@type": "Organization", name: post.author.name },
							datePublished: post.datePublished,
							url: `https://www.dollarsandlife.com/extra-income/start-a-blog/${post.id}`,
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

							<div className='content-wrapper'>
								{currentPosts.map((post) => (
									<BlogPostCard
										key={post.id}
										id={post.id}
										headline={post.headline}
										image={post.image}
										content={getExcerpt(post.content)}
										author={post.author}
										datePublished={post.datePublished}
										dateModified={post.dateModified}
										canonicalUrl={`https://www.dollarsandlife.com/extra-income/start-a-blog/${post.id}`}
										linkTo={`/start-a-blog/${post.id}`}
									/>
								))}
							</div>

							<PaginationContainer
								totalItems={blogPosts.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</>
					}
				/>
				<Route path=':id' element={<BlogPostContent jsonFile='start-blog' />} />
			</Routes>
		</div>
	);
};

export default StartABlog;
