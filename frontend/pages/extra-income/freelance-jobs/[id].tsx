"use client";
import Head from "next/head";
import React from "react";
// import { useRouter } from 'next/router'; // Removed
import { GetServerSideProps } from "next";
import BlogPostContent from "../../../src/components/articles-content/BlogPostContent";

interface FreelanceJobPost {
	id: string;
	headline: string;
	author: { name: string };
	datePublished: string;
	dateModified?: string;
	image: { url: string; caption: string };
	content: { text: string }[];
	canonicalUrl?: string;
}

interface FreelanceJobDetailProps {
	post: FreelanceJobPost | null;
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

	// Normalize the ID to lowercase for consistency
	const normalizedId = id.toLowerCase();

	// If the original ID is not lowercase, redirect to the lowercase version
	if (id !== normalizedId) {
		return {
			redirect: {
				destination: `/extra-income/freelance-jobs/${normalizedId}`,
				permanent: false,
			},
		};
	}

	try {
		const response = await fetch(
			`${
				process.env.NEXT_PUBLIC_REACT_APP_API_BASE
			}/freelance-jobs/${encodeURIComponent(normalizedId)}`,
		);
		if (!response.ok) {
			if (response.status === 404) {
				return { notFound: true };
			}
			console.error(
				`Failed to fetch freelance job post ${normalizedId}: ${response.status} ${response.statusText}`,
			);
			return {
				props: {
					post: null,
					error: `Failed to fetch post: ${response.status}`,
				},
			};
		}
		const post: FreelanceJobPost = await response.json();
		return { props: { post } };
	} catch (error) {
		console.error(
			`Error in getServerSideProps for freelance job post ${normalizedId}:`,
			error,
		);
		return {
			props: {
				post: null,
				error: "Server error while fetching freelance job post.",
			},
		};
	}
};

const FreelanceJobDetail: React.FC<FreelanceJobDetailProps> = ({
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
				<p>The requested freelance job post could not be found.</p>
			</div>
		);
	}

	const generateMetaDescription = (content: { text: string }[]): string => {
		const firstTextSection = content.find((section) => section.text);
		if (firstTextSection && typeof firstTextSection.text === "string") {
			// Comprehensive sanitization to remove ALL HTML and multi-character entities
			const sanitized = (() => {
				// First, remove script tags and their content completely
				let clean = firstTextSection.text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
				
				// Remove all HTML tags using a more robust approach
				clean = clean
					.replace(/<[^>]*>/g, "")  // Remove complete tags
					.replace(/<[^>]*$/g, "")  // Remove incomplete opening tags at end
					.replace(/^[^<]*>/g, "")  // Remove incomplete closing tags at start
					.replace(/<[^>]*/g, "")   // Remove any remaining incomplete opening tags
					.replace(/[^<]*>/g, "");  // Remove any remaining incomplete closing tags
				
				// Remove HTML entities (including numeric entities)
				clean = clean
					.replace(/&[a-zA-Z0-9#]+;/g, "")
					.replace(/&#[0-9]+;/g, "")
					.replace(/&#x[a-fA-F0-9]+;/g, "");
				
				// Remove Unicode control characters and other dangerous sequences
				clean = clean.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
				
				// Remove zero-width characters and other invisible characters
				clean = clean.replace(/[\u200B-\u200D\uFEFF]/g, "");
				
				// Normalize whitespace
				clean = clean.replace(/\s+/g, " ");
				
				return clean.trim();
			})();
			
			// Use Array.from to handle Unicode characters properly and ensure complete sanitization
			const truncated = Array.from(sanitized).slice(0, 160).join('');
			
			return truncated + "...";
		}
		return "Detailed freelance job post.";
	};

	return (
		<div className='page-container'>
			<Head>
				<title>
					{Array.isArray(post.headline)
						? post.headline.join("")
						: post.headline}{" "}
					| Freelance Jobs
				</title>
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

export default FreelanceJobDetail;
