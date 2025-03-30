import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import parse from "html-react-parser";
import { Helmet } from "react-helmet-async";
import "./BlogPostContent.css";

interface BlogPostContentProps {
	jsonFile: string;
}

interface CaseStudy {
	title: string;
	content: string;
	stats: string;
}

interface PostContent {
	subtitle?: string;
	text?: string;
	details?: string;
	image?: string;
	bulletPoints?: string[];
	stats?: string | string[];
	expertQuotes?: string | string[];
	caseStudies?: string | CaseStudy;
	authorityLinks?: string | string[];
	additionalInsights?: string;
	personalTips?: string[] | string;
	conclusion?: {
		title: string;
		text: string;
		additionalInsights?: string;
	};
}

interface BlogPost {
	id: string;
	headline: string;
	author: { name: string };
	datePublished: string;
	dateModified?: string;
	image: { url: string; caption: string };
	content: PostContent[];
	canonicalUrl?: string;
}

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

const BlogPostContent: React.FC<BlogPostContentProps> = ({ jsonFile }) => {
	const { id: postId } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [post, setPost] = useState<BlogPost | null>(null);
	const adsInitialized = useRef(false);

	const parseString = (str: string | undefined): React.ReactNode => {
		return typeof str === "string" ? parse(str) : null;
	};

	const renderArrayOrString = (
		data: string | string[] | undefined | CaseStudy,
		className: string,
	) => {
		if (!data) return null;

		if (typeof data === "object" && "title" in data) {
			return (
				<div className={className}>
					<h4>{data.title}</h4>
					<p>{parseString(data.content)}</p>
					{data.stats && <p className='stats'>{parseString(data.stats)}</p>}
				</div>
			);
		}

		const items = Array.isArray(data) ? data : [data];
		return items.map((item, index) => (
			<div key={index} className={className}>
				{parseString(item)}
			</div>
		));
	};

	const fetchPost = useCallback(async () => {
		if (!postId) return;
		try {
			const response = await fetch(`/data/${jsonFile}`);
			if (!response.ok) throw new Error("Failed to fetch post");
			const data: BlogPost[] = await response.json();
			const selectedPost = data.find(
				(item) => item.id.toLowerCase() === postId.toLowerCase(),
			);
			if (!selectedPost) return navigate("/404", { replace: true });
			setPost(selectedPost);
		} catch (error) {
			console.error("Error fetching post:", error);
			navigate("/404", { replace: true });
		}
	}, [postId, jsonFile, navigate]);

	useEffect(() => {
		fetchPost();
	}, [fetchPost]);

	useEffect(() => {
		if (post && !adsInitialized.current && window.adsbygoogle) {
			try {
				window.adsbygoogle.push({});
				adsInitialized.current = true;
			} catch (e) {
				console.error("AdSense Error:", e);
			}
		}
	}, [post]);

	useEffect(() => {
		if (post) {
			const canonical = post.canonicalUrl;
			if (canonical) {
				const link =
					document.querySelector('link[rel="canonical"]') ||
					document.createElement("link");
				link.setAttribute("rel", "canonical");
				link.setAttribute("href", canonical);

				document.head.appendChild(link);
			}
		}
	}, [post]);

	if (!post) return <div>Loading...</div>;

	return (
		<div className='page-container'>
			<Helmet>{/* Canonical tag will be added via useEffect */}</Helmet>
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
						{section.text && <>{parseString(section.text)}</>}

						{section.details && (
							<p className='details'>{parseString(section.details)}</p>
						)}
						{section.image && (
							<img
								src={section.image}
								alt='Section visual'
								className='section-image'
								loading='lazy'
							/>
						)}
						{section.bulletPoints && (
							<ul>
								{section.bulletPoints.map((point, i) => (
									<li key={i}>{parseString(point)}</li>
								))}
							</ul>
						)}

						{section.expertQuotes &&
							Array.isArray(section.expertQuotes) &&
							section.expertQuotes.map((quote, i) => (
								<p key={i} className='expert-quote'>
									{parseString(quote)}
								</p>
							))}

						{section.caseStudies &&
							renderArrayOrString(section.caseStudies, "case-study")}

						{section.authorityLinks && (
							<div className='authority-link'>
								{Array.isArray(section.authorityLinks)
									? section.authorityLinks.map((link, i) => (
											<div key={i}>{parseString(link)}</div>
									  ))
									: parseString(section.authorityLinks)}
							</div>
						)}

						{section.stats && (
							<div className='stats'>
								{Array.isArray(section.stats)
									? section.stats.map((item, i) => (
											<div key={i}>{parseString(item)}</div>
									  ))
									: parseString(section.stats)}
							</div>
						)}

						{section.personalTips && (
							<div className='personal-tips-section'>
								<h3>Pro Tips</h3>
								<ul>
									{(Array.isArray(section.personalTips)
										? section.personalTips
										: [section.personalTips]
									).map((tip, i) => (
										<li key={i}>{parseString(tip)}</li>
									))}
								</ul>
							</div>
						)}

						{section.conclusion && (
							<div className='conclusion-section'>
								<h3>{section.conclusion.title}</h3>
								<p>{parseString(section.conclusion.text)}</p>
								{section.conclusion.additionalInsights && (
									<div className='additional-insights'>
										{parseString(section.conclusion.additionalInsights)}
									</div>
								)}
							</div>
						)}

						{!section.conclusion?.additionalInsights &&
							section.additionalInsights && (
								<div className='additional-insights'>
									{parseString(section.additionalInsights)}
								</div>
							)}

						{index % 2 === 1 && (
							<div className='postings-container'>
								<ins
									className='adsbygoogle'
									style={{ display: "block" }}
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
};

export default React.memo(BlogPostContent);
