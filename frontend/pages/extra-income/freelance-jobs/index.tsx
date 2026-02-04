"use client";
import { GetServerSideProps } from "next";
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import BlogPostCard from "../../../src/components/articles-postcards/BlogPostCard";
import PaginationContainer from "../../../src/components/pagination/PaginationContainer";

// Assuming FreelanceJob is structurally similar to BlogPost for BlogPostCard usage
interface FreelanceJob {
	// Or BlogPost, if that's the actual type from API
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

interface FreelanceJobsPageProps {
	initialFreelanceJobs?: FreelanceJob[];
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/freelance-jobs`,
		);
		if (!response.ok) {
			console.error(
				`SSR Error fetching freelance jobs list: ${response.status}`,
			);
			return {
				props: {
					initialFreelanceJobs: [],
					error: "Failed to load jobs from server.",
				},
			};
		}
		const initialFreelanceJobsData = await response.json();
		const initialFreelanceJobs: FreelanceJob[] = Array.isArray(
			initialFreelanceJobsData,
		)
			? initialFreelanceJobsData
			: initialFreelanceJobsData
			? [initialFreelanceJobsData]
			: [];
		return { props: { initialFreelanceJobs } };
	} catch (error) {
		console.error("SSR Exception fetching freelance jobs list:", error);
		return {
			props: {
				initialFreelanceJobs: [],
				error: "Server exception when loading jobs.",
			},
		};
	}
};

const FreelanceJobs: React.FC<FreelanceJobsPageProps> = ({
	initialFreelanceJobs,
	error: ssrError,
}) => {
	const [freelanceJobs, setFreelanceJobs] = useState<FreelanceJob[]>(
		initialFreelanceJobs || [],
	);
	const [loading, setLoading] = useState<boolean>(!initialFreelanceJobs);
	const [clientError, setClientError] = useState<string | null>(
		ssrError || null,
	);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	const fetchClientSideFreelanceJobs = useCallback(async () => {
		setLoading(true);
		setClientError(null);
		try {
			const apiUrl = `${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/freelance-jobs`;
			const response = await fetch(apiUrl);
			if (!response.ok)
				throw new Error("Failed to fetch freelance jobs (client-side)");
			const data: FreelanceJob[] = await response.json();
			setFreelanceJobs(data);
		} catch (error) {
			console.error("Error fetching freelance jobs (client-side):", error);
			setClientError(
				error instanceof Error
					? error.message
					: "Failed to load jobs client-side.",
			);
			if (!initialFreelanceJobs || initialFreelanceJobs.length === 0)
				setFreelanceJobs([]);
		} finally {
			setLoading(false);
		}
	}, [initialFreelanceJobs]);

	useEffect(() => {
		if (initialFreelanceJobs && initialFreelanceJobs.length > 0) {
			setFreelanceJobs(initialFreelanceJobs);
			setLoading(false);
			setClientError(null);
		} else if (ssrError) {
			setLoading(false);
		} else if (freelanceJobs.length === 0) {
			fetchClientSideFreelanceJobs();
		}
	}, [
		initialFreelanceJobs,
		ssrError,
		freelanceJobs.length,
		fetchClientSideFreelanceJobs,
	]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		const excerpt = firstSection?.text || "";
		return excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt;
	};

	const currentPosts = freelanceJobs.slice(
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
			<Head>
				<title>Freelance Jobs - Find Your Next Gig</title>
				<meta
					name='description'
					content='Explore a variety of freelance jobs and opportunities. Find your next gig in writing, design, development, and more.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/extra-income/freelance-jobs/'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: freelanceJobs.map((post, index) => ({
							"@type": "Article",
							position: index + 1,
							headline: post.headline,
							image: post.image.url,
							author: { "@type": "Organization", name: post.author.name },
							datePublished: post.datePublished,
							url: `https://www.dollarsandlife.com/extra-income/freelance-jobs/${post.id}`,
						})),
					})}
				</script>
			</Head>

			{/* Routing refactored to list view here, detail view in freelance-jobs-[id].tsx */}
			{loading && (
				<p className='sd-loading-indicator'>Loading freelance jobs...</p>
			)}
			{clientError && (
				<p className='sd-error-indicator'>Error loading jobs: {clientError}</p>
			)}
			{!loading && !clientError && (
				<>
					<h1>Freelance Jobs</h1>
					<div className='content-wrapper'>
						{currentPosts.map((post) => {
							const href = `/extra-income/freelance-jobs/${post.id}`;
							return (
								<BlogPostCard
									key={post.id}
									id={post.id}
									headline={post.headline}
									image={post.image}
									content={getExcerpt(post.content)}
									author={post.author}
									datePublished={post.datePublished}
									dateModified={post.dateModified}
									href={href}
								/>
							);
						})}
					</div>
					{freelanceJobs.length > postsPerPage && (
						<PaginationContainer
							totalItems={freelanceJobs.length}
							itemsPerPage={postsPerPage}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					)}
					{currentPosts.length === 0 && (
						<p>No freelance jobs found at the moment.</p>
					)}
				</>
			)}
		</div>
	);
};

export default FreelanceJobs;
