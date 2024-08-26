import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdComponent from "../../src/components/AdComponent";
import "./BlogPostContent.css";

interface BlogPostContentProps {
	jsonFile: string;
}

interface PostContent {
	subtitle?: string;
	text?: string;
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
	const { id: postId } = useParams<{ id: string }>();
	const [post, setPost] = useState<BlogPost | null>(null);

	useEffect(() => {
		const fetchPost = async () => {
			console.log(`Fetching from ${jsonFile} for post ID ${postId}`);
			try {
				const response = await fetch(`/${jsonFile}`);
				if (!response.ok) {
					throw new Error("Failed to fetch post");
				}
				const data = await response.json();
				const postData = data.find((item: BlogPost) => item.id === postId);
				if (!postData) {
					throw new Error("Post not found");
				}
				setPost(postData);
			} catch (error) {
				console.error("Error fetching post:", error);
			}
		};

		fetchPost();
	}, [postId, jsonFile]);

	useEffect(() => {
		const script = document.createElement("script");
		script.src = "https://www.fiverr.com/gig_widgets/sdk";
		script.async = true;
		document.body.appendChild(script);

		return () => {
			document.body.removeChild(script);
		};
	}, []);

	if (!post) {
		return <div>Loading...</div>;
	}

	let subtitleCount = 0;

	return (
		<div className='blog-post-content'>
			{/* Top Ad */}
			<div className='ad-top'>
				<AdComponent width={730} height={90} />
			</div>

			<h1>{post.title}</h1>
			<div className='mage-ibox'>
				<img src={post.imageUrl} alt={post.title} className='main-image' />
			</div>

			<div className='author-date'>
				<p className='author'>By: {post.author}</p>
				<p className='date'>{new Date(post.datePosted).toLocaleDateString()}</p>
			</div>

			{post.content.map((section, index) => {
				const elements = [];

				if (section.subtitle) {
					// Increment subtitle count
					subtitleCount++;

					// Add an ad before every 2 subtitles
					if (subtitleCount > 1 && subtitleCount % 2 === 1) {
						elements.push(
							<div key={`ad-${index}`} className='ad-container'>
								<AdComponent width={600} height={300} />
							</div>,
						);
					}

					elements.push(<h2 key={`subtitle-${index}`}>{section.subtitle}</h2>);
				}

				if (section.htmlContent) {
					elements.push(
						<div
							key={`htmlContent-${index}`}
							dangerouslySetInnerHTML={{ __html: section.htmlContent }}
						/>,
					);
				}

				if (section.text) {
					elements.push(
						<p
							key={`text-${index}`}
							dangerouslySetInnerHTML={{ __html: section.text }}
						/>,
					);
				}

				if (section.imageUrl) {
					elements.push(
						<img
							key={`image-${index}`}
							src={section.imageUrl}
							alt=''
							className='section-image'
						/>,
					);
				}

				if (section.bulletPoints) {
					elements.push(
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

				if (section.numberedPoints) {
					elements.push(
						<ol key={`numberedPoints-${index}`}>
							{section.numberedPoints.map((point, i) => (
								<li
									key={`numbered-${i}`}
									dangerouslySetInnerHTML={{ __html: point }}
								/>
							))}
						</ol>,
					);
				}

				return (
					<div key={index} className='content-section'>
						{elements}
					</div>
				);
			})}

			{/* Bottom Ad */}
			<div className='ad-container'>
				<AdComponent width={728} height={90} />
			</div>
		</div>
	);
};

export default BlogPostContent;
