import React, { useEffect, useState, useRef } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import AdComponent from "../../../components/AdComponent";
import PaginationContainer from "../../../components/PaginationContainer";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "./CommonStyles.css";

const Budget: React.FC = () => {
	const [budgetPosts, setBudgetPosts] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);
	const location = useLocation();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/budgetdata.json");
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const data = await response.json();
				setBudgetPosts(data);
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

	const getExcerpt = (content: any[]) => {
		const firstSection = content[0];
		let excerpt = firstSection.text || "";

		if (excerpt.length > 200) {
			excerpt = excerpt.substring(0, 200) + "...";
		}

		return excerpt;
	};

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
			{i % 2 === 0 && (
				<div className='ad-row-container'>
					<AdComponent width={660} height={440} />
				</div>
			)}

			{i % 1 === 0 && (
				<div className='mobile-ad-container'>
					<AdComponent width={320} height={320} />
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
									/>
									<button className='topbanner-button'>
										Click Here To Get Your Free Trial
									</button>{" "}
									{/* Updated button name and text */}
								</a>
							</div>
							<h2 className='section-heading'>Budget Guides</h2>
							<div className='content-wrapper'>{items}</div>
							<PaginationContainer
								totalItems={budgetPosts.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
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
