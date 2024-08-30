import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdComponent from "../../src/components/AdComponent";
import FiverrWidget from "./FiverrWidget";
import "./BlogPostContent.css";
import "./AdComponent.css"; // Ensure the AdComponent styles are imported

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

	if (!post) {
		return <div>Loading...</div>;
	}

	let textCount = 0;
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
			textCount++;

			// Add a small ad section after every two text sections
			if (textCount % 2 === 0) {
				contentSections.push(
					<div key={`content-section-${index}`} className='content-section'>
						{sectionElements}
					</div>,
				);

				contentSections.push(
					<div key={`ad-${index}`} className='ad-background'>
						<div className='ad-container'>
							<AdComponent width={336} height={280} />
						</div>
					</div>,
				);
			} else {
				contentSections.push(
					<div key={`content-section-${index}`} className='content-section'>
						{sectionElements}
					</div>,
				);
			}
		} else if (section.subtitle) {
			// Ensure sections with only a subtitle are rendered correctly
			contentSections.push(
				<div key={`content-section-${index}`} className='content-section'>
					{sectionElements}
				</div>,
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

		if (
			section.subtitle === "How Your Profile Would Look on Fiverr As A Seller"
		) {
			sectionElements.push(<FiverrWidget key={`fiverr-widget`} />);
		}

		if (section.numberedPoints) {
			sectionElements.push(
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
	});

	// Ensure the final content is pushed, even if it's not a pair
	contentSections.push(
		<div key={`content-section-final`} className='content-section'>
			{contentSections.pop()}
		</div>,
	);

	return (
		<div className='blog-post-content'>
			{/* Top Ad */}
			<div className='ad-container'>
				<AdComponent width={728} height={90} />
			</div>

			<h1>{post.title}</h1>
			<div className='image-box'>
				<img src={post.imageUrl} alt={post.title} className='main-image' />
			</div>

			<div className='author-date'>
				<p className='author'>By: {post.author}</p>
				<p className='date'>{new Date(post.datePosted).toLocaleDateString()}</p>
			</div>

			{/* Render all content sections and ads */}
			{contentSections}

			{/* Bottom Ad */}
			<div className='ad-container'>
				<AdComponent width={728} height={90} />
			</div>

			{/* Small Ad at the end if textCount is odd */}
		</div>
	);
};

export default BlogPostContent;
