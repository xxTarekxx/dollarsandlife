import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import BlogPostContent from "../../../components/articles-content/BlogPostContent";
import BlogPostCard from "../../../components/articles-postcards/BlogPostCard";
import PaginationContainer from "../../../components/pagination/PaginationContainer";
import "../extra-income/CommonStyles.css";

interface BlogPost {
	id: string;
	headline: string;
	author: {
		name: string;
	};
	datePublished: string;
	image: {
		url: string;
		caption: string;
	};
	content: {
		subtitle?: string;
		text?: string;
		bulletPoints?: string[];
	}[];
	dateModified?: string;
}

const BreakingNews: React.FC = () => {
	const [localNews, setLocalNews] = useState<BlogPost[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	useEffect(() => {
		const fetchNews = async () => {
			try {
				const response = await fetch(
					`${process.env.REACT_APP_API_BASE}/breaking-news`,
				);
				if (!response.ok) throw new Error("Failed to fetch news data");
				const data = await response.json();
				const newsArray = Array.isArray(data) ? data : [data];
				setLocalNews(newsArray);
			} catch (error) {
				console.error("Error fetching breaking news:", error);
			}
		};
		if (localNews.length === 0) fetchNews();
	}, [localNews.length]);

	const getExcerpt = (content: { text?: string }[]): string => {
		const firstText = content.find((item) => item.text)?.text || "";
		return firstText.length > 120
			? `${firstText.substring(0, 120)}...`
			: firstText || "No description available";
	};

	const currentPosts = localNews.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	return (
		<div className='page-container'>
			<Helmet prioritizeSeoTags>
				<title>Breaking News - Latest Financial and Economic Updates</title>
				<meta
					name='description'
					content='Stay updated with the latest financial, business, and economic breaking news. Get insights, analysis, and top trending stories.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/breaking-news'
				/>
			</Helmet>

			<Routes>
				<Route
					path='/'
					element={
						<>
							<h1 className='title-heading'>Breaking News</h1>

							<div className='content-wrapper'>
								{currentPosts.map((post) => (
									<BlogPostCard
										key={post.id}
										id={post.id}
										headline={post.headline}
										image={post.image}
										content={getExcerpt(post.content)}
										author={{ name: post.author.name }}
										datePublished={post.datePublished}
										dateModified={post.dateModified}
										linkTo={`/breaking-news/${post.id}`}
									/>
								))}
							</div>

							<PaginationContainer
								totalItems={localNews.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</>
					}
				/>

				<Route
					path=':id'
					element={<BlogPostContent jsonFile='breaking-news' />}
				/>
			</Routes>
		</div>
	);
};

export default BreakingNews;
