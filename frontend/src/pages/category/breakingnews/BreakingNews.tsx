import React, { useEffect, useRef, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "../Extra-Income/CommonStyles.css";

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

const BreakingNews: React.FC = () => {
	const [news, setNews] = useState<NewsArticle[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Breaking News";
	}, []);

	useEffect(() => {
		const fetchNews = async () => {
			try {
				setLoading(true);
				const API_KEY = import.meta.env.VITE_NEWS_API_KEY; // Replace with your actual API key
				const BASE_URL = "https://newsdata.io/api/1/news";
				const language = "en";

				// Fetch latest Business (Finance) and Health articles
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

				// Select 2 Business articles and 2 Health articles
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

	// Scroll to the top when the currentPage changes
	useEffect(() => {
		if (pageRef.current) {
			pageRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [currentPage]);

	// Paginate the news articles
	const currentPosts = news.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const items = currentPosts.map((article, index) => (
		<React.Fragment key={article.id || `news-${index}`}>
			<div className='news-row-container'>
				<Link to={article.link} target='_blank' rel='noopener noreferrer'>
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
							<div>
								<button
									className='read-more-button'
									aria-label={`Read more about ${article.title}`}
								>
									Read More
								</button>
							</div>
						</div>
					</article>
				</Link>
			</div>
			{/* Show small ad (300x250) after every 2 rows */}
			{index > 0 && index % 2 === 1 && (
				<div className='postings-container' key={`ad-${index}`}>
					<div className='postings-row-container'>
						<a
							href='https://www.kqzyfj.com/click-101252893-15236454'
							target='_blank'
							rel='noopener noreferrer'
						>
							<img
								src='https://www.ftjcfx.com/image-101252893-15236454'
								alt='Ad'
								className='postings-image'
							/>
						</a>
					</div>
				</div>
			)}
		</React.Fragment>
	));

	return (
		<div className='news-main-container' ref={pageRef}>
			<Routes>
				<Route
					path='/'
					element={
						<>
							<h1 className='section-heading'>Breaking News</h1>
							{loading && <p>Loading news...</p>}
							{error && <p className='error-text'>{error}</p>}
							<div className='content-wrapper'>{items}</div>
							<PaginationContainer
								totalItems={news.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
							{/* Show large ad (728x90) at the very bottom */}
							<div className='postings-container'>
								<div className='postings-bottom-container'>
									<a
										href='https://www.tkqlhce.com/click-101252893-14103279'
										target='_blank'
										rel='noopener noreferrer'
									>
										<img
											className='postings-image'
											src='https://www.ftjcfx.com/image-101252893-14103279'
											alt='Ad'
										/>
									</a>
								</div>
							</div>
						</>
					}
				/>
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='breakingnewsdata.json' />}
				/>
			</Routes>
		</div>
	);
};

export default BreakingNews;
