import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "react-router-dom";
import "./BlogPostContent.css";

interface BlogPostContentProps {
	jsonFile: string;
}

interface PostContent {
	subtitle?: string;
	text?: string;
	details?: string;
	image?: string;
	bulletPoints?: string[];
	numberedPoints?: string[];
	htmlContent?: string;
}

interface BlogPost {
	id: string;
	headline: string;
	author: {
		name: string;
	};
	datePublished: string;
	dateModified?: string;
	image: {
		url: string;
		caption: string;
	};
	content: PostContent[];
}

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

const BlogPostContent: React.FC<BlogPostContentProps> = React.memo(
	({ jsonFile }) => {
		const { id: postId } = useParams<{ id: string }>();
		const [post, setPost] = useState<BlogPost | null>(null);
		const isFetching = useRef(false);

		// ✅ Push AdSense ads after ads script is loaded
		useEffect(() => {
			if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
				try {
					window.adsbygoogle.push({});
				} catch (e) {
					console.error("Adsense Error:", e);
				}
			}
		}, []);

		const fetchPost = useMemo(
			() => async () => {
				if (!postId || isFetching.current) return;

				isFetching.current = true;
				try {
					const response = await fetch(`/data/${jsonFile}`);
					if (!response.ok) throw new Error("Failed to fetch post");

					const data: BlogPost[] = await response.json();
					const postData = data.find((item) => item.id === postId);
					if (!postData) throw new Error("Post not found");

					setPost(postData);
				} catch (error) {
					console.error("Error fetching post:", error);
				} finally {
					isFetching.current = false;
				}
			},
			[postId, jsonFile],
		);

		useEffect(() => {
			fetchPost();
		}, [fetchPost]);

		if (!post) {
			return <div>Loading...</div>;
		}

		return (
			<div className='page-container'>
				<div className='blog-post-content'>
					<h1>{post.headline}</h1>
					<div className='image-box'>
						<img
							src={post.image.url}
							alt={post.image.caption}
							className='main-image'
							loading='lazy'
						/>
					</div>
					<div className='author-date'>
						<p className='author'>By: {post.author.name}</p>
						<p className='date'>
							{new Date(post.datePublished).toLocaleDateString()}
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
					{post.content.map((section, index) => (
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
							{section.image && (
								<img
									src={section.image}
									alt='Section image'
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
							{/* In-content Ad */}
							{index % 2 === 1 && (
								<div className='postings-container'>
									<ins
										className='adsbygoogle'
										style={{
											display: "block",
											width: "300px",
											height: "250px",
										}}
										data-ad-client='ca-pub-1079721341426198'
										data-ad-slot='7197282987'
										data-ad-format='auto'
										data-full-width-responsive='true'
									/>
								</div>
							)}
						</div>
					))}
				</div>
			</div>
		);
	},
);

export default BlogPostContent;
