import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
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

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

const BreakingNews: React.FC = () => {
	const [localNews, setLocalNews] = useState<BlogPost[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 4;

	// Fetch Breaking News
	useEffect(() => {
		const fetchNews = async () => {
			try {
				const response = await fetch("/data/breakingnews.json");
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

	// Push AdSense Ads
	useEffect(() => {
		if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
			try {
				window.adsbygoogle.push({});
			} catch (e) {
				console.error("Adsense Error:", e);
			}
		}
	}, []);

	const currentPosts = localNews.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	return (
		<div className='news-main-container'>
			{/* SEO Metadata */}
			<Helmet>
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

			<h1 className='section-heading'>
				<b>Breaking</b> <b>News</b>
			</h1>

			{/* Top Banner */}
			<div className='top-banner-container'>
				<a
					href='https://lycamobileusa.sjv.io/c/5513478/2107177/25589'
					target='_blank'
					rel='noopener noreferrer'
					className='TopBanner'
				>
					<img
						src='/images/shoppinganddeals/Lyca-Mobile-728x90.webp'
						alt='Lyca Mobile Banner'
						className='TopBannerImage'
						loading='eager'
						width='728'
						height='90'
						{...{ fetchpriority: "high" }}
					/>
				</a>
			</div>

			{/* News Posts */}
			<div className='content-wrapper'>
				{currentPosts.map((post, index) => (
					<React.Fragment key={post.id}>
						<Link
							to={`/breaking-news/${post.id}`}
							style={{ textDecoration: "none" }}
						>
							<BlogPostCard
								id={post.id}
								headline={post.headline}
								image={post.image}
								content={
									post.content[0]?.text?.split(". ").slice(0, 2).join(". ") +
										"." || "No description available"
								}
								author={{ name: post.author.name }}
								datePublished={post.datePublished}
								dateModified={post.dateModified}
							/>
						</Link>

						{/* Insert ad after every two posts */}
						{index > 0 && index % 2 === 1 && (
							<div className='postings-container'>
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
					</React.Fragment>
				))}
			</div>

			{/* Pagination */}
			<PaginationContainer
				totalItems={localNews.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>

			{/* Bottom Banner */}
			<div className='postings-container'>
				<ins
					className='adsbygoogle-banner'
					style={{
						display: "block",
						width: "728px",
						height: "90px",
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
