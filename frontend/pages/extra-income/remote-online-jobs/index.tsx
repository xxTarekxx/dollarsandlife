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

interface RemoteJob {
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

const RemoteOnlineJobs: React.FC<RemoteOnlineJobsPageProps> = ({
	initialRemoteJobs,
	error: ssrError,
}) => {
	const lang = useLangFromPath();
	const canonical = usePageCanonical();
	const copy = getListingPageTranslations(lang).remoteOnlineJobs;
	const common = getListingPageTranslations(lang).common;
	const [remoteJobs, setRemoteJobs] = useState<RemoteJob[]>(initialRemoteJobs || []);
	const [loading, setLoading] = useState<boolean>(!initialRemoteJobs);
	const [clientError, setClientError] = useState<string | null>(ssrError || null);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	const listJsonLd = useMemo(
		() =>
			JSON.stringify({
				"@context": "https://schema.org",
				"@type": "ItemList",
				itemListElement: remoteJobs.map((post, index) => ({
					"@type": "Article",
					position: index + 1,
					headline: post.headline,
					image: post.image.url,
					author: { "@type": "Person", name: post.author.name },
					datePublished: post.datePublished,
					url: `${canonical}/${post.id}`,
				})),
			}),
		[canonical, remoteJobs],
	);

	const fetchClientSideRemoteJobs = useCallback(async () => {
		setLoading(true);
		setClientError(null);
		try {
			const response = await fetch(
				`${getClientApiBase()}/remote-jobs?lang=${encodeURIComponent(lang)}`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch remote jobs (client-side)");
			}
			const data: RemoteJob[] = await response.json();
			setRemoteJobs(data);
		} catch (error) {
			console.error("Error fetching remote jobs (client-side):", error);
			setClientError(
				error instanceof Error ? error.message : "Failed to load jobs client-side.",
			);
			if (!initialRemoteJobs || initialRemoteJobs.length === 0) {
				setRemoteJobs([]);
			}
		} finally {
			setLoading(false);
		}
	}, [initialRemoteJobs, lang]);

	useEffect(() => {
		if (initialRemoteJobs && initialRemoteJobs.length > 0) {
			setRemoteJobs(initialRemoteJobs);
			setLoading(false);
			setClientError(null);
		} else if (ssrError) {
			setLoading(false);
		} else if (remoteJobs.length === 0) {
			fetchClientSideRemoteJobs();
		}
	}, [fetchClientSideRemoteJobs, initialRemoteJobs, remoteJobs.length, ssrError]);

	const getExcerpt = (content: { text: string }[]): string => {
		const excerpt = content[0]?.text || "";
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
						{remoteJobs.length > 0 && (
							<span className='section-hero-count'>
								{remoteJobs.length} {common.articlesLabel}
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
								href={prefixLang(`/extra-income/remote-online-jobs/${post.id}`, lang)}
								lang={lang}
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
					{currentPosts.length === 0 && <p>{copy.emptyLabel}</p>}
				</>
			)}
		</div>
	);
};

export default RemoteOnlineJobs;
