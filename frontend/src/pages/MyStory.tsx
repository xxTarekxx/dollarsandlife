import React, { useEffect, useState } from "react";
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
			console.log(`Fetching from /data/${jsonFile}`);
			try {
				// Corrected fetch path to the JSON file
				const response = await fetch(`/data/${jsonFile}`);
				if (!response.ok) {
					throw new Error("Failed to fetch post");
				}
				const data: BlogPost[] = await response.json();

				// Ensure the data is an array and contains the expected object
				if (Array.isArray(data) && data.length > 0) {
					setPost(data[0]); // Assume there is only one post
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

		contentSections.push(
			<div key={`content-section-${index}`} className='content-section'>
				{sectionElements}
			</div>,
		);

		if (textCount % 2 === 0 && textCount > 0) {
			contentSections.push(
				<div key={`ad-${index}`} className='ad-background'>
					<div className='ad-row-container'>
						<AdComponent width={660} height={440} />
					</div>
				</div>,
			);
		}
	});

	return (
		<div className='blog-post-content'>
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
					/>
					<button className='topbanner-button'>
						Click Here To Get Your Free Trial
					</button>
				</a>
			</div>

			<h1>{post.title}</h1>
			<div className='image-box'>
				<img src={post.imageUrl} alt={post.title} className='main-image' />
			</div>

			<div className='author-date'>
				<p className='author'>By: {post.author}</p>
				<p className='date'>{new Date(post.datePosted).toLocaleDateString()}</p>
			</div>

			{contentSections}

			<div className='ad-container'>
				<AdComponent width={728} height={90} />
			</div>
		</div>
	);
};

export default BlogPostContent;
