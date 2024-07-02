import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import styled from "styled-components";

const BlogPostContainer = styled.div`
	background-color: white;
	max-width: 800px;
	margin: 20px auto;
	padding: 20px;
	font-family: Arial, sans-serif;
	line-height: 1.6;
	color: #333;

	@media (max-width: 768px) {
		padding: 10px;
		margin: 10px 10px;
	}
`;

const BlogTitle = styled.h1`
	font-size: 2.5em;
	margin-bottom: 0.5em;
	color: #222;

	@media (max-width: 768px) {
		font-size: 2em;
	}
`;

const BlogSubtitle = styled.h2`
	font-size: 1.5em;
	margin: 1em 0;
	color: #555;

	@media (max-width: 768px) {
		font-size: 1.2em;
	}
`;

const BlogParagraph = styled.p`
	margin: 1em 0;
	font-size: 1em;
	color: #666;

	@media (max-width: 768px) {
		font-size: 0.9em;
	}
`;

const BlogImage = styled.img`
	width: 100%;
	max-width: 660px;
	height: 440px;
	object-fit: cover;
	margin: 1em auto; /* Center the image */
	display: block; /* Center the image */

	@media (max-width: 768px) {
		width: 100%;
	}
`;

const BlogQuote = styled.blockquote`
	margin: 1em 0;
	padding: 0.5em 1em;
	border-left: 4px solid #ccc;
	color: #888;
	font-style: italic;

	@media (max-width: 768px) {
		padding: 0.5em;
	}
`;

const BlogList = styled.ul`
	margin: 1em 0;
	padding-left: 20px;
	list-style-type: disc;

	@media (max-width: 768px) {
		padding-left: 15px;
	}
`;

const BlogListItem = styled.li`
	margin: 0.5em 0;

	@media (max-width: 768px) {
		margin: 0.3em 0;
	}
`;

const CurrentPath = styled.p`
	font-size: 0.9em;
	color: #888;
	text-align: center;
	margin-top: 2em;
`;

interface BlogPostData {
	id: number;
	title: string;
	imageUrl: string;
	content: string;
	author: string;
	datePosted: string;
}

const BlogPostContent: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const [blogPost, setBlogPost] = useState<BlogPostData | null>(null);
	const location = useLocation();

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/freelancejobs.json");
				if (!response.ok) {
					throw new Error("Failed to fetch");
				}
				const data = (await response.json()) as BlogPostData[];
				const foundPost = data.find((post) => post.id.toString() === id);
				if (!foundPost) {
					throw new Error("Post not found");
				}
				setBlogPost(foundPost);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, [id]);

	if (!blogPost) {
		return <div>Loading...</div>;
	}

	const formattedDate = new Date(blogPost.datePosted).toLocaleDateString(
		"en-US",
		{
			year: "numeric",
			month: "long",
			day: "numeric",
		},
	);

	return (
		<BlogPostContainer>
			<BlogTitle>{blogPost.title}</BlogTitle>
			<BlogSubtitle>
				{blogPost.author} - {formattedDate}
			</BlogSubtitle>
			<BlogImage src={blogPost.imageUrl} alt={blogPost.title} />
			<BlogParagraph>{blogPost.content}</BlogParagraph>
			{/* <CurrentPath>Current Path: {location.pathname}</CurrentPath> */}
		</BlogPostContainer>
	);
};

export default BlogPostContent;
