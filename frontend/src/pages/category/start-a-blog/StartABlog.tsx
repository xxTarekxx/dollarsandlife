import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AdComponent from "../../../components/AdComponent";
import BlogPostCard from "../../../components/BlogPostCard";
import Breadcrumb from "../../../components/Breadcrumb";
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
				const response = await fetch("/blogposts.json");
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const data = await response.json();
				setBlogPosts(data);
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

	const currentPosts = blogPosts.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const breadcrumbPaths = [
		{ title: "Home", url: "/" },
		{ title: "Start A Blog", url: "/category/start-a-blog" },
	];

	const items = [];
	for (let i = 0; i < currentPosts.length; i++) {
		items.push(
			<div className='row-container' key={currentPosts[i].id}>
				<Link to={`/category/start-a-blog/${currentPosts[i].id}`}>
					<BlogPostCard
						id={currentPosts[i].id}
						title={currentPosts[i].title}
						imageUrl={currentPosts[i].imageUrl}
						content={currentPosts[i].content}
						author={currentPosts[i].author}
						datePosted={currentPosts[i].datePosted}
					/>
				</Link>
			</div>,
		);
		if ((i + 1) % 2 === 0) {
			items.push(
				<div className='ad-row-container' key={`ad-row-${i}`}>
					<AdComponent width={660} height={440} />
				</div>,
			);
		}
	}

	return (
		<div className='blog-main-container' ref={pageRef}>
			<div className='top-ad-container'>
				<AdComponent width={728} height={90} />
			</div>
			<h2 className='section-heading'>Start A Blog</h2>
			<div className='content-wrapper'>{items}</div>
			<PaginationContainer
				totalItems={blogPosts.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</div>
	);
};

export default StartABlog;
