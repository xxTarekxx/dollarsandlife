import React, { useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import "../../../components/AdComponent.css";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "./CommonStyles.css";

interface MoneyMakingApp {
	id: string;
	title: string;
	imageUrl: string;
	content?: { text: string }[]; // Optional to prevent undefined errors
	author: string;
	datePosted: string;
}

const MoneyMakingApps: React.FC = () => {
	const [apps, setApps] = useState<MoneyMakingApp[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);
	const location = useLocation();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/moneymakingapps.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: MoneyMakingApp[] = await response.json();
				setApps(data || []); // Fallback to empty array if data is undefined
			} catch (error) {
				console.error("Error fetching data:", error);
				setApps([]); // Ensure apps is always an array
			}
		};
		fetchData();
	}, []);

	useEffect(() => {
		const updateTitle = () => {
			const pathSegments = location.pathname.split("/");
			const postId = pathSegments[pathSegments.length - 1];

			if (postId && postId !== "money-making-apps") {
				const post = apps.find((post) => post.id === postId);
				document.title = post ? post.title : "Money Making Apps";
			} else {
				document.title = "Money Making Apps";
			}
		};
		updateTitle();
	}, [apps, location.pathname]);

	// Fix: Ensure safe access to content
	const getExcerpt = (content?: { text: string }[]): string => {
		if (!content || content.length === 0) return "No content available."; // Prevent undefined errors
		const firstSection = content[0]?.text || "";
		return firstSection.length > 200
			? `${firstSection.substring(0, 200)}...`
			: firstSection;
	};

	const currentPosts = apps.slice(
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
							<h1>Money Making Apps</h1>
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
								{currentPosts.length > 0 ? (
									currentPosts.map((post, i) => (
										<React.Fragment key={post.id || `post-${i}`}>
											<div className='row-container'>
												<Link to={`/extra-income/money-making-apps/${post.id}`}>
													<BlogPostCard
														key={post.id || `post-card-${i}`} // Ensuring unique key
														id={post.id || `fallback-${i}`} // Prevent undefined id issues
														title={post.title || "Untitled"}
														imageUrl={post.imageUrl || ""}
														content={getExcerpt(post.content)}
														author={post.author || "Unknown"}
														datePosted={post.datePosted || "N/A"}
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
														data-ad-client='ca-pub-1079721341426198'
														data-ad-slot='7197282987'
														data-ad-format='auto'
														data-full-width-responsive='true'
													></ins>
												</div>
											)}
										</React.Fragment>
									))
								) : (
									<p>No money-making apps found.</p>
								)}
							</div>
							<PaginationContainer
								totalItems={apps.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
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
							<script>
								{`(adsbygoogle = window.adsbygoogle || []).push({});`}
							</script>
						</>
					}
				/>
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='moneymakingapps.json' />}
				/>
			</Routes>
		</div>
	);
};

export default MoneyMakingApps;
