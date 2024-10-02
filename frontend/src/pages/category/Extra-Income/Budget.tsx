import React, { useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "./CommonStyles.css";

// Defining a BlogPost type for better type safety
interface BlogPost {
	id: string;
	title: string;
	imageUrl: string;
	content: { text: string }[];
	author: string;
	datePosted: string;
}

const Budget: React.FC = () => {
	const [budgetPosts, setBudgetPosts] = useState<BlogPost[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);
	const location = useLocation();

	// Fetch the blog post data
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/budgetdata.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: BlogPost[] = await response.json();
				setBudgetPosts(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	// Scroll to the top when the currentPage changes
	useEffect(() => {
		if (pageRef.current) {
			pageRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [currentPage]);

	// Update the document title based on the selected post
	useEffect(() => {
		const updateTitle = () => {
			const pathSegments = location.pathname.split("/");
			const postId = pathSegments[pathSegments.length - 1];

			if (postId && postId !== "budget") {
				const post = budgetPosts.find((post) => post.id === postId);
				if (post) {
					document.title = post.title;
				}
			} else {
				document.title = "Budget Guides";
			}
		};

		updateTitle();
	}, [budgetPosts, location.pathname]);

	// Extract an excerpt from the first content section
	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		let excerpt = firstSection?.text || "";

		if (excerpt.length > 200) {
			excerpt = `${excerpt.substring(0, 200)}...`;
		}

		return excerpt;
	};

	// Paginate the blog posts
	const currentPosts = budgetPosts.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const items = currentPosts.map((post, i) => (
		<React.Fragment key={post.id}>
			<div className='row-container'>
				<Link to={`/extra-income/budget/${post.id}`}>
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
							srcSet='https://www.ftjcfx.com/image-101252893-15236454 1x, https://www.ftjcfx.com/image-101252893-15236454@2x.jpg 2x'
							width='300'
							height='250'
							alt='Small Ad'
							className='postings-image'
							loading='lazy'
						/>
					</a>
				</div>
			)}
		</React.Fragment>
	));

	return (
		<div className='page-container' ref={pageRef}>
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
										loading='eager'
										srcSet='/images/shoppinganddeals/amazon-banner.webp 1x, /images/shoppinganddeals/amazon-banner@2x.webp 2x'
									/>
									<button className='topbanner-button'>Free Trial</button>
								</a>
							</div>
							<h1 className='section-heading'>Budget Guides</h1>
							<div className='content-wrapper'>{items}</div>
							<PaginationContainer
								totalItems={budgetPosts.length}
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
											srcSet='https://www.ftjcfx.com/image-101252893-14103279 1x, https://www.ftjcfx.com/image-101252893-14103279@2x.jpg 2x'
											alt='Speak a new language fluently fast. Start now!'
											loading='lazy'
										/>
									</a>
								</div>
							</div>
						</>
					}
				/>
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='budgetdata.json' />}
				/>
			</Routes>
		</div>
	);
};

export default Budget;
