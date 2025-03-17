import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "../../../components/AdComponent.css";
import "../../../components/BlogPostContent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import PaginationContainer from "../../../components/PaginationContainer";
import "../Extra-Income/CommonStyles.css";

// Define interface for blog post, adjusting for image object and author object
interface BlogPost {
	id: string;
	title: string;
	author: {
		name: string; // Author is now an object with name
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
	const postsPerPage = 4; // Number of articles per page
	const pageRef = useRef<HTMLDivElement>(null);

	// Fetch breaking news from JSON file
	const fetched = useRef(false);

	useEffect(() => {
		if (fetched.current) return; // Prevent second fetch
		fetched.current = true;

		const fetchLocalNews = async () => {
			try {
				const response = await fetch("/data/breakingnews.json");
				if (!response.ok) {
					throw new Error("Failed to load breaking news data.");
				}

				let data = await response.json();
				console.log("Fetched Breaking News Data:", data);

				const newsArray = Array.isArray(data) ? data : [data];
				setLocalNews(newsArray);
			} catch (error) {
				console.error("Error fetching local news:", error);
			}
		};

		fetchLocalNews();
	}, []);

	// Get the current page's news items
	const indexOfLastPost = currentPage * postsPerPage;
	const indexOfFirstPost = indexOfLastPost - postsPerPage;
	const currentPosts = localNews.slice(indexOfFirstPost, indexOfLastPost);

	return (
		<div className='news-main-container' ref={pageRef}>
			<Helmet>
				<title>Breaking News - Latest Financial and Economic Updates</title>
				<meta
					name='description'
					content='Stay updated with the latest financial, business, and economic breaking news. Get insights, analysis, and top trending stories.'
				/>
			</Helmet>

			<h1 className='section-heading'>
				<b>Breaking</b> <b>News</b>
			</h1>
			<div className='top-banner-container'>
				<a
					href='https://lycamobileusa.sjv.io/c/5513478/2107177/25589'
					target='_blank'
					rel='noopener noreferrer'
					className='TopBanner'
				>
					<img
						src='/images/shoppinganddeals/Lyca-Mobile-728x90.webp'
						alt='Lyca Mobile Banner - Affordable International Calling'
						className='TopBannerImage'
						loading='eager'
					/>
				</a>
			</div>

			{/* Local Breaking News (From JSON) */}
			<div className='content-wrapper'>
				{currentPosts.map((post) => (
					<Link
						key={post.id}
						to={`/breaking-news/${post.id}`}
						style={{ textDecoration: "none" }}
					>
						<BlogPostCard
							id={post.id}
							title={post.title}
							image={post.image} // Pass the image object correctly
							content={
								post.content[0]?.text?.split(". ").slice(0, 2).join(". ") +
									"." || "No description available"
							}
							author={{ name: post.author.name }} // Fix: pass author as an object with 'name' key
							datePublished={post.datePublished}
							dateModified={post.dateModified}
						/>
					</Link>
				))}
			</div>

			{/* Pagination */}
			<PaginationContainer
				totalItems={localNews.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>

			{/* Bottom Banner Ad */}
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
			<script
				dangerouslySetInnerHTML={{
					__html: "(adsbygoogle = window.adsbygoogle || []).push({});",
				}}
			/>
		</div>
	);
};

export default BreakingNews;
