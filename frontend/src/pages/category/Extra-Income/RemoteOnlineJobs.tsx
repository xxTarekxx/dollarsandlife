import React, { useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "./CommonStyles.css";

// Define a type for remote job posts
interface RemoteJob {
	id: string;
	title: string;
	imageUrl: string;
	content: { text: string }[];
	author: string;
	datePosted: string;
}

const RemoteOnlineJobs: React.FC = () => {
	const [remoteJobs, setRemoteJobs] = useState<RemoteJob[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);
	const location = useLocation();

	// Fetch job posts data
	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/remotejobs.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: RemoteJob[] = await response.json();
				setRemoteJobs(data);
			} catch (error) {
				console.error("Error fetching data:", error);
				setRemoteJobs([]);
			}
		};

		fetchData();
	}, []);

	// Scroll to the top when currentPage changes
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

			if (postId && postId !== "remote-online-jobs") {
				const post = remoteJobs.find((post) => post.id === postId);
				if (post) {
					document.title = post.title;
				}
			} else {
				document.title = "Remote Online Jobs";
			}
		};

		updateTitle();
	}, [remoteJobs, location.pathname]);

	// Extracts an excerpt from the first content section
	const getExcerpt = (content: { text: string }[]): string => {
		if (!content || content.length === 0) return "";

		const firstSection = content[0];
		let excerpt = firstSection?.text || "";

		if (excerpt.length > 200) {
			excerpt = `${excerpt.substring(0, 200)}...`;
		}

		return excerpt;
	};

	// Paginate the job posts
	const currentPosts = remoteJobs.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	// Render job posts and ads
	const items = currentPosts.map((post, i) => (
		<React.Fragment key={post.id}>
			<div className='row-container'>
				<Link to={`/extra-income/remote-jobs/${post.id}`}>
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
									href='https://www.amazon.com/amazonprime?primeCampaignId=studentWlpPrimeRedir&linkCode=ll2&tag=dollarsandl02-20&linkId=879184c8c8106f03c9fbbea8df411e86&language=en_US&ref_=as_li_ss_tl'
									target='_blank'
									rel='noopener noreferrer'
									className='TopBanner'
								>
									<img
										src='/images/shoppinganddeals/amazon-banner.webp'
										alt='Amazon Prime Banner'
										className='TopBannerImage'
										loading='eager' // Load important banner eagerly
										srcSet='/images/shoppinganddeals/amazon-banner.webp 1x, /images/shoppinganddeals/amazon-banner@2x.webp 2x'
									/>
									<button className='topbanner-button'>Free Trial</button>
								</a>
							</div>
							<h1>Remote Online Jobs</h1>
							<div className='content-wrapper'>{items}</div>
							<PaginationContainer
								totalItems={remoteJobs.length}
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
											width='728'
											height='90'
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
					element={<BlogPostContent jsonFile='remotejobs.json' />}
				/>
			</Routes>
		</div>
	);
};

export default RemoteOnlineJobs;
