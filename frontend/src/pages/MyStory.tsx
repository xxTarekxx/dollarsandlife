import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import AdComponent from "../components/AdComponent";
import "../components/BlogPostContent.css";

interface BlogPostContentProps {
	jsonFile: string;
}

interface PostContent {
	subtitle?: string;
	text?: string;
	details?: string;
	imageUrl?: string;
	bulletPoints?: string[];
	numberedPoints?: string[];
	htmlContent?: string;
}

interface BlogPost {
	id: string;
	title: string;
	author: string;
	datePosted: string;
	imageUrl: string;
	content: PostContent[];
}

const BlogPostContent: React.FC<BlogPostContentProps> = ({ jsonFile }) => {
	const [post, setPost] = useState<BlogPost | null>(null);

	useEffect(() => {
		const fetchPost = async () => {
			try {
				const response = await fetch(`/data/${jsonFile}`);
				if (!response.ok) {
					throw new Error("Failed to fetch post");
				}
				const data: BlogPost[] = await response.json();

				if (Array.isArray(data) && data.length > 0) {
					setPost(data[0]);
				} else {
					throw new Error("Post not found");
				}
			} catch (error) {
				console.error("Error fetching post:", error);
			}
		};

		fetchPost();
	}, [jsonFile]);

	if (!post) {
		return <div>Loading...</div>;
	}

	let contentSections: JSX.Element[] = [];

	post.content.forEach((section, index) => {
		const sectionElements: JSX.Element[] = [];

		if (section.subtitle) {
			sectionElements.push(
				<h2 key={`subtitle-${index}`}>{section.subtitle}</h2>,
			);
		}

		if (section.text) {
			sectionElements.push(
				<p
					key={`text-${index}`}
					dangerouslySetInnerHTML={{ __html: section.text }}
				/>,
			);
		}

		if (section.details) {
			sectionElements.push(
				<p
					key={`details-${index}`}
					className='details'
					dangerouslySetInnerHTML={{ __html: section.details }}
				/>,
			);
		}

		if (section.imageUrl) {
			sectionElements.push(
				<img
					key={`image-${index}`}
					src={section.imageUrl}
					alt=''
					className='section-image'
				/>,
			);
		}

		if (section.bulletPoints) {
			sectionElements.push(
				<ul key={`bulletPoints-${index}`}>
					{section.bulletPoints.map((point, i) => (
						<li
							key={`bullet-${i}`}
							dangerouslySetInnerHTML={{ __html: point }}
						/>
					))}
				</ul>,
			);
		}

		contentSections.push(
			<div key={`content-section-${index}`} className='content-section'>
				{sectionElements}
			</div>,
		);
	});

	return (
		<div className='blog-post-content'>
			<Helmet>
				<title>{post.title} - Dollars And Life</title>
				<meta
					name='description'
					content={`Read ${post.title} by ${post.author}`}
				/>
				<meta property='og:title' content={post.title} />
				<meta
					property='og:description'
					content={`Read ${post.title} by ${post.author}`}
				/>
				<meta property='og:image' content={post.imageUrl} />
				<meta
					property='og:url'
					content={`https://www.dollarsandlife.com/my-story`}
				/>
			</Helmet>

			{/* Main Heading */}
			<h1>{post.title}</h1>

			<div className='image-box'>
				<img src={post.imageUrl} alt={post.title} className='main-image' />
			</div>

			<div className='author-date'>
				<p className='author'>By: {post.author}</p>
				<p className='date'>{new Date(post.datePosted).toLocaleDateString()}</p>
			</div>

			{contentSections}

			<div className='postings-container'>
				<AdComponent width={728} height={90} />
			</div>
		</div>
	);
};

export default BlogPostContent;
