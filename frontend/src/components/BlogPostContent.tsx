import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
// import AdComponent from "./AdComponent"; // Commented out for later use
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

const BlogPostContent: React.FC<BlogPostContentProps> = ({ jsonFile }) => {
	const { id: postId } = useParams<{ id: string }>();
	const [post, setPost] = useState<BlogPost | null>(null);

	useEffect(() => {
		const fetchPost = async () => {
			console.log(`Fetching from ${jsonFile} for post ID ${postId}`);
			try {
				const response = await fetch(`/data/${jsonFile}`);
				if (!response.ok) {
					throw new Error("Failed to fetch post");
				}
				const data: BlogPost[] = await response.json();
				const postData = data.find((item) => item.id === postId);
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
					alt={`Image related to ${section.subtitle || post.title}`}
					className='section-image'
					loading='lazy'
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

		if (
			section.subtitle === "How Your Profile Would Look on Fiverr As A Seller"
		) {
			sectionElements.push(<FiverrWidget key={`fiverr-widget`} />);
		}

		contentSections.push(
			<div key={`content-section-${index}`} className='content-section'>
				{sectionElements}
			</div>,
		);

		// Show the 300x250 ad after every two text sections, but not at the very bottom
		if (
			textCount % 2 === 0 &&
			textCount > 0 &&
			index < post.content.length - 1
		) {
			contentSections.push(
				<div key={`ad-${index}`} className='postings-container'>
					<div className='postings-row-container'>
						<a
							href='https://www.kqzyfj.com/click-101252893-15236454'
							target='_blank'
						>
							<img
								src='https://www.ftjcfx.com/image-101252893-15236454'
								alt=''
								className='postings-image'
							/>
						</a>
					</div>
				</div>,
			);
		}
	});

	return (
		<div className='blog-post-content'>
			{/* Top Ad */}
			<div className='top-banner-container'>
				<a
					href='https://www.amazon.com/amazonprime?primeCampaignId=studentWlpPrimeRedir&linkCode=ll2&tag=dollarsandl0c-20&linkId=879184c8c8106f03c9fbbea8df411e86&language=en_US&ref_=as_li_ss_tl'
					target='_blank'
					rel='noopener noreferrer'
					className='TopBanner'
				>
					<img
						src='/images/shoppinganddeals/amazon-banner.webp'
						alt='Amazon Prime Banner'
						className='TopBannerImage'
						loading='lazy'
					/>
					<button className='topbanner-button'>Free Trial</button>
				</a>
			</div>

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
				<p className='date'>{new Date(post.datePosted).toLocaleDateString()}</p>
			</div>

			{/* Render all content sections and ads */}
			{contentSections}

			{/* Ad at the very bottom */}
			<div className='postings-container'>
				<div className='postings-bottom-container'>
					<a
						href='https://www.tkqlhce.com/click-101252893-14103279'
						target='_blank'
					>
						<img
							className='postings-image'
							src='https://www.ftjcfx.com/image-101252893-14103279'
							alt='Speak a new language fluently fast. Start now!'
						/>
					</a>
				</div>
			</div>
		</div>
	);
};

export default BlogPostContent;
