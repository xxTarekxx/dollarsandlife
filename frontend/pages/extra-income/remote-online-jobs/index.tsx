"use client";
import { GetServerSideProps } from "next"; // Added
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react"; // Added useCallback
import BlogPostCard from "../../../src/components/articles-postcards/BlogPostCard";
import PaginationContainer from "../../../src/components/pagination/PaginationContainer";

// Assuming RemoteJob is structurally similar to BlogPost for BlogPostCard usage
interface RemoteJob {
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

interface RemoteOnlineJobsPageProps {
	initialRemoteJobs?: RemoteJob[];
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/remote-jobs`,
		);
		if (!response.ok) {
			console.error(`SSR Error fetching remote jobs list: ${response.status}`);
			return {
				props: {
					initialRemoteJobs: [],
					error: "Failed to load jobs from server.",
				},
			};
		}
		const initialRemoteJobsData = await response.json();
		const initialRemoteJobs: RemoteJob[] = Array.isArray(initialRemoteJobsData)
			? initialRemoteJobsData
			: initialRemoteJobsData
			? [initialRemoteJobsData]
			: [];
		return { props: { initialRemoteJobs } };
	} catch (error) {
		console.error("SSR Exception fetching remote jobs list:", error);
		return {
			props: {
				initialRemoteJobs: [],
				error: "Server exception when loading jobs.",
			},
		};
	}
};

const RemoteOnlineJobs: React.FC<RemoteOnlineJobsPageProps> = ({
	initialRemoteJobs,
	error: ssrError,
}) => {
	const [remoteJobs, setRemoteJobs] = useState<RemoteJob[]>(
		initialRemoteJobs || [],
	);
	const [loading, setLoading] = useState<boolean>(!initialRemoteJobs);
	const [clientError, setClientError] = useState<string | null>(
		ssrError || null,
	);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	const fetchClientSideRemoteJobs = useCallback(async () => {
		setLoading(true);
		setClientError(null);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/remote-jobs`,
			);
			if (!response.ok)
				throw new Error("Failed to fetch remote jobs (client-side)");
			const data: RemoteJob[] = await response.json();
			setRemoteJobs(data);
		} catch (error) {
			console.error("Error fetching remote jobs (client-side):", error);
			setClientError(
				error instanceof Error
					? error.message
					: "Failed to load jobs client-side.",
			);
			if (!initialRemoteJobs || initialRemoteJobs.length === 0)
				setRemoteJobs([]);
		} finally {
			setLoading(false);
		}
	}, [initialRemoteJobs]);

	useEffect(() => {
		if (initialRemoteJobs && initialRemoteJobs.length > 0) {
			setRemoteJobs(initialRemoteJobs);
			setLoading(false);
			setClientError(null);
		} else if (ssrError) {
			console.error("SSR Error for RemoteOnlineJobs page:", ssrError);
			setLoading(false);
		} else if (remoteJobs.length === 0) {
			fetchClientSideRemoteJobs();
		}
	}, [
		initialRemoteJobs,
		ssrError,
		remoteJobs.length,
		fetchClientSideRemoteJobs,
	]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		const excerpt = firstSection?.text || "";
		return excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt;
	};

	const currentPosts = remoteJobs.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	return (
		<div className='page-container'>
			<Head>
				<title>Remote & Online Jobs - Work From Anywhere</title>
				<meta
					name='description'
					content='Find the best remote and online jobs. Explore opportunities in customer service, data entry, virtual assistance, and more.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/extra-income/remote-online-jobs'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: remoteJobs.map((post, index) => ({
							"@type": "Article",
							position: index + 1,
							headline: post.headline,
							image: post.image.url,
							author: { "@type": "Organization", name: post.author.name },
							datePublished: post.datePublished,
							url: `https://www.dollarsandlife.com/extra-income/remote-online-jobs/${post.id}`,
						})),
					})}
				</script>
			</Head>

			{/* Routing refactored to list view here, detail view in remote-online-jobs-[id].tsx */}
			{loading && (
				<p className='sd-loading-indicator'>Loading remote jobs...</p>
			)}
			{clientError && (
				<p className='sd-error-indicator'>Error loading jobs: {clientError}</p>
			)}
			{!loading && !clientError && (
				<>
					<h1>Remote & Online Jobs</h1>
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
								href={`/extra-income/remote-online-jobs/${post.id}`}
							/>
						))}
					</div>
					{remoteJobs.length > postsPerPage && (
						<PaginationContainer
							totalItems={remoteJobs.length}
							itemsPerPage={postsPerPage}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					)}
					{currentPosts.length === 0 && (
						<p>No remote jobs found at the moment.</p>
					)}
				</>
			)}
		</div>
	);
};

export default RemoteOnlineJobs;
