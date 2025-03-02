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

declare global {
	interface Window {
		adsbygoogle: any;
	}
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

	useEffect(() => {
		if (pageRef.current) {
			pageRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [currentPage]);

	useEffect(() => {
		setTimeout(() => {
			const adContainers = document.querySelectorAll(".postings-container");
			let adsPushed = false;
			adContainers.forEach((adContainer) => {
				if (
					(adContainer as HTMLElement).offsetWidth > 0 &&
					(adContainer as HTMLElement).offsetHeight > 0
				) {
					if (!adsPushed) {
						console.log("Pushing AdSense ads...");
						(window.adsbygoogle = window.adsbygoogle || []).push({});
						adsPushed = true;
					}
				}
			});
		}, 2000);
	}, []);

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
						</div>
					</article>
				</Link>
			</div>
			{index > 0 && index % 2 === 1 && (
				<div className='postings-container' key={`ad-${index}`}>
					<ins
						className='adsbygoogle'
						style={{ display: "block", width: "300px", height: "250px" }}
						data-ad-client='ca-pub-2295073683044412'
						data-ad-slot='9380614635'
						data-ad-format='rectangle'
						data-full-width-responsive='false'
					/>
				</div>
			)}
		</React.Fragment>
	));

	return (
		<div className='news-main-container' ref={pageRef}>
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
			<div className='postings-container'>
				<ins
					className='adsbygoogle'
					style={{ display: "block", width: "728px", height: "90px" }}
					data-ad-client='ca-pub-2295073683044412'
					data-ad-slot='9380614635'
					data-ad-format='horizontal'
					data-full-width-responsive='false'
				/>
			</div>
		</div>
	);
};

export default BreakingNews;
