import { GetServerSideProps } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import BlogPostCard from "../../src/components/articles-postcards/BlogPostCard";
import PaginationContainer from "../../src/components/pagination/PaginationContainer";

interface BreakingNewsPost {
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

interface BreakingNewsPageProps {
	initialBreakingNews?: BreakingNewsPost[];
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/breaking-news`,
		);
		if (!response.ok) {
			console.error(`SSR Error fetching breaking news: ${response.status}`);
			return {
				props: {
					initialBreakingNews: [],
					error: "Failed to load breaking news from server.",
				},
			};
		}
		const initialBreakingNewsData = await response.json();
		const initialBreakingNews: BreakingNewsPost[] = Array.isArray(
			initialBreakingNewsData,
		)
			? initialBreakingNewsData
			: initialBreakingNewsData
			? [initialBreakingNewsData]
			: [];
		return { props: { initialBreakingNews } };
	} catch (error) {
		console.error("SSR Exception fetching breaking news:", error);
		return {
			props: {
				initialBreakingNews: [],
				error: "Server exception when loading breaking news.",
			},
		};
	}
};

const BreakingNews: React.FC<BreakingNewsPageProps> = ({
	initialBreakingNews,
	error: ssrError,
}) => {
	const [breakingNews, setBreakingNews] = useState<BreakingNewsPost[]>(
		initialBreakingNews || [],
	);
	const [loading, setLoading] = useState<boolean>(!initialBreakingNews);
	const [clientError, setClientError] = useState<string | null>(
		ssrError || null,
	);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	const fetchClientSideBreakingNews = useCallback(async () => {
		setLoading(true);
		setClientError(null);
		try {
			const apiUrl = `${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/breaking-news`;
			const response = await fetch(apiUrl);
			if (!response.ok)
				throw new Error("Failed to fetch breaking news (client-side)");
			const data: BreakingNewsPost[] = await response.json();
			setBreakingNews(data);
		} catch (error) {
			console.error("Error fetching breaking news (client-side):", error);
			setClientError(
				error instanceof Error
					? error.message
					: "Failed to load breaking news client-side.",
			);
			if (!initialBreakingNews || initialBreakingNews.length === 0)
				setBreakingNews([]);
		} finally {
			setLoading(false);
		}
	}, [initialBreakingNews]);

	useEffect(() => {
		if (initialBreakingNews && initialBreakingNews.length > 0) {
			setBreakingNews(initialBreakingNews);
			setLoading(false);
			setClientError(null);
		} else if (ssrError) {
			console.error("SSR Error for BreakingNews page:", ssrError);
			setLoading(false);
		} else if (breakingNews.length === 0) {
			fetchClientSideBreakingNews();
		}
	}, [
		initialBreakingNews,
		ssrError,
		breakingNews.length,
		fetchClientSideBreakingNews,
	]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		const excerpt = firstSection?.text || "";
		return excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt;
	};

	const currentPosts = breakingNews.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, [currentPage]);

	return (
		<div className='page-container'>
			<Head>
				<title>Breaking News - Latest Financial and Economic Updates</title>
				<meta
					name='description'
					content='Stay updated with the latest financial, business, and economic breaking news. Get insights, analysis, and top trending stories.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/breaking-news'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: breakingNews.map((post, index) => ({
							"@type": "Article",
							position: index + 1,
							headline: post.headline,
							image: post.image.url,
							author: { "@type": "Organization", name: post.author.name },
							datePublished: post.datePublished,
							url: `https://www.dollarsandlife.com/breaking-news/${post.id}`,
						})),
					})}
				</script>
			</Head>

			{loading && (
				<p className='sd-loading-indicator'>Loading breaking news...</p>
			)}
			{clientError && (
				<p className='sd-error-indicator'>Error loading news: {clientError}</p>
			)}
			{!loading && !clientError && (
				<>
					<h1 className='title-heading'>Breaking News</h1>
					<div className='content-wrapper'>
						{currentPosts.map((post) => {
							const href = `/breaking-news/${post.id}`;
							return (
								<BlogPostCard
									key={post.id}
									id={post.id}
									headline={post.headline}
									image={post.image}
									content={getExcerpt(post.content)}
									author={post.author}
									datePublished={post.datePublished}
									dateModified={post.dateModified}
									href={href}
								/>
							);
						})}
					</div>

					<PaginationContainer
						totalItems={breakingNews.length}
						itemsPerPage={postsPerPage}
						currentPage={currentPage}
						setCurrentPage={setCurrentPage}
					/>
				</>
			)}
		</div>
	);
};

export default BreakingNews;
