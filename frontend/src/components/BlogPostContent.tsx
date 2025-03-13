import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import "../pages/category/Extra-Income/CommonStyles.css";
import "./AdComponent.css";
import "./BlogPostContent.css";
import FiverrWidget from "./FiverrWidget";

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

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

const BlogPostContent: React.FC<BlogPostContentProps> = ({ jsonFile }) => {
	const { id: postId } = useParams<{ id: string }>();
	const location = useLocation();
	const [post, setPost] = useState<BlogPost | null>(null);
	const [forceRender, setForceRender] = useState(0); // Used to force re-render

	useEffect(() => {
		const fetchPost = async () => {
			try {
				console.log(
					`Fetching data from: /data/${jsonFile} for post ID: ${postId}`,
				);
				const response = await fetch(`/data/${jsonFile}`);
				if (!response.ok) throw new Error("Failed to fetch post");

				const data: BlogPost[] = await response.json();
				const postData = data.find((item) => item.id === postId);
				if (!postData) throw new Error("Post not found");

				console.log("Post Data:", postData);
				setPost(postData);

				// Force re-render to ensure layout updates
				setForceRender((prev) => prev + 1);
			} catch (error) {
				console.error("Error fetching post:", error);
			}
		};

		fetchPost();
	}, [postId, jsonFile]);

	if (!post) {
		return <div>Loading...</div>;
	}

	console.log("Rendering BlogPostContent...", post.title);

	return (
		<div key={forceRender} className='page-container'>
			<div className='blog-post-content'>
				<h1>{post.title}</h1>
				<div className='image-box'>
					<img
						src={post.imageUrl}
						alt={post.title}
						className='main-image'
						loading='lazy'
					/>
				</div>
				<div className='author-date'>
					<p className='author'>By: {post.author}</p>
					<p className='date'>
						{new Date(post.datePosted).toLocaleDateString()}
					</p>
				</div>
				<div className='top-banner-container'>
					<a
						href='https://lycamobileusa.sjv.io/c/5513478/2107177/25589'
						target='_blank'
						rel='noopener noreferrer'
						className='TopBanner'
					>
						<img
							src='/images/shoppinganddeals/Lyca-Mobile-728x90.webp'
							alt='Lyca Mobile Banner'
							className='TopBannerImage'
							loading='lazy'
						/>
					</a>
				</div>
				{post.content && post.content.length > 0 ? (
					post.content.map((section, index) => (
						<div key={index} className='content-section'>
							{section.subtitle && <h2>{section.subtitle}</h2>}
							{section.text && (
								<p dangerouslySetInnerHTML={{ __html: section.text }} />
							)}
							{section.details && (
								<p
									className='details'
									dangerouslySetInnerHTML={{ __html: section.details }}
								/>
							)}
							{section.imageUrl && (
								<img
									src={section.imageUrl}
									alt=''
									className='section-image'
									loading='lazy'
								/>
							)}
							{section.bulletPoints && (
								<ul>
									{section.bulletPoints.map((point, i) => (
										<li key={i} dangerouslySetInnerHTML={{ __html: point }} />
									))}
								</ul>
							)}
							{section.numberedPoints && (
								<ol>
									{section.numberedPoints.map((point, i) => (
										<li key={i} dangerouslySetInnerHTML={{ __html: point }} />
									))}
								</ol>
							)}
							{section.subtitle ===
								"How Your Profile Would Look on Fiverr As A Seller" && (
								<FiverrWidget />
							)}
							{/* Insert ad after every 2nd section */}
							{index % 2 === 1 && (
								<div className='postings-container'>
									<ins
										className='adsbygoogle'
										style={{
											display: "block",
											width: "300px",
											height: "250px",
											minWidth: "300x",
											minHeight: "250px",
										}}
										data-ad-client='ca-pub-1079721341426198'
										data-ad-slot='7197282987'
										data-ad-format='auto'
										data-full-width-responsive='true'
									></ins>
									<script
										dangerouslySetInnerHTML={{
											__html:
												"(adsbygoogle = window.adsbygoogle || []).push({});",
										}}
									/>
								</div>
							)}
						</div>
					))
				) : (
					<div>No content available.</div>
				)}
			</div>
		</div>
	);
};

export default BlogPostContent;
