import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
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
	const [post, setPost] = useState<BlogPost | null>(null);

	useEffect(() => {
		const fetchPost = async () => {
			try {
				console.log(
					`Fetching data from: /data/${jsonFile} for post ID: ${postId}`,
				);
				const response = await fetch(`/data/${jsonFile}`);
				if (!response.ok) throw new Error("Failed to fetch post");

				const data: BlogPost[] = await response.json();
				console.log("Fetched Data:", data);

				const postData = data.find((item) => item.id === postId);
				if (!postData) throw new Error("Post not found");

				console.log("Post Data:", postData);
				setPost(postData);
			} catch (error) {
				console.error("Error fetching post:", error);
			}
		};

		fetchPost();

		// Ensure AdSense pushes ads AFTER the component has mounted and ad container is visible
		setTimeout(() => {
			const adContainer = document.querySelector(
				".postings-container",
			) as HTMLElement | null;
			if (adContainer && adContainer.offsetHeight > 0) {
				console.log("Pushing AdSense ads...");
				(window.adsbygoogle = window.adsbygoogle || []).push({});
			} else {
				console.warn("Ad container is not visible yet, retrying...");
				setTimeout(() => {
					console.log("Retrying AdSense push...");
					(window.adsbygoogle = window.adsbygoogle || []).push({});
				}, 2000);
			}
		}, 2000);
	}, [postId, jsonFile]);

	if (!post) return <div>Loading...</div>;

	console.log("Rendering BlogPostContent...");
	if (!post) {
		console.log("Post is still null, returning Loading...");
		return <div>Loading...</div>;
	}

	console.log("Rendering post title:", post.title);

	return (
		<div className='blog-post-content'>
			<div className='top-banner-container'>
				<a
					href='https://www.amazon.com/amazonprime?primeCampaignId=studentWlpPrimeRedir&linkCode=ll2&tag=dollarsandl02-20&linkId=879184c8c8106f03c9fbbea8df411e86&language=en_US&ref_=as_li_ss_tl'
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
					{index % 2 === 1 && (
						<div className='postings-container'>
							<ins
								className='adsbygoogle'
								style={{
									display: "block",
									width: "300px",
									height: "250px",
									minWidth: "300px",
									minHeight: "250px",
								}}
								data-ad-client='ca-pub-2295073683044412'
								data-ad-slot='9380614635'
								data-ad-format='rectangle'
								data-full-width-responsive='false'
							/>
						</div>
					)}
				</div>
			))}

			<div className='postings-container'>
				<ins
					className='adsbygoogle'
					style={{
						display: "block",
						width: "728px",
						height: "90px",
						minWidth: "728px",
						minHeight: "90px",
					}}
					data-ad-client='ca-pub-2295073683044412'
					data-ad-slot='9380614635'
					data-ad-format='horizontal'
					data-full-width-responsive='false'
				/>
			</div>
			<script>{`(adsbygoogle = window.adsbygoogle || []).push({});`}</script>
		</div>
	);
};

export default BlogPostContent;
