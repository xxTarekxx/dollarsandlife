"use client";
import Head from "next/head";
import React from "react";
// import { useRouter } from 'next/router'; // Removed
import { GetServerSideProps } from "next";
import BlogPostContent from "../../../src/components/articles-content/BlogPostContent";

// Define BlogPost interface (should be consistent with API response and BlogPostContent's expectation)
interface BlogPost {
	id: string;
	headline: string;
	author: { name: string }; // Assuming author is an object with a name
	datePublished: string;
	dateModified?: string;
	image: { url: string; caption: string }; // Assuming image is an object
	content: { text: string }[]; // Replace 'any' with a more specific type for PostContent if available
	canonicalUrl?: string;
	// Add any other fields that come from your API and are used
}

interface BudgetPostDetailProps {
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

	// Normalize the ID to lowercase for consistency
	const normalizedId = id.toLowerCase();

	// If the original ID is not lowercase, redirect to the lowercase version
	if (id !== normalizedId) {
		return {
			redirect: {
				destination: `/extra-income/budget/${normalizedId}`,
				permanent: false,
			},
		};
	}

	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/budget-data/${encodeURIComponent(normalizedId)}`,
		);
		if (!response.ok) {
			if (response.status === 404) {
				return { notFound: true };
			}
			console.error(
				`Failed to fetch budget post ${normalizedId}: ${response.status} ${response.statusText}`,
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
			`Error in getServerSideProps for budget post ${normalizedId}:`,
			error,
		);
		return {
			props: { post: null, error: "Server error while fetching budget post." },
		};
	}
};

const BudgetPostDetail: React.FC<BudgetPostDetailProps> = ({ post, error }) => {
	// const router = useRouter(); // Removed
	// const { id } = router.query; // Removed

	// if (!router.isReady || !id || typeof id !== 'string') { // Removed
	//   return <p>Loading post or invalid ID...</p>;
	// }

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
				<p>The requested budget post could not be found.</p>
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
		return "Detailed budget post.";
	};

	return (
		<div className='page-container'>
			<Head>
				<title>{post.headline} | Budget Planning</title>
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

export default BudgetPostDetail;
