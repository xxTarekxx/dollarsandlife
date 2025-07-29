import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import BlogPostContent from "../../src/components/articles-content/BlogPostContent";
import { sanitizeAndTruncateHTML } from "../../src/utils/sanitization.server";

interface BreakingNewsPost {
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
}

interface BreakingNewsDetailProps {
	post: BreakingNewsPost | null;
	error?: string;
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
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE
			}/breaking-news/${encodeURIComponent(id)}`,
		);
		if (!response.ok) {
			if (response.status === 404) {
				return { notFound: true };
			}
			console.error(
				`Failed to fetch breaking news post ${id}: ${response.status} ${response.statusText}`,
			);
			return {
				props: {
					post: null,
					error: `Failed to fetch post: ${response.status}`,
				},
			};
		}
		const post: BreakingNewsPost = await response.json();
		const firstTextSection = post.content.find((section) => section.text);
		if (firstTextSection && typeof firstTextSection.text === "string") {
			post.metaDescription = sanitizeAndTruncateHTML(
				firstTextSection.text,
				160,
			);
		} else {
			post.metaDescription = "Detailed breaking news post.";
		}
		return { props: { post } };
	} catch (error) {
		console.error(
			`Error in getServerSideProps for breaking news post ${id}:`,
			error,
		);
		return {
			props: {
				post: null,
				error: "Server error while fetching breaking news post.",
			},
		};
	}
};

const BreakingNewsDetail: React.FC<BreakingNewsDetailProps> = ({
	post,
	error,
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
				<p>The requested breaking news post could not be found.</p>
			</div>
		);
	}

	return (
		<div className='page-container'>
			<Head>
				<title>{`${Array.isArray(post.headline) ? post.headline.join("") : post.headline
					} | Breaking News`}</title>
				<meta name='description' content={post.metaDescription} />
				{post.canonicalUrl && <link rel='canonical' href={post.canonicalUrl} />}
			</Head>
			<BlogPostContent postData={post} />
		</div>
	);
};

export default BreakingNewsDetail;
