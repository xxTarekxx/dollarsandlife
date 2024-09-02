import React, { useEffect, useState, useRef } from "react";
import { Link, Route, Routes } from "react-router-dom";
import AdComponent from "../../../components/AdComponent";
import PaginationContainer from "../../../components/PaginationContainer";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import "./CommonStyles.css";

const RemoteOnlineJobs: React.FC = () => {
	const [remoteJobs, setRemoteJobs] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Remote Online Jobs";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("../../src/data/remotejobs.json");
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const data = await response.json();
				setRemoteJobs(data);
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
		if (!content || content.length === 0) {
			return ""; // Return an empty string if content is undefined or empty
		}

		const firstSection = content[0];
		let excerpt = firstSection.text || "";

		if (excerpt.length > 200) {
			excerpt = excerpt.substring(0, 200) + "...";
		}

		return excerpt;
	};

	const currentPosts = remoteJobs.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const items = [];
	for (let i = 0; i < currentPosts.length; i++) {
		items.push(
			<div className='row-container' key={currentPosts[i].id}>
				<Link to={`/extra-income/remote-jobs/${currentPosts[i].id}`}>
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
							<div className='top-ad-container'>
								<AdComponent width={728} height={90} />
							</div>
							<h2 className='section-heading'>Remote Online Jobs</h2>
							<div className='content-wrapper'>{items}</div>
							<PaginationContainer
								totalItems={remoteJobs.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
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
