"use client";
import Head from "next/head";
import React from "react";
// import { useRouter } from 'next/router'; // Removed
import { GetServerSideProps } from "next";
import BlogPostContent from "../../../src/components/articles-content/BlogPostContent";

interface RemoteOnlineJobPost {
	id: string;
	headline: string;
	content: { text: string }[];
	canonicalUrl?: string;
	author?: { name: string };
	datePublished?: string;
	image?: { url: string; caption: string };
}

interface RemoteOnlineJobDetailProps {
	post: RemoteOnlineJobPost | null;
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	console.log("=== getServerSideProps Debug ===");
	console.log(
		"Environment variable:",
		process.env.NEXT_PUBLIC_REACT_APP_API_BASE,
	);

	const { id } = context.params || {};
	if (!id || typeof id !== "string") {
		console.log("No ID provided or ID is not a string");
		return { notFound: true };
	}

	// Normalize the ID to lowercase for consistency
	const normalizedId = id.toLowerCase();
	console.log("Original ID:", id, "Normalized ID:", normalizedId);

	// If the original ID is not lowercase, redirect to the lowercase version
	if (id !== normalizedId) {
		console.log("Redirecting from uppercase to lowercase URL");
		return {
			redirect: {
				destination: `/extra-income/remote-online-jobs/${normalizedId}`,
				permanent: false,
			},
		};
	}

	try {
		// Use hardcoded API base for debugging - try IP address instead of localhost
		const apiBase =
			process.env.NEXT_PUBLIC_REACT_APP_API_BASE || "http://127.0.0.1:5001/api";
		const apiUrl = `${apiBase}/remote-jobs/${normalizedId}`;
		console.log("Fetching from API:", apiUrl);

		// Add timeout and proper error handling
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

		const response = await fetch(apiUrl, {
			signal: controller.signal,
			headers: {
				Accept: "application/json",
			},
		});

		clearTimeout(timeoutId);
		console.log("API Response status:", response.status);
		console.log(
			"API Response headers:",
			Object.fromEntries(response.headers.entries()),
		);

		if (!response.ok) {
			if (response.status === 404) {
				console.log("API returned 404 for:", normalizedId);
				return { notFound: true };
			}
			console.error(
				`Failed to fetch remote job post ${normalizedId}: ${response.status} ${response.statusText}`,
			);
			return {
				props: {
					post: null,
					error: `Failed to fetch post: ${response.status}`,
				},
			};
		}
		const post: RemoteOnlineJobPost = await response.json();
		console.log("Successfully fetched post:", post.headline);
		return { props: { post } };
	} catch (error) {
		console.error(
			`Error in getServerSideProps for remote job post ${normalizedId}:`,
			error,
		);

		// If it's a network error, return a more specific error message
		if (error instanceof Error && error.name === "AbortError") {
			return {
				props: {
					post: null,
					error: "Request timeout - API server may be unavailable.",
				},
			};
		}

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
		return "Detailed remote online job post.";
	};

	return (
		<div className='page-container'>
			<Head>
				<title>
					{Array.isArray(post.headline)
						? post.headline.join("")
						: post.headline}{" "}
					| Remote Online Jobs
				</title>
				<meta
					name='description'
					content={generateMetaDescription(post.content)}
				/>
				{post.canonicalUrl && <link rel='canonical' href={post.canonicalUrl} />}
			</Head>
			<BlogPostContent
				postData={{
					...post,
					author: post.author || { name: "Unknown" },
					datePublished: post.datePublished || "",
					image: post.image || { url: "", caption: "" },
				}}
			/>
		</div>
	);
};

export default RemoteOnlineJobDetail;
