"use client";
import { GetServerSideProps } from "next"; // Added
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react"; // Added useCallback
import BlogPostCard from "../../../src/components/articles-postcards/BlogPostCard";
import PaginationContainer from "../../../src/components/pagination/PaginationContainer";

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

interface BudgetPageProps {
	initialBudgetPosts?: BlogPost[];
	error?: string; // Renamed to ssrError in component props
}

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/budget-data`,
		);
		if (!response.ok) {
			console.error(`SSR Error fetching budget posts list: ${response.status}`);
			return {
				props: {
					initialBudgetPosts: [],
					error: "Failed to load posts from server.",
				},
			};
		}
		const initialBudgetPostsData = await response.json();
		const initialBudgetPosts: BlogPost[] = Array.isArray(initialBudgetPostsData)
			? initialBudgetPostsData
			: initialBudgetPostsData
			? [initialBudgetPostsData]
			: [];
		return { props: { initialBudgetPosts } };
	} catch (error) {
		console.error("SSR Exception fetching budget posts list:", error);
		return {
			props: {
				initialBudgetPosts: [],
				error: "Server exception when loading posts.",
			},
		};
	}
};

const Budget: React.FC<BudgetPageProps> = ({
	initialBudgetPosts,
	error: ssrError,
}) => {
	const [budgetPosts, setBudgetPosts] = useState<BlogPost[]>(
		initialBudgetPosts || [],
	);
	const [loading, setLoading] = useState<boolean>(!initialBudgetPosts); // Added loading state
	const [clientError, setClientError] = useState<string | null>(
		ssrError || null,
	); // Added clientError state, initialized with ssrError
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	const fetchClientSideBudgetPosts = useCallback(async () => {
		setLoading(true);
		setClientError(null);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/budget-data`,
			);
			if (!response.ok)
				throw new Error("Failed to fetch budget data (client-side)");
			const data: BlogPost[] = await response.json();
			setBudgetPosts(data);
		} catch (error) {
			console.error("Error fetching budget posts (client-side):", error);
			setClientError(
				error instanceof Error
					? error.message
					: "Failed to load posts client-side.",
			);
			if (!initialBudgetPosts || initialBudgetPosts.length === 0)
				setBudgetPosts([]);
		} finally {
			setLoading(false);
		}
	}, [initialBudgetPosts]);

	useEffect(() => {
		if (initialBudgetPosts && initialBudgetPosts.length > 0) {
			setBudgetPosts(initialBudgetPosts);
			setLoading(false);
			setClientError(null);
		} else if (ssrError) {
			console.error("SSR Error for Budget page:", ssrError);
			// clientError is already set from ssrError
			setLoading(false);
			// Optionally, trigger client-side fetch as fallback or show error
			// if (budgetPosts.length === 0) fetchClientSideBudgetPosts(); // Example: fallback
		} else if (budgetPosts.length === 0) {
			// No initial posts, no SSR error, and no local posts yet
			fetchClientSideBudgetPosts();
		}
	}, [
		initialBudgetPosts,
		ssrError,
		budgetPosts.length,
		fetchClientSideBudgetPosts,
	]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		const excerpt = firstSection?.text || "";
		return excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt;
	};

	const currentPosts = budgetPosts.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	return (
		<div className='page-container'>
			<Head>
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
							author: { "@type": "Organization", name: post.author.name },
							datePublished: post.datePublished,
							url: `https://www.dollarsandlife.com/extra-income/budget/${post.id}`,
						})),
					})}
				</script>
			</Head>

			{/* Routing refactored to list view here, detail view in budget-[id].tsx */}
			{loading && (
				<p className='sd-loading-indicator'>Loading budget posts...</p>
			)}
			{clientError && (
				<p className='sd-error-indicator'>Error loading posts: {clientError}</p>
			)}
			{!loading && !clientError && (
				<>
					<h1>Budget Guides</h1>
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
								href={`/extra-income/budget/${post.id}`}
							/>
						))}
					</div>
					{budgetPosts.length > postsPerPage && (
						<PaginationContainer
							totalItems={budgetPosts.length}
							itemsPerPage={postsPerPage}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					)}
					{currentPosts.length === 0 && (
						<p>No budget posts found at the moment.</p>
					)}
				</>
			)}
		</div>
	);
};

export default Budget;
