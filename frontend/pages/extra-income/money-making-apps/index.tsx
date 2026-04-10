"use client";
import "../CommonStyles.css";
import Head from "next/head";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import BlogPostCard from "../../../src/components/articles-postcards/BlogPostCard";
import PaginationContainer from "../../../src/components/pagination/PaginationContainer";
import { useLangFromPath, usePageCanonical } from "@/hooks/usePageCanonical";
import { prefixLang } from "@/lib/i18n/prefixLang";
import { getClientApiBase } from "@/lib/api-base";
import { getListingPageTranslations } from "@/lib/i18n/listing-page-translations";

interface MoneyMakingApp {
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

const MoneyMakingApps: React.FC<MoneyMakingAppsPageProps> = ({
	initialApps,
	error: ssrError,
}) => {
	const lang = useLangFromPath();
	const canonical = usePageCanonical();
	const copy = getListingPageTranslations(lang).moneyMakingApps;
	const common = getListingPageTranslations(lang).common;
	const [apps, setApps] = useState<MoneyMakingApp[]>(initialApps || []);
	const [loading, setLoading] = useState<boolean>(!initialApps);
	const [clientError, setClientError] = useState<string | null>(ssrError || null);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	const listJsonLd = useMemo(
		() =>
			JSON.stringify({
				"@context": "https://schema.org",
				"@type": "ItemList",
				itemListElement: apps.map((post, index) => ({
					"@type": "Article",
					position: index + 1,
					headline: post.headline,
					image: post.image.url,
					author: { "@type": "Person", name: post.author.name },
					datePublished: post.datePublished,
					url: `${canonical}/${post.id}`,
				})),
			}),
		[apps, canonical],
	);

	const fetchClientSideApps = useCallback(async () => {
		setLoading(true);
		setClientError(null);
		try {
			const response = await fetch(
				`${getClientApiBase()}/money-making-apps?lang=${encodeURIComponent(lang)}`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch money making apps (client-side)");
			}
			const data: MoneyMakingApp[] = await response.json();
			setApps(data);
		} catch (error) {
			console.error("Error fetching money making apps (client-side):", error);
			setClientError(
				error instanceof Error ? error.message : "Failed to load apps client-side.",
			);
			if (!initialApps || initialApps.length === 0) {
				setApps([]);
			}
		} finally {
			setLoading(false);
		}
	}, [initialApps, lang]);

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
	}, [apps.length, fetchClientSideApps, initialApps, ssrError]);

	const getExcerpt = (content?: { text: string }[]): string => {
		if (!content || content.length === 0) {
			return "";
		}
		const excerpt = content[0]?.text || "";
		return excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt;
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
				<title>{copy.title}</title>
				<meta name='description' content={copy.description} />
				<link rel='canonical' href={canonical} />
				<script type='application/ld+json' dangerouslySetInnerHTML={{ __html: listJsonLd }} />
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
						{apps.length > 0 && (
							<span className='section-hero-count'>
								{apps.length} {common.articlesLabel}
							</span>
						)}
					</div>

					<section className='page-intro' aria-label={copy.introAriaLabel}>
						<p>{copy.intro}</p>
					</section>

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
								href={prefixLang(`/extra-income/money-making-apps/${post.id}`, lang)}
								lang={lang}
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
					{currentPosts.length === 0 && <p>{copy.emptyLabel}</p>}
				</>
			)}
		</div>
	);
};

export default MoneyMakingApps;
