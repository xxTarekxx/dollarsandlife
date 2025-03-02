import React, { useEffect, useRef, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "./StartABlog.css";

// Define a type for blog post data
interface BlogPost {
	id: string;
	title: string;
	imageUrl: string;
	content: { text: string }[];
	author: string;
	datePosted: string;
}

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

const StartABlog: React.FC = () => {
	const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);
	const firstRender = useRef(true); // Track first render

	// Set the page title
	useEffect(() => {
		document.title = "Start A Blog";
	}, []);

	// Fetch the blog post data
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/startablogdata.json");
				if (!response.ok) {
					throw new Error(`Failed to fetch data: ${response.statusText}`);
				}
				const data: BlogPost[] = await response.json();
				if (Array.isArray(data)) {
					setBlogPosts(data);
				} else {
					console.error("Invalid data format: Expected an array.");
				}
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	// ✅ Absolutely prevent any unwanted scrolling
	// useEffect(() => {
	// 	if (!firstRender.current) {
	// 		// Allow scroll only when changing pages
	// 		setTimeout(() => {
	// 			if (pageRef.current) {
	// 				window.scrollTo({
	// 					top: pageRef.current.offsetTop,
	// 					behavior: "smooth",
	// 				});
	// 			}
	// 		}, 50);
	// 	}
	// 	firstRender.current = false; // Mark first render as done
	// }, [currentPage]);

	// useEffect(() => {
	// 	if (!firstRender.current) {
	// 		requestAnimationFrame(() => {
	// 			if (pageRef.current) {
	// 				// Get the navbar height including margins, paddings, and potential misalignment
	// 				const navbar = document.querySelector(".nav");
	// 				let navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;

	// 				// Additional correction for extra padding/margins
	// 				const correctionOffset = 10; // Adjust this value as needed

	// 				// Scroll exactly below the navbar with correction
	// 				window.scrollTo({
	// 					top: pageRef.current.offsetTop - navbarHeight - correctionOffset,
	// 					behavior: "smooth",
	// 				});
	// 			}
	// 		});
	// 	}
	// 	firstRender.current = false;
	// }, [currentPage]);

	// ✅ Completely remove auto-scrolling
	useEffect(() => {
		// Do nothing (no scrolling at all)
	}, [currentPage]);

	// Load Google Ads after component mounts
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

	// Extract excerpt from content
	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		let excerpt = firstSection?.text || "";

		if (excerpt.length > 200) {
			excerpt = `${excerpt.substring(0, 200)}...`;
		}

		return excerpt;
	};

	// Paginate blog posts
	const currentPosts = blogPosts.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const items = currentPosts.map((post, i) => (
		<React.Fragment key={post.id}>
			<div className='row-container'>
				<Link to={`/start-a-blog/${post.id}`}>
					<BlogPostCard
						id={post.id}
						title={post.title}
						imageUrl={post.imageUrl}
						content={getExcerpt(post.content)}
						author={post.author}
						datePosted={post.datePosted}
					/>
				</Link>
			</div>
			{i > 0 && i % 2 === 1 && (
				<div className='postings-container'>
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
		<div className='blog-main-container' ref={pageRef}>
			<Routes>
				<Route
					path='/'
					element={
						<>
							<div className='top-banner-container'>
								<a
									href='https://www.amazon.com/amazonprime?primeCampaignId=studentWlpPrimeRedir&linkCode=ll2&tag=dollarsandl02-20&linkId=879184c8c8106f03c9fbbea8df411e86&language=en_US&ref_=as_li_ss_tl'
									target='_blank'
									rel='noopener noreferrer'
									className='TopBanner'
								>
									<img
										src='/images/shoppinganddeals/amazon-banner.webp'
										alt='Amazon Prime Banner'
										className='TopBannerImage'
										loading='eager'
									/>
									<button className='topbanner-button'>Free Trial</button>
								</a>
							</div>
							<h1>
								How to Start a Successful Blog in 2025
								<br /> Step-by-Step Guide for Beginners
							</h1>
							<div className='content-wrapper'>{items}</div>
							<PaginationContainer
								totalItems={blogPosts.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
							<div className='postings-container'>
								<ins
									className='adsbygoogle'
									style={{
										display: "block",
										width: "300px",
										height: "250px",
										minWidth: "300px",
										minHeight: "250px",
									}}
									data-ad-client='ca-pub-2295073683044412'
									data-ad-slot='9380614635'
									data-ad-format='rectangle'
									data-full-width-responsive='false'
								/>
							</div>
						</>
					}
				/>
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='startablogdata.json' />}
				/>
			</Routes>
		</div>
	);
};

export default StartABlog;
