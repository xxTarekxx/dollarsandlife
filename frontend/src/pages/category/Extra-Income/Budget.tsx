import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Route, Routes } from "react-router-dom";
import BlogPostContent from "../../../components/articlecontent/BlogPostContent";
import PaginationContainer from "../../../components/pagination/PaginationContainer";
import BlogPostCard from "../../../components/postcards/BlogPostCard";
import "./CommonStyles.css";

interface BlogPost {
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

const Budget: React.FC = () => {
	const [budgetPosts, setBudgetPosts] = useState<BlogPost[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch(
					`${process.env.REACT_APP_API_BASE}/budget-data`,
				);
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: BlogPost[] = await response.json();
				setBudgetPosts(data);
			} catch (error) {
				console.error("Error fetching budget posts:", error);
			}
		};
		if (budgetPosts.length === 0) fetchData();
	}, [budgetPosts.length]);

	const getExcerpt = (content: { text: string }[]): string => {
		const firstSection = content[0];
		let excerpt = firstSection?.text || "";
		return excerpt.length > 120 ? `${excerpt.substring(0, 120)}...` : excerpt;
	};

	const currentPosts = budgetPosts.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	return (
		<div className='page-container'>
			<Helmet>
				<title>Budget Guides - Smart Financial Planning</title>
				<meta
					name='description'
					content='Discover expert budgeting tips, financial planning strategies, and money-saving techniques. Manage your finances smarter with our guides!'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/extra-income/budget/'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: budgetPosts.map((post, index) => ({
							"@type": "Article",
							position: index + 1,
							headline: post.headline,
							image: post.image.url,
							author: { "@type": "Organization", name: post.author.name },
							datePublished: post.datePublished,
							url: `https://www.dollarsandlife.com/extra-income/budget/${post.id}`,
						})),
					})}
				</script>
			</Helmet>

			<Routes>
				<Route
					path='/'
					element={
						<>
							<h1>Budget Guides</h1>

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
										canonicalUrl={`https://www.dollarsandlife.com/extra-income/budget/${post.id}`}
										linkTo={`/extra-income/budget/${post.id}`}
									/>
								))}
							</div>

							<PaginationContainer
								totalItems={budgetPosts.length}
								itemsPerPage={postsPerPage}
								currentPage={currentPage}
								setCurrentPage={setCurrentPage}
							/>
						</>
					}
				/>
				<Route
					path=':id'
					element={<BlogPostContent jsonFile='budget-data' />}
				/>
			</Routes>
		</div>
	);
};

export default Budget;
