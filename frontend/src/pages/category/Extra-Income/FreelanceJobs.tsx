import React, { useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "./CommonStyles.css";

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

	useEffect(() => {
		if (pageRef.current) {
			pageRef.current.scrollIntoView({ behavior: "smooth" });
		}
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
									/>
									<button className='topbanner-button'>Free Trial</button>
								</a>
							</div>
							<h1>Freelancers Opportunities</h1>
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
										{i > 0 && i % 2 === 1 && (
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
										)}
									</React.Fragment>
								))}
							</div>
							<PaginationContainer
								totalItems={freelanceJobs.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
							<div className='postings-container'>
								<ins
									className='adsbygoogle'
									style={{ display: "block" }}
									data-ad-client='ca-pub-2295073683044412'
									data-ad-slot='YOUR_BOTTOM_AD_SLOT'
									data-ad-format='auto'
									data-full-width-responsive='true'
								></ins>
							</div>
							<script>
								{`(adsbygoogle = window.adsbygoogle || []).push({});`}
							</script>
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
