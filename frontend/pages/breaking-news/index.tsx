"use client";

import Head from "next/head";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import BlogPostCard from "../../src/components/articles-postcards/BlogPostCard";
import { getClientApiBase } from "@/lib/api-base";
import PaginationContainer from "../../src/components/pagination/PaginationContainer";
import { useLangFromPath, usePageCanonical } from "@/hooks/usePageCanonical";
import { buildCanonicalUrl } from "@/lib/seo/canonical";
import { prefixLang } from "@/lib/i18n/prefixLang";
import { getListingPageTranslations } from "@/lib/i18n/listing-page-translations";

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

interface BreakingNewsProps {
	initialBreakingNews?: {
		items: BreakingNewsPost[];
		total: number;
		totalPages: number;
		page: number;
		limit: number;
	};
	error?: string;
}

const POSTS_PER_PAGE = 6;

const BreakingNews: React.FC<BreakingNewsProps> = ({
	initialBreakingNews,
	error: serverError,
}) => {
	const canonical = usePageCanonical();
	const lang = useLangFromPath();
	const copy = getListingPageTranslations(lang).breakingNews;
	const common = getListingPageTranslations(lang).common;
	const [breakingNews, setBreakingNews] = useState<BreakingNewsPost[]>(
		initialBreakingNews?.items ?? [],
	);
	const [loading, setLoading] = useState<boolean>(!initialBreakingNews);
	const [clientError, setClientError] = useState<string | null>(
		serverError ?? null,
	);
	const [currentPage, setCurrentPage] = useState(initialBreakingNews?.page ?? 1);
	const [totalItems, setTotalItems] = useState(initialBreakingNews?.total ?? 0);

	const listSchemaJson = useMemo(() => {
		if (breakingNews.length === 0) return "";
		const payload = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			name: copy.title,
			url: canonical,
			itemListElement: breakingNews.slice(0, 20).map((post, index) => ({
				"@type": "Article",
				position: index + 1,
				headline: typeof post.headline === "string" ? post.headline : "",
				image: post.image?.url ?? "",
				author: {
					"@type": "Person",
					name: typeof post.author?.name === "string" ? post.author.name : "",
				},
				datePublished:
					typeof post.datePublished === "string" ? post.datePublished : "",
				url: buildCanonicalUrl(prefixLang(`/breaking-news/${post.id ?? ""}`, lang)),
			})),
		};
		return JSON.stringify(payload).replace(/<\/script/gi, "<\\/script");
	}, [breakingNews, canonical, copy.title, lang]);

	const fetchClientSideBreakingNews = useCallback(async (page: number) => {
		setLoading(true);
		setClientError(null);
		try {
			const apiUrl = `${getClientApiBase()}/breaking-news?lang=${encodeURIComponent(lang)}&page=${page}&limit=${POSTS_PER_PAGE}`;
			const response = await fetch(apiUrl);
			if (!response.ok) {
				throw new Error("Failed to fetch breaking news (client-side)");
			}
			const data: {
				items?: BreakingNewsPost[];
				total?: number;
				page?: number;
			} = await response.json();
			setBreakingNews(Array.isArray(data.items) ? data.items : []);
			setTotalItems(typeof data.total === "number" ? data.total : 0);
			if (typeof data.page === "number" && data.page !== page) {
				setCurrentPage(data.page);
			}
		} catch (error) {
			console.error("Error fetching breaking news (client-side):", error);
			setClientError(
				error instanceof Error
					? error.message
					: "Failed to load breaking news client-side.",
			);
			setBreakingNews([]);
			setTotalItems(0);
		} finally {
			setLoading(false);
		}
	}, [lang]);

	useEffect(() => {
		if (
			initialBreakingNews &&
			!serverError &&
			currentPage === initialBreakingNews.page
		) {
			setBreakingNews(initialBreakingNews.items);
			setTotalItems(initialBreakingNews.total);
			setLoading(false);
			setClientError(null);
			return;
		}
		fetchClientSideBreakingNews(currentPage);
	}, [currentPage, fetchClientSideBreakingNews, initialBreakingNews, serverError]);

	const getExcerpt = (content: { text: string }[]): string => {
		const excerpt = content[0]?.text || "";
		return excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt;
	};

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	return (
		<div className='page-container'>
			<Head>
				<title>{copy.title}</title>
				<meta name='description' content={copy.description} />
				<link rel='canonical' href={canonical} />
				{listSchemaJson ? (
					<script
						type='application/ld+json'
						dangerouslySetInnerHTML={{ __html: listSchemaJson }}
					/>
				) : null}
				<meta property='og:title' content={copy.ogTitle} />
				<meta property='og:description' content={copy.ogDescription} />
				<meta property='og:url' content={canonical} />
				<meta property='og:type' content='website' />
				<meta property='og:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:title' content={copy.ogTitle} />
				<meta name='twitter:description' content={copy.ogDescription} />
				<meta name='twitter:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
			</Head>

			{loading && <p className='sd-loading-indicator'>{copy.loadingLabel}</p>}
			{clientError && (
				<p className='sd-error-indicator'>{copy.errorPrefix} {clientError}</p>
			)}
			{!loading && !clientError && (
				<>
					<div className='section-hero'>
						<p className='section-hero-eyebrow'>{copy.eyebrow}</p>
						<h1 className='section-hero-title'>
							{copy.headingLead} <span>{copy.headingAccent}</span>
						</h1>
						<p className='section-hero-sub'>{copy.subtitle}</p>
						{totalItems > 0 && (
							<span className='section-hero-count'>
								{totalItems} {common.articlesLabel}
							</span>
						)}
					</div>
					<div className='content-wrapper'>
						{breakingNews.map((post) => {
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
									lang={lang}
								/>
							);
						})}
					</div>

					<PaginationContainer
						totalItems={totalItems}
						itemsPerPage={POSTS_PER_PAGE}
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
					/>
				</>
			)}
		</div>
	);
};

export default BreakingNews;
