import React, { useEffect, useRef, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import "../../../components/AdComponent.css"; // Import AdComponent CSS
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "../../../components/BlogPostContent.css"; // Import BlogPostContent CSS
import PaginationContainer from "../../../components/PaginationContainer";
import "./StartABlog.css";

const StartABlog: React.FC = () => {
	const [blogPosts, setBlogPosts] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Start A Blog";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/startablogdata.json");
				if (!response.ok) {
					throw new Error(`Failed to fetch data: ${response.statusText}`);
				}
				const data = await response.json();
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

	useEffect(() => {
		if (pageRef.current) {
			pageRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [currentPage]);

	const getExcerpt = (content: any[]) => {
		const firstSection = content[0];
		let excerpt = firstSection?.text || "";

		if (excerpt.length > 200) {
			excerpt = excerpt.substring(0, 200) + "...";
		}

		return excerpt;
	};

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
			{/* Show small ad (300x250) after every 2 rows */}
			{i > 0 && i % 2 === 1 && (
				<div className='postings-container'>
					<a
						href='https://www.kqzyfj.com/click-101252893-15236454'
						target='_blank'
						rel='noopener noreferrer'
					>
						<img
							src='https://www.ftjcfx.com/image-101252893-15236454'
							width='300'
							height='250'
							alt='Small Ad'
							className='postings-image'
						/>
					</a>
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
									href='https://www.amazon.com/amazonprime?primeCampaignId=studentWlpPrimeRedir&linkCode=ll2&tag=dollarsandl0c-20&linkId=879184c8c8106f03c9fbbea8df411e86&language=en_US&ref_=as_li_ss_tl'
									target='_blank'
									rel='noopener noreferrer'
									className='TopBanner'
								>
									<img
										src='/images/shoppinganddeals/amazon-banner.webp'
										alt='Amazon Prime Banner'
										className='TopBannerImage'
									/>
									<button className='topbanner-button'>
										Click Here To Get Your Free Trial
									</button>
								</a>
							</div>
							<h1 className='section-heading'>
								How to Start a Successful Blog in 2024: Step-by-Step Guide for
								Beginners
							</h1>
							<div className='content-wrapper'>{items}</div>
							<PaginationContainer
								totalItems={blogPosts.length}
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
											alt='Speak a new language fluently fast. Start now!'
											width='728'
											height='90'
										/>
									</a>
								</div>
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
