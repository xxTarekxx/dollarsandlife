import React, { useEffect, useRef, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import AdComponent from "../../../components/AdComponent";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import PaginationContainer from "../../../components/PaginationContainer";
import "./CommonStyles.css";

const SideHustles: React.FC = () => {
	const [sideHustles, setSideHustles] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Side Hustles";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/sidehustles.json");
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const data = await response.json();
				setSideHustles(data);
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
		let excerpt = firstSection.text || "";

		// Limit the excerpt to the first 200 characters or less
		if (excerpt.length > 200) {
			excerpt = excerpt.substring(0, 200) + "...";
		}

		return excerpt;
	};

	const currentPosts = sideHustles.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const items = [];
	for (let i = 0; i < currentPosts.length; i++) {
		items.push(
			<div className='row-container' key={currentPosts[i].id}>
				<Link to={`/extra-income/side-hustles/${currentPosts[i].id}`}>
					<BlogPostCard
						id={currentPosts[i].id}
						title={currentPosts[i].title}
						imageUrl={currentPosts[i].imageUrl}
						content={getExcerpt(currentPosts[i].content)}
						author={currentPosts[i].author}
						datePosted={currentPosts[i].datePosted}
					/>
				</Link>
			</div>,
		);

		if (i > 0 && i % 2 === 0) {
			items.push(
				<div className='ad-row-container' key={`ad-row-${i}`}>
					<AdComponent width={660} height={440} />
				</div>,
			);
		}

		if (i % 2 === 0) {
			items.push(
				<div className='mobile-box-ad-container' key={`mobile-box-ad-${i}`}>
					<AdComponent width={250} height={250} />
				</div>,
			);
		}

		if (i % 4 === 0) {
			items.push(
				<div className='mobile-ad-container' key={`mobile-ad-${i}`}>
					<AdComponent width={320} height={100} />
				</div>,
			);
		}
	}

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
							<h1 className='section-heading'>Side Hustles</h1>
							<div className='content-wrapper'>{items}</div>
							<PaginationContainer
								totalItems={sideHustles.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</>
					}
				/>
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='sidehustles.json' />}
				/>
			</Routes>
		</div>
	);
};

export default SideHustles;
