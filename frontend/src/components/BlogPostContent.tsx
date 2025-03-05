import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import "./AdComponent.css";
import "./BlogPostContent.css";
import "../pages/category/Extra-Income/CommonStyles.css";
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

/* 
  Reusable ad component. 
  It renders the ad markup (an <ins> element with the "adsbygoogle" class) 
  and, once mounted, pushes an ad request via the AdSense API.
  
  All styling is handled by your AdComponent.css (the postings-container class, etc.).
*/
interface AdsenseAdProps {
	dataAdSlot: string;
	dataAdClient: string;
	dataAdFormat: string;
	dataFullWidthResponsive: string;
}

const AdsenseAd: React.FC<AdsenseAdProps> = ({
	dataAdSlot,
	dataAdClient,
	dataAdFormat,
	dataFullWidthResponsive,
}) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const insRef = useRef<HTMLModElement>(null);
	const adPushedRef = useRef(false);

	useEffect(() => {
		const pushAd = () => {
			if (
				!adPushedRef.current &&
				insRef.current &&
				insRef.current.getAttribute("data-adsbygoogle-status") !== "done"
			) {
				try {
					(window.adsbygoogle = window.adsbygoogle || []).push({});
					adPushedRef.current = true;
				} catch (error) {
					console.error("Adsense error:", error);
				}
			}
		};
		// Delay push to ensure the element is mounted and styled by CSS
		setTimeout(pushAd, 1000);
	}, []);

	return (
		<div ref={containerRef} className='postings-container'>
			<ins
				ref={insRef}
				className='adsbygoogle'
				data-ad-client={dataAdClient}
				data-ad-slot={dataAdSlot}
				data-ad-format={dataAdFormat}
				data-full-width-responsive={dataFullWidthResponsive}
			></ins>
		</div>
	);
};

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
	}, [postId, jsonFile]);

	if (!post) return <div>Loading...</div>;

	console.log("Rendering BlogPostContent...", post.title);

	return (
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
				<p className='date'>{new Date(post.datePosted).toLocaleDateString()}</p>
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
									__html: "(adsbygoogle = window.adsbygoogle || []).push({});",
								}}
							/>
						</div>
					)}
				</div>
			))}
			{/* Bottom Ad */}
			{/* <div className='postings-container'>
				<ins
					className='adsbygoogle-banner'
					style={{
						display: "block",
						width: "728px",
						height: "90px",
						minWidth: "300px",
						minHeight: "90px",
					}}
					data-ad-client='ca-pub-1079721341426198'
					data-ad-slot='6375155907'
					data-ad-format='horizontal'
					data-full-width-responsive='true'
				></ins>
			</div>
			<script
				dangerouslySetInnerHTML={{
					__html: "(adsbygoogle = window.adsbygoogle || []).push({});",
				}}
			/> */}
		</div>
	);
};

export default BlogPostContent;
