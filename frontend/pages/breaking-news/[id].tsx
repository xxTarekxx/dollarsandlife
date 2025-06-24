import { GetServerSideProps } from "next";
import Head from "next/head";
import React from "react";
import BlogPostContent from "../../src/components/articles-content/BlogPostContent";

interface BreakingNewsPost {
	id: string;
	headline: string;
	author: { name: string };
	datePublished: string;
	dateModified?: string;
	image: { url: string; caption: string };
	content: { text: string }[];
	canonicalUrl?: string;
}

interface BreakingNewsDetailPageProps {
	post: BreakingNewsPost | null;
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async (context) => {
	const { id } = context.params || {};
	if (!id || typeof id !== "string") {
		return { notFound: true };
	}
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/breaking-news/${id}`,
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
		return { props: { post } };
	} catch (error) {
		console.error(
			`Error in getServerSideProps for breaking news/${id}:`,
			error,
		);
		return {
			props: { post: null, error: "Server error while fetching post." },
		};
	}
};

const BreakingNewsDetailPage: React.FC<BreakingNewsDetailPageProps> = ({
	post,
	error,
}) => {
	if (error) {
		return (
			<div className='page-container'>
				<Head>
					<title>Error</title>
				</Head>
				<p>Error loading post: {error}</p>
			</div>
		);
	}

	if (!post) {
		return (
			<div className='page-container'>
				<Head>
					<title>Post Not Found</title>
				</Head>
				<p>The requested post could not be found.</p>
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
		return "Detailed breaking news article.";
	};

	return (
		<div className='page-container'>
			<Head>
				<title>{post.headline} | Breaking News</title>
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

export default BreakingNewsDetailPage;
