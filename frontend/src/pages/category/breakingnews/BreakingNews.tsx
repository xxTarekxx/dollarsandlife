import React, { useEffect, useRef, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "../Extra-Income/CommonStyles.css";

interface BlogPost {
	id: string;
	title: string;
	author: string;
	datePosted: string;
	imageUrl: string;
	content: {
		subtitle?: string;
		text?: string;
		bulletPoints?: string[];
	}[];
}

interface NewsArticle {
	id: string;
	title: string;
	image_url?: string;
	description: string;
	source_id: string;
	pubDate: string;
	link: string;
	category: string[];
}

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

const BreakingNews: React.FC = () => {
	const [jsonPosts, setJsonPosts] = useState<BlogPost[]>([]);
	const [news, setNews] = useState<NewsArticle[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const pageRef = useRef<HTMLDivElement>(null);

	//  Set document title dynamically
	useEffect(() => {
		document.title = "Breaking News - Latest Financial and Economic Updates";
	}, []);

	//  Fetch API news articles
	useEffect(() => {
		const fetchNews = async () => {
			try {
				setLoading(true);
				const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
				const BASE_URL = "https://newsdata.io/api/1/news";
				const language = "en";

				const businessRes = await fetch(
					`${BASE_URL}?apikey=${API_KEY}&language=${language}&category=business`,
				);
				const healthRes = await fetch(
					`${BASE_URL}?apikey=${API_KEY}&language=${language}&category=health`,
				);

				if (!businessRes.ok || !healthRes.ok) {
					throw new Error(`API request failed.`);
				}

				const businessData = await businessRes.json();
				const healthData = await healthRes.json();

				const selectedArticles = [
					...(businessData.results?.slice(0, 2) || []),
					...(healthData.results?.slice(0, 2) || []),
				];

				if (!selectedArticles.length) {
					throw new Error("No relevant news articles found.");
				}

				setNews(selectedArticles);
			} catch (error) {
				console.error("Error fetching news:", error);
				setError("We Will Be Posting Breaking News Articles Soon.");
			} finally {
				setLoading(false);
			}
		};

		fetchNews();
	}, []);

	// Use memoization to optimize pagination
	const currentPosts = useMemo(() => {
		return news.slice(
			(currentPage - 1) * postsPerPage,
			currentPage * postsPerPage,
		);
	}, [news, currentPage, postsPerPage]);

	return (
		<div className='news-main-container' ref={pageRef}>
			{/* SEO: Helmet for meta tags */}
			<Helmet>
				<title>Breaking News - Latest Financial and Economic Updates</title>
				<meta
					name='description'
					content='Stay updated with the latest financial, business, and economic breaking news. Get insights, analysis, and top trending stories.'
				/>
				<meta
					property='og:title'
					content='Breaking News - Financial & Economic Updates'
				/>
				<meta
					property='og:description'
					content='Stay updated with the latest financial, business, and economic breaking news. Get insights, analysis, and top trending stories.'
				/>
				<meta
					property='og:url'
					content='https://www.dollarsandlife.com/breaking-news'
				/>
				<meta property='og:type' content='article' />
			</Helmet>

			{/*  Schema Markup for News Articles */}
			<script type='application/ld+json'>
				{JSON.stringify({
					"@context": "https://schema.org",
					"@type": "NewsArticle",
					headline: "Breaking News - Latest Financial and Economic Updates",
					author: { "@type": "Organization", name: "Dollars & Life" },
					url: "https://www.dollarsandlife.com/breaking-news",
					publisher: {
						"@type": "Organization",
						name: "Dollars & Life",
						logo: {
							"@type": "ImageObject",
							url: "/images/favicon/favicon.webp",
						},
					},
					datePublished: new Date().toISOString(),
				})}
			</script>

			<h1 className='section-heading'>
				<b>Breaking</b> <b>News</b>
			</h1>

			{/* Featured Blog Posts */}
			<div className='content-wrapper'>
				{jsonPosts.map((post) => (
					<Link key={post.id} to={`/post/${post.id}`}>
						<BlogPostCard
							id={post.id}
							title={post.title}
							imageUrl={post.imageUrl}
							content={post.content[0]?.text || ""}
							author={post.author}
							datePosted={post.datePosted}
						/>
					</Link>
				))}
			</div>

			{/* API News Articles */}
			<div className='content-wrapper'>
				{loading && <p>Loading news...</p>}
				{error && <p className='error-text'>{error}</p>}
				{!error &&
					currentPosts.map((article, index) => (
						<article
							key={article.id || `news-${index}`}
							className='news-row-container'
						>
							<Link to={article.link} target='_blank' rel='noopener noreferrer'>
								<div className='card-container'>
									<img
										className='card-image'
										src={article.image_url || "/images/Breaking-News.webp"}
										alt={article.title}
										loading='lazy'
									/>
									<div className='card-content'>
										<header>
											<h2 className='card-title'>{article.title}</h2>
										</header>
										<p className='card-text'>
											{article.description || "No description available"}
										</p>
										<div>
											<p className='card-author'>By {article.source_id}</p>
											<time className='card-date' dateTime={article.pubDate}>
												{new Date(article.pubDate).toLocaleDateString()}
											</time>
										</div>
									</div>
								</div>
							</Link>

							{/* AdSense Ad Placement */}
							{index > 0 && index % 3 === 2 && (
								<div className='postings-container' key={`ad-${index}`}>
									<ins
										className='adsbygoogle'
										style={{
											display: "block",
											width: "300px",
											height: "250px",
										}}
										data-ad-client='ca-pub-1079721341426198'
										data-ad-slot='7197282987'
										data-ad-format='auto'
										data-full-width-responsive='true'
									></ins>
								</div>
							)}
						</article>
					))}
			</div>

			<PaginationContainer
				totalItems={news.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</div>
	);
};

export default BreakingNews;
