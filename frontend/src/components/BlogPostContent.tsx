import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import "./BlogPostContent.css";

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
		<div className='blog-post-container'>
			<h1 className='blog-title'>{blogPost.title}</h1>
			<h2 className='blog-subtitle'>
				{blogPost.author} - {formattedDate}
			</h2>
			<img
				className='blog-image'
				src={blogPost.imageUrl}
				alt={blogPost.title}
			/>
			<p className='blog-paragraph'>{blogPost.content}</p>
			{/* <p className="current-path">Current Path: {location.pathname}</p> */}
		</div>
	);
};

export default BlogPostContent;
