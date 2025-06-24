// Removed 'use client';
import Head from "next/head";
import React from "react";
// import { useRouter } from 'next/router'; // Removed
import { GetServerSideProps } from "next";
import BlogPostContent from "../../src/components/articles-content/BlogPostContent";

interface BlogPost {
	// Ensure this interface matches the structure of your posts
	id: string;
	headline: string;
	author: { name: string };
	datePublished: string;
	dateModified?: string;
	image: { url: string; caption: string };
	content: { text: string }[];
	canonicalUrl?: string;
}

interface StartABlogPostDetailProps {
	post: BlogPost | null;
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
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/start-blog/${encodeURIComponent(id)}`,
		);
		if (!response.ok) {
			if (response.status === 404) {
				return { notFound: true };
			}
			console.error(
				`Failed to fetch start-a-blog post ${id}: ${response.status} ${response.statusText}`,
			);
			return {
				props: {
					post: null,
					error: `Failed to fetch post: ${response.status}`,
				},
			};
		}
		const post: BlogPost = await response.json();
		return { props: { post } };
	} catch (error) {
		console.error(
			`Error in getServerSideProps for start-a-blog post ${id}:`,
			error,
		);
		return {
			props: {
				post: null,
				error: "Server error while fetching start-a-blog post.",
			},
		};
	}
};

const StartABlogPostDetail: React.FC<StartABlogPostDetailProps> = ({
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
				<p>The requested blog post could not be found.</p>
			</div>
		);
	}

	const generateMetaDescription = (content: { text: string }[]): string => {
		const firstTextSection = content.find((section) => section.text);
		if (firstTextSection && typeof firstTextSection.text === "string") {
			return (
				firstTextSection.text.substring(0, 160).replace(/<[^>]*>/g, "") + "..."
			);
		}
		return "Detailed start a blog post.";
	};

	return (
		<div className='page-container'>
			<Head>
				<title>{post.headline} | Start a Blog</title>
				<meta
					name='description'
					content={generateMetaDescription(post.content)}
				/>
				{post.canonicalUrl && <link rel='canonical' href={post.canonicalUrl} />}
			</Head>
			<BlogPostContent postData={post} />
		</div>
	);
};

export default StartABlogPostDetail;
