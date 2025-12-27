"use client";
import { GetServerSideProps } from "next"; // Added
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react"; // Added useCallback
import BlogPostCard from "../../src/components/articles-postcards/BlogPostCard";
import PaginationContainer from "../../src/components/pagination/PaginationContainer";

interface BlogPost {
	// Ensure this interface matches the structure of your posts
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

interface StartABlogPageProps {
	initialBlogPosts?: BlogPost[];
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/start-blog`,
		);
		if (!response.ok) {
			console.error(
				`SSR Error fetching start-a-blog posts list: ${response.status}`,
			);
			return {
				props: {
					initialBlogPosts: [],
					error: "Failed to load posts from server.",
				},
			};
		}
		const initialBlogPostsData = await response.json();
		const initialBlogPosts: BlogPost[] = Array.isArray(initialBlogPostsData)
			? initialBlogPostsData
			: initialBlogPostsData
				? [initialBlogPostsData]
				: [];
		return { props: { initialBlogPosts } };
	} catch (error) {
		console.error("SSR Exception fetching start-a-blog posts list:", error);
		return {
			props: {
				initialBlogPosts: [],
				error: "Server exception when loading posts.",
			},
		};
	}
};

const StartABlog: React.FC<StartABlogPageProps> = ({
	initialBlogPosts,
	error: ssrError,
}) => {
	const [blogPosts, setBlogPosts] = useState<BlogPost[]>(
		initialBlogPosts || [],
	);
	const [loading, setLoading] = useState<boolean>(!initialBlogPosts);
	const [clientError, setClientError] = useState<string | null>(
		ssrError || null,
	);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	const fetchClientSideBlogPosts = useCallback(async () => {
		setLoading(true);
		setClientError(null);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/start-blog`,
			);
			if (!response.ok)
				throw new Error("Failed to fetch start-a-blog posts (client-side)");
			const data: BlogPost[] = await response.json();
			setBlogPosts(data);
		} catch (error) {
			console.error("Error fetching start-a-blog posts (client-side):", error);
			setClientError(
				error instanceof Error
					? error.message
					: "Failed to load posts client-side.",
			);
			if (!initialBlogPosts || initialBlogPosts.length === 0) setBlogPosts([]);
		} finally {
			setLoading(false);
		}
	}, [initialBlogPosts]);

	useEffect(() => {
		if (initialBlogPosts && initialBlogPosts.length > 0) {
			setBlogPosts(initialBlogPosts);
			setLoading(false);
			setClientError(null);
		} else if (ssrError) {
			console.error("SSR Error for StartABlog page:", ssrError);
			setLoading(false);
		} else if (blogPosts.length === 0) {
			fetchClientSideBlogPosts();
		}
	}, [initialBlogPosts, ssrError, blogPosts.length, fetchClientSideBlogPosts]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		const excerpt = firstSection?.text || "";
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
			<Head>
				<title>How to Start a Blog in 2025 Step-by-Step Guide</title>
				<meta
					name='description'
					content='Learn how to start a successful blog in 2025 with our step-by-step guide. Discover the best blogging platforms, tools, and strategies for monetization.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/start-a-blog'
				/>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "ItemList",
							itemListElement: blogPosts.map((post, index) => ({
								"@type": "Article",
								position: index + 1,
								headline: post.headline,
								image: post.image.url,
								author: { "@type": "Organization", name: post.author.name },
								datePublished: post.datePublished,
								url: `https://www.dollarsandlife.com/start-a-blog/${post.id}`,
							})),
						}),
					}}
				/>
			</Head>

			{/* Routing refactored to list view here, detail view in start-a-blog-[id].tsx */}
			{loading && <p className='sd-loading-indicator'>Loading blog posts...</p>}
			{clientError && (
				<p className='sd-error-indicator'>Error loading posts: {clientError}</p>
			)}
			{!loading && !clientError && (
				<>
					<h1>
						How to Start a Successful Blog <br /> in 2025 Step-by-Step Guide for
						Beginners
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
								href={`/start-a-blog/${post.id}`}
							/>
						))}
					</div>
					{blogPosts.length > postsPerPage && (
						<PaginationContainer
							totalItems={blogPosts.length}
							itemsPerPage={postsPerPage}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					)}
					{currentPosts.length === 0 && (
						<p>No blog posts found at the moment.</p>
					)}
				</>
			)}
		</div>
	);
};

export default StartABlog;
