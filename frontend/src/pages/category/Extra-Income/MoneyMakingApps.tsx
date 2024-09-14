import React, { useEffect, useRef, useState } from "react";
import { Link, Route, Routes, useLocation } from "react-router-dom";
import AdComponent from "../../../components/AdComponent";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import PaginationContainer from "../../../components/PaginationContainer";
import "./CommonStyles.css";

const MoneyMakingApps: React.FC = () => {
	const [apps, setApps] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);
	const location = useLocation();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/moneymakingapps.json");
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const data = await response.json();
				if (Array.isArray(data)) {
					setApps(data);
				} else {
					console.error("Fetched data is not an array:", data);
					setApps([]);
				}
			} catch (error) {
				console.error("Error fetching data:", error);
				setApps([]);
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

			if (postId && postId !== "money-making-apps") {
				const post = apps.find((post) => post.id === postId);
				if (post) {
					document.title = post.title;
				}
			} else {
				document.title = "Money Making Apps";
			}
		};

		updateTitle();
	}, [apps, location.pathname]);

	const getExcerpt = (content: any[]) => {
		if (!content || content.length === 0) {
			return "";
		}

		const firstSection = content[0];
		let excerpt = firstSection.text || "";

		if (excerpt.length > 200) {
			excerpt = excerpt.substring(0, 200) + "...";
		}

		return excerpt;
	};

	const currentPosts = apps.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const items = currentPosts.map((post, i) => (
		<React.Fragment key={post.id}>
			<div className='row-container'>
				<Link to={`/extra-income/money-making-apps/${post.id}`}>
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
							</a>
							<h2 className='section-heading'>Money Making Apps</h2>
							<div className='content-wrapper'>{items}</div>
							<PaginationContainer
								totalItems={apps.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
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
