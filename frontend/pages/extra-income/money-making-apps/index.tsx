"use client";
import { GetServerSideProps } from "next"; // Added
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react"; // Added useCallback
import BlogPostCard from "../../../src/components/articles-postcards/BlogPostCard";
import PaginationContainer from "../../../src/components/pagination/PaginationContainer";

// Assuming MoneyMakingApp is structurally similar to BlogPost for BlogPostCard usage
interface MoneyMakingApp {
	// Or BlogPost, if that's the actual type from API
	id: string;
	headline: string;
	image: {
		url: string;
		caption: string;
	};
	content?: { text: string }[];
	author: {
		name: string;
	};
	datePublished: string;
	dateModified?: string;
}

interface MoneyMakingAppsPageProps {
	initialApps?: MoneyMakingApp[];
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/money-making-apps`,
		);
		if (!response.ok) {
			console.error(
				`SSR Error fetching money making apps list: ${response.status}`,
			);
			return {
				props: { initialApps: [], error: "Failed to load apps from server." },
			};
		}
		const initialAppsData = await response.json();
		const initialApps: MoneyMakingApp[] = Array.isArray(initialAppsData)
			? initialAppsData
			: initialAppsData
			? [initialAppsData]
			: [];
		return { props: { initialApps } };
	} catch (error) {
		console.error("SSR Exception fetching money making apps list:", error);
		return {
			props: { initialApps: [], error: "Server exception when loading apps." },
		};
	}
};

const MoneyMakingApps: React.FC<MoneyMakingAppsPageProps> = ({
	initialApps,
	error: ssrError,
}) => {
	const [apps, setApps] = useState<MoneyMakingApp[]>(initialApps || []);
	const [loading, setLoading] = useState<boolean>(!initialApps);
	const [clientError, setClientError] = useState<string | null>(
		ssrError || null,
	);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	const fetchClientSideApps = useCallback(async () => {
		setLoading(true);
		setClientError(null);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/money-making-apps`,
			);
			if (!response.ok)
				throw new Error("Failed to fetch money making apps (client-side)");
			const data: MoneyMakingApp[] = await response.json();
			setApps(data);
		} catch (error) {
			console.error("Error fetching money making apps (client-side):", error);
			setClientError(
				error instanceof Error
					? error.message
					: "Failed to load apps client-side.",
			);
			if (!initialApps || initialApps.length === 0) setApps([]);
		} finally {
			setLoading(false);
		}
	}, [initialApps]);

	useEffect(() => {
		if (initialApps && initialApps.length > 0) {
			setApps(initialApps);
			setLoading(false);
			setClientError(null);
		} else if (ssrError) {
			setLoading(false);
		} else if (apps.length === 0) {
			fetchClientSideApps();
		}
	}, [initialApps, ssrError, apps.length, fetchClientSideApps]);

	const getExcerpt = (content?: { text: string }[]): string => {
		if (!content || content.length === 0) return "";
		const firstSection = content[0]?.text || "";
		return firstSection.length > 120
			? `${firstSection.substring(0, 120)}...`
			: firstSection;
	};

	const currentPosts = apps.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	return (
		<div className='page-container'>
			<Head>
				<title>Money Making Apps - Earn on the Go</title>
				<meta
					name='description'
					content='Discover the best money-making apps to earn cash, gift cards, and rewards from your smartphone.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/extra-income/money-making-apps'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: apps.map((post, index) => ({
							"@type": "Article",
							position: index + 1,
							headline: post.headline,
							image: post.image.url,
							author: { "@type": "Organization", name: post.author.name },
							datePublished: post.datePublished,
							url: `https://www.dollarsandlife.com/extra-income/money-making-apps/${post.id}`,
						})),
					})}
				</script>
			</Head>

			{/* Routing refactored to list view here, detail view in money-making-apps-[id].tsx */}
			{loading && <p className='sd-loading-indicator'>Loading apps...</p>}
			{clientError && (
				<p className='sd-error-indicator'>Error loading apps: {clientError}</p>
			)}
			{!loading && !clientError && (
				<>
					<h1>Money Making Apps</h1>
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
								href={`/extra-income/money-making-apps/${post.id}`}
							/>
						))}
					</div>
					{apps.length > postsPerPage && (
						<PaginationContainer
							totalItems={apps.length}
							itemsPerPage={postsPerPage}
							currentPage={currentPage}
							setCurrentPage={setCurrentPage}
						/>
					)}
					{currentPosts.length === 0 && (
						<p>No money making apps found at the moment.</p>
					)}
				</>
			)}
		</div>
	);
};

export default MoneyMakingApps;
