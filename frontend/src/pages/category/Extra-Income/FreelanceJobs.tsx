import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import BlogPostContent from "../../../components/articles-content/BlogPostContent";
import BlogPostCard from "../../../components/articles-postcards/BlogPostCard";
import PaginationContainer from "../../../components/pagination/PaginationContainer";
import "./CommonStyles.css";

interface FreelanceJob {
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

const FreelanceJobs: React.FC = () => {
	const [freelanceJobs, setFreelanceJobs] = useState<FreelanceJob[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	useEffect(() => {
		const fetchData = async () => {
			try {
				// 1. URL construction moved to a separate variable 'apiUrl'
				const apiUrl = `${process.env.REACT_APP_API_BASE}/freelance-jobs`;

				// 2. The new console.log to inspect 'apiUrl'
				console.log("Attempting to fetch from (FreelanceJobs.tsx):", apiUrl);

				// 3. 'fetch' now uses the 'apiUrl' variable
				const response = await fetch(apiUrl);

				// Rest of the logic is identical
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: FreelanceJob[] = await response.json();
				setFreelanceJobs(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		if (freelanceJobs.length === 0) fetchData();
	}, [freelanceJobs.length]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		let excerpt = firstSection?.text || "";
		return excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt;
	};

	const currentPosts = freelanceJobs.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, [currentPage]);

	return (
		<div className='page-container'>
			<Helmet>
				<title>Freelance Jobs & Opportunities | Earn Money Online</title>
				<meta
					name='description'
					content='Discover top freelance jobs and online work opportunities. Explore remote work, side gigs, and contract jobs to increase your income.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/extra-income/freelancers'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Freelance Jobs & Opportunities",
						url: "https://www.dollarsandlife.com/extra-income/freelancers",
						description:
							"Discover top freelance jobs and online work opportunities. Explore remote work, side gigs, and contract jobs to increase your income.",
						publisher: {
							"@type": "Organization",
							name: "Dollars & Life",
							logo: {
								"@type": "ImageObject",
								url: "/images/website-logo.webp",
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
							<h1>Freelancers Opportunities</h1>
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
										canonicalUrl={`https://www.dollarsandlife.com/extra-income/freelancers/${post.id}`}
										linkTo={`/extra-income/freelancers/${post.id}`}
									/>
								))}
							</div>

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
					element={<BlogPostContent jsonFile='freelance-jobs' />}
				/>
			</Routes>
		</div>
	);
};

export default FreelanceJobs;
