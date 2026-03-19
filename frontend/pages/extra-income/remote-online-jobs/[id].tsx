import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import Head from "next/head";
import Link from "next/link";
import React from "react";
import { sanitizeAndTruncateHTML } from "../../../src/utils/sanitization.server";

// Dynamically import BlogPostContent to reduce initial bundle size
const BlogPostContent = dynamic(
	() => import("../../../src/components/articles-content/BlogPostContent"),
	{
		loading: () => <div>Loading content...</div>,
		ssr: true,
	}
);

interface RemoteOnlineJobPost {
	// Ensure this interface matches the structure of your posts
	id: string;
	headline: string;
	author: { name: string };
	datePublished: string;
	dateModified?: string;
	image: { url: string; caption: string };
	content: { text: string }[];
	canonicalUrl?: string;
	metaDescription?: string;
	availableLangs?: string[];
}

interface RemoteOnlineJobDetailProps {
	post: RemoteOnlineJobPost | null;
	error?: string;
	locale?: string;
}

// Validation function to ensure id is safe
const isValidId = (id: string): boolean => {
	// Only allow alphanumeric characters, hyphens, and underscores
	// This prevents injection attacks and ensures the id is safe for URLs
	return /^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 100;
};

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params || {};
	if (!id || typeof id !== "string" || !isValidId(id)) {
		return { notFound: true };
	}
	const locale = ((context.req.cookies['NEXT_LOCALE'] as string) || 'en').toLowerCase();
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE
			}/remote-jobs/${encodeURIComponent(id)}?lang=${locale}`,
		);
		if (!response.ok) {
			if (response.status === 404) {
				return { notFound: true };
			}
			console.error(
				`Failed to fetch remote job post ${id}: ${response.status} ${response.statusText}`,
			);
			return {
				props: {
					post: null,
					error: `Failed to fetch post: ${response.status}`,
				},
			};
		}
		const post: RemoteOnlineJobPost = await response.json();
		const firstTextSection = post.content.find((section) => section.text);
		if (firstTextSection && typeof firstTextSection.text === "string") {
			post.metaDescription = sanitizeAndTruncateHTML(
				firstTextSection.text,
				160,
			);
		} else {
			post.metaDescription = "Detailed remote job post.";
		}
		return { props: { post, locale } };
	} catch (error) {
		console.error(
			`Error in getServerSideProps for remote job post ${id}:`,
			error,
		);
		return {
			props: {
				post: null,
				error: "Server error while fetching remote job post.",
			},
		};
	}
};

const RemoteOnlineJobDetail: React.FC<RemoteOnlineJobDetailProps> = ({
	post,
	error,
	locale = 'en',
}) => {
	if (error) {
		return (
			<div className='page-container'>
				<Head>
					<title>Error Loading Post</title>
				</Head>
				<p>Error: {error}</p>
			</div>
		);
	}

	if (!post) {
		return (
			<div className='page-container'>
				<Head>
					<title>Post Not Found</title>
				</Head>
				<p>The requested remote job post could not be found.</p>
			</div>
		);
	}

	// Always use the correct canonical URL pattern, ignoring database value
	const langPrefix = locale && locale !== 'en' ? `/${locale}` : '';
	const canonicalUrl = `https://www.dollarsandlife.com${langPrefix}/extra-income/remote-online-jobs/${post.id}`;

	return (
		<div className='page-container'>
			<Head>
				<title>{`${Array.isArray(post.headline) ? post.headline.join("") : post.headline
					} | Remote Jobs`}</title>
				<meta name='description' content={post.metaDescription} />
				<link rel='canonical' href={canonicalUrl} />
				{/* Hreflang: one tag per translated language + x-default */}
				{(post.availableLangs ?? ['en']).map((lang) => (
					<link key={lang} rel='alternate' hrefLang={lang}
						href={lang === 'en'
							? `https://www.dollarsandlife.com/extra-income/remote-online-jobs/${post.id}`
							: `https://www.dollarsandlife.com/${lang}/extra-income/remote-online-jobs/${post.id}`
						} />
				))}
				<link rel='alternate' hrefLang='x-default' href={`https://www.dollarsandlife.com/extra-income/remote-online-jobs/${post.id}`} />
				{/* Open Graph */}
				<meta property='og:type' content='article' />
				<meta property='og:title' content={Array.isArray(post.headline) ? post.headline.join("") : post.headline} />
				<meta property='og:description' content={post.metaDescription} />
				<meta property='og:url' content={canonicalUrl} />
				<meta property='og:image' content={post.image.url} />
				<meta property='og:image:width' content='1200' />
				<meta property='og:image:height' content='630' />
				<meta property='og:site_name' content='Dollars & Life' />
				{/* Twitter */}
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:title' content={Array.isArray(post.headline) ? post.headline.join("") : post.headline} />
				<meta name='twitter:description' content={post.metaDescription} />
				<meta name='twitter:image' content={post.image.url} />
				<link rel='preload' href={post.image.url} as='image' />
				<link rel='dns-prefetch' href='//pagead2.googlesyndication.com' />
				<link rel='dns-prefetch' href='//www.googletagmanager.com' />
				{/* Structured Data */}
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Article",
							mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
							headline: Array.isArray(post.headline) ? post.headline.join("") : post.headline,
							image: { "@type": "ImageObject", url: post.image.url },
							author: {
								"@type": "Person",
								name: post.author.name,
							},
							publisher: {
								"@type": "Organization",
								name: "Dollars & Life",
								logo: { "@type": "ImageObject", url: "https://www.dollarsandlife.com/images/website-logo.webp" },
							},
							datePublished: post.datePublished,
							dateModified: post.dateModified || post.datePublished,
							url: canonicalUrl,
						}),
					}}
				/>
			</Head>
			<BlogPostContent postData={post} />
			<nav className='related-reading' aria-label='Related reading'>
				<h3 className='related-reading-title'>Related Reading</h3>
				<ul className='related-reading-list'>
					<li><Link href='/extra-income/freelance-jobs' className='related-reading-link'>Freelance Jobs</Link></li>
					<li><Link href='/financial-calculators' className='related-reading-link'>Financial Calculators</Link></li>
					<li><Link href='/extra-income' className='related-reading-link'>Extra Income Hub</Link></li>
				</ul>
			</nav>
		</div>
	);
};

export default RemoteOnlineJobDetail;
