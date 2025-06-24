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

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params || {};
	if (!id || typeof id !== "string") {
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
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/freelance-jobs/${normalizedId}`,
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
			return (
				firstTextSection.text.substring(0, 160).replace(/<[^>]*>/g, "") + "..."
			);
		}
		return "Detailed freelance job post.";
	};

	return (
		<div className='page-container'>
			<Head>
				<title>{post.headline} | Freelance Jobs</title>
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
