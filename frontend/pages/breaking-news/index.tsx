"use client";

import Head from "next/head";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import BlogPostCard from "../../src/components/articles-postcards/BlogPostCard";
import { getClientApiBase } from "@/lib/api-base";
import PaginationContainer from "../../src/components/pagination/PaginationContainer";
import { useLangFromPath, usePageCanonical } from "@/hooks/usePageCanonical";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { prefixLang } from "@/lib/i18n/prefixLang";

interface BreakingNewsPost {
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

const BreakingNews: React.FC = () => {
	const canonical = usePageCanonical();
	const lang = useLangFromPath();
	const [breakingNews, setBreakingNews] = useState<BreakingNewsPost[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [clientError, setClientError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	const listSchemaJson = useMemo(() => {
		if (breakingNews.length === 0) return "";
		const payload = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			name: "Breaking News",
			url: canonical,
			itemListElement: breakingNews.slice(0, 20).map((post, index) => ({
				"@type": "Article",
				position: index + 1,
				headline: typeof post.headline === "string" ? post.headline : "",
				image: post.image?.url ?? "",
				author: {
					"@type": "Person",
					name:
						typeof post.author?.name === "string" ? post.author.name : "",
				},
				datePublished:
					typeof post.datePublished === "string" ? post.datePublished : "",
				url: buildCanonicalUrl(
					prefixLang(`/breaking-news/${post.id ?? ""}`, lang),
				),
			})),
		};
		return JSON.stringify(payload).replace(/<\/script/gi, "<\\/script");
	}, [breakingNews, canonical, lang]);

	const fetchClientSideBreakingNews = useCallback(async () => {
		setLoading(true);
		setClientError(null);
		try {
			const apiUrl = `${getClientApiBase()}/breaking-news`;
			const response = await fetch(apiUrl);
			if (!response.ok)
				throw new Error("Failed to fetch breaking news (client-side)");
			const data: BreakingNewsPost[] = await response.json();
			setBreakingNews(data);
		} catch (error) {
			console.error("Error fetching breaking news (client-side):", error);
			setClientError(
				error instanceof Error
					? error.message
					: "Failed to load breaking news client-side.",
			);
			setBreakingNews([]);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchClientSideBreakingNews();
	}, [fetchClientSideBreakingNews]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		const excerpt = firstSection?.text || "";
		return excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt;
	};

	const currentPosts = breakingNews.slice(
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
				<title>Breaking News - Latest Financial and Economic Updates</title>
				<meta
					name='description'
					content='Stay updated with the latest financial, business, and economic breaking news. Get insights, analysis, and top trending stories.'
				/>
				<link rel='canonical' href={canonical} />
				{listSchemaJson ? (
					<script
						type='application/ld+json'
						dangerouslySetInnerHTML={{ __html: listSchemaJson }}
					/>
				) : null}
				<meta property='og:title' content='Breaking News - Latest Financial and Economic Updates' />
				<meta
					property='og:description'
					content='Stay updated with the latest financial, business, and economic breaking news. Get insights, analysis, and top trending stories.'
				/>
				<meta property='og:url' content={canonical} />
				<meta property='og:type' content='website' />
				<meta property='og:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:title' content='Breaking News - Latest Financial and Economic Updates' />
				<meta
					name='twitter:description'
					content='Stay updated with the latest financial, business, and economic breaking news. Get insights, analysis, and top trending stories.'
				/>
				<meta name='twitter:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
			</Head>

			{loading && (
				<p className='sd-loading-indicator'>Loading breaking news...</p>
			)}
			{clientError && (
				<p className='sd-error-indicator'>Error loading news: {clientError}</p>
			)}
			{!loading && !clientError && (
				<>
					<div className='section-hero'>
						<p className='section-hero-eyebrow'>Latest News</p>
						<h1 className='section-hero-title'>
							Breaking <span>News</span>
						</h1>
						<p className='section-hero-sub'>
							Stay updated with the latest financial, business, and economic
							news — real-time insights on the stories that matter most.
						</p>
						{breakingNews.length > 0 && (
							<span className='section-hero-count'>{breakingNews.length} articles</span>
						)}
					</div>
					<div className='content-wrapper'>
						{currentPosts.map((post) => {
							const href = prefixLang(`/breaking-news/${post.id}`, lang);
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

					<PaginationContainer
						totalItems={breakingNews.length}
						itemsPerPage={postsPerPage}
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
					/>
				</>
			)}
		</div>
	);
};

export default BreakingNews;
