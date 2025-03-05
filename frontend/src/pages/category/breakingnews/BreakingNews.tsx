import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
	// State for JSON posts (featured articles)
	const [jsonPosts, setJsonPosts] = useState<BlogPost[]>([]);
	// State for API news items
	const [news, setNews] = useState<NewsArticle[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const pageRef = useRef<HTMLDivElement>(null);

	// Fetch JSON posts (featured articles)
	useEffect(() => {
		fetch("/data/crypto-articles.json")
			.then((response) => response.json())
			.then((data: BlogPost[]) => {
				setJsonPosts(data);
			})
			.catch((error) => console.error("Error fetching JSON posts:", error));
	}, []);

	// Fetch API news articles (original API logic)
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
					throw new Error(`API request failed. Status: ${businessRes.status}`);
				}

				const businessData = await businessRes.json();
				const healthData = await healthRes.json();

				const businessArticles = businessData.results?.slice(0, 2) || [];
				const healthArticles = healthData.results?.slice(0, 2) || [];
				const selectedArticles = [...businessArticles, ...healthArticles];

				if (selectedArticles.length === 0) {
					throw new Error("No relevant news articles found.");
				}

				setNews(selectedArticles);
			} catch (error) {
				console.error("Error fetching news:", error);
				setError((error as Error).message);
			} finally {
				setLoading(false);
			}
		};

		fetchNews();
	}, []);

	// Pagination for API news items
	const currentPosts = news.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	return (
		<div className='news-main-container' ref={pageRef}>
			<h1 className='section-heading'>
				<b>Breaking</b> <b>News</b>
			</h1>

			{/* Render BlogPostCards from JSON file (Featured Articles) */}
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

			{/* Render API news articles */}
			<div className='content-wrapper'>
				{loading && <p>Loading news...</p>}
				{error && (
					<p className='error-text'>
						We Will Be Posting More Breaking News Articles Soon
					</p>
				)}
				{!error &&
					currentPosts.map((article, index) => (
						<React.Fragment key={article.id || `news-${index}`}>
							<div className='news-row-container'>
								<Link
									to={article.link}
									target='_blank'
									rel='noopener noreferrer'
								>
									<article className='card-container'>
										<img
											className='card-image'
											src={
												article.image_url
													? article.image_url
													: "/images/Breaking-News.webp"
											}
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
									</article>
								</Link>
							</div>
							{index > 0 && index % 2 === 1 && (
								<div className='postings-container' key={`ad-${index}`}>
									<ins
										className='adsbygoogle'
										style={{
											display: "block",
											width: "300px",
											height: "250px",
											minWidth: "300x",
											minHeight: "250px",
										}}
										data-ad-client='ca-pub-1079721341426198'
										data-ad-slot='7197282987'
										data-ad-format='auto'
										data-full-width-responsive='true'
									></ins>
								</div>
							)}
						</React.Fragment>
					))}
			</div>

			<PaginationContainer
				totalItems={news.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>

			<div className='postings-container'>
				<ins
					className='adsbygoogle-banner'
					style={{
						display: "block",
						width: "728px",
						height: "90px",
						minWidth: "300px",
						minHeight: "90px",
					}}
					data-ad-client='ca-pub-1079721341426198'
					data-ad-slot='6375155907'
					data-ad-format='horizontal'
					data-full-width-responsive='true'
				></ins>
			</div>
		</div>
	);
};

export default BreakingNews;
