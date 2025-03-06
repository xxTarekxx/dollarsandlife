import React, { useEffect, useState, useRef } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import "../../../components/AdComponent.css";
import "../../../components/BlogPostContent.css";
import "./CommonStyles.css";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import PaginationContainer from "../../../components/PaginationContainer";

interface FreelanceJob {
	id: string;
	title: string;
	imageUrl: string;
	content: { text: string }[];
	author: string;
	datePosted: string;
}

const FreelanceJobs: React.FC = () => {
	const [freelanceJobs, setFreelanceJobs] = useState<FreelanceJob[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);
	const location = useLocation();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/freelancejobs.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: FreelanceJob[] = await response.json();
				setFreelanceJobs(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	// Remove auto-scrolling – nothing happens here.
	useEffect(() => {
		// Do nothing
	}, [currentPage]);

	useEffect(() => {
		const updateTitle = () => {
			const pathSegments = location.pathname.split("/");
			const postId = pathSegments[pathSegments.length - 1];
			if (postId && postId !== "freelancers") {
				const post = freelanceJobs.find((post) => post.id === postId);
				if (post) {
					document.title = post.title;
				}
			} else {
				document.title = "Freelancers";
			}
		};

		updateTitle();
	}, [freelanceJobs, location.pathname]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		let excerpt = firstSection?.text || "";
		return excerpt.length > 200 ? `${excerpt.substring(0, 200)}...` : excerpt;
	};

	const currentPosts = freelanceJobs.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	return (
		<div className='page-container' ref={pageRef}>
			<Routes>
				<Route
					path='/'
					element={
						<>
							<h1>Freelancers Opportunities</h1>
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
									/>
								</a>
							</div>
							<div className='content-wrapper'>
								{currentPosts.map((post, i) => (
									<React.Fragment key={post.id}>
										<div className='row-container'>
											<Link to={`/extra-income/freelancers/${post.id}`}>
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
										{/* Insert ad after every two posts */}
										{i > 0 && i % 2 === 1 && (
											<div className='postings-container'>
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
												<script
													dangerouslySetInnerHTML={{
														__html:
															"(adsbygoogle = window.adsbygoogle || []).push({});",
													}}
												/>
											</div>
										)}
									</React.Fragment>
								))}
							</div>
							{/* Bottom ad */}
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
							<script
								dangerouslySetInnerHTML={{
									__html: "(adsbygoogle = window.adsbygoogle || []).push({});",
								}}
							/>
							<PaginationContainer
								totalItems={freelanceJobs.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</>
					}
				/>
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='freelancejobs.json' />}
				/>
			</Routes>
		</div>
	);
};

export default FreelanceJobs;
