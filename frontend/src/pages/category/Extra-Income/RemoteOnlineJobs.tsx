import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import BlogPostCard from "../../../components/BlogPostCard";
import BlogPostContent from "../../../components/BlogPostContent";
import PaginationContainer from "../../../components/PaginationContainer";
import "./CommonStyles.css";

interface RemoteJob {
	id: string;
	headline: string;
	image: {
		url: string;
		caption: string;
	};
	content: { text: string }[];
	author: {
		name: string;
	};
	datePublished: string;
	dateModified?: string;
}

const RemoteOnlineJobs: React.FC = () => {
	const [remoteJobs, setRemoteJobs] = useState<RemoteJob[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("http://localhost:5000/api/remote-jobs");
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: RemoteJob[] = await response.json();
				setRemoteJobs(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		if (remoteJobs.length === 0) fetchData();
	}, [remoteJobs.length]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		let excerpt = firstSection?.text || "";
		return excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt;
	};

	const currentPosts = remoteJobs.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	return (
		<div className='page-container'>
			<Helmet>
				<title>Remote Online Jobs | Work from Home & Freelance Gigs</title>
				<meta
					name='description'
					content='Find the best remote jobs, freelance gigs, and online work opportunities. Work from home and earn a stable income in 2024.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/extra-income/remote-Jobs'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Remote Online Jobs - Work from Home & Freelance Gigs",
						url: "https://www.dollarsandlife.com/extra-income/remote-Jobs",
						description:
							"Find the best remote jobs, freelance gigs, and online work opportunities. Work from home and earn a stable income in 2024.",
						publisher: {
							"@type": "Organization",
							name: "Dollars & Life",
							logo: {
								"@type": "ImageObject",
								url: "/images/favicon/favicon.webp",
							},
						},
					})}
				</script>
			</Helmet>

			<Routes>
				<Route
					path='/'
					element={
						<>
							<h1>Remote Online Jobs</h1>

							<div className='content-wrapper'>
								{currentPosts.map((post) => (
									<BlogPostCard
										key={post.id}
										id={post.id}
										headline={post.headline}
										image={post.image}
										content={getExcerpt(post.content)}
										author={post.author}
										datePublished={post.datePublished}
										dateModified={post.dateModified}
										canonicalUrl={`https://www.dollarsandlife.com/extra-income/remote-Jobs/${post.id}`}
										linkTo={`/extra-income/remote-Jobs/${post.id}`}
									/>
								))}
							</div>

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
