import parse from "html-react-parser";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import "./BlogPostContent.css";
import "../../pages/category/extra-income/CommonStyles.css";

interface BlogPostContentProps {
	jsonFile: string;
}

interface CaseStudy {
	title: string;
	content: string;
	stats: string;
}

interface SectionImage {
	url: string;
	caption: string;
}

interface PostContent {
	subtitle?: string;
	text?: string;
	details?: string;
	image?: string;
	images?: SectionImage[];
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

const BlogPostContent: React.FC<BlogPostContentProps> = memo(({ jsonFile }) => {
	const { id: postId } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [post, setPost] = useState<BlogPost | null>(null);

	const parseString = useCallback(
		(str: string | undefined): React.ReactNode => {
			return typeof str === "string" ? parse(str) : null;
		},
		[],
	);

	const renderArrayOrString = useCallback(
		(data: string | string[] | undefined | CaseStudy, className: string) => {
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
		},
		[parseString],
	);

	const fetchPost = useCallback(async () => {
		if (!postId) return;
		try {
			const response = await fetch(
				`${import.meta.env.VITE_REACT_APP_API_BASE}/${jsonFile}/${postId}`,
			);

			if (!response.ok) throw new Error("Failed to fetch post");

			const selectedPost = await response.json();
			setPost(selectedPost);
		} catch (error) {
			console.error("❌ Error fetching post:", error);
			navigate("/404", { replace: true });
		}
	}, [postId, jsonFile, navigate]);

	useEffect(() => {
		fetchPost();
	}, [fetchPost]);

	const cleanDescription = useMemo(() => {
		if (!post?.content?.[0]?.text)
			return "Stay updated with the latest financial and economic insights.";

		const raw = post.content[0].text;
		const stripped = raw.replace(/<\/?[^>]+(>|$)/g, ""); // Strip HTML
		return stripped.slice(0, 155) + (stripped.length > 155 ? "..." : "");
	}, [post]);

	if (!post) return <div>Loading...</div>;

	return (
		<div className='page-container'>
			<Helmet>
				<title>{post.headline}</title>
				<meta name='description' content={cleanDescription} />
				<link
					rel='canonical'
					href={post.canonicalUrl || window.location.href}
				/>
			</Helmet>

			<div className='blog-post-content'>
				<h1>{post.headline}</h1>

				<div className='image-box'>
					<img
						src={post.image.url}
						alt={post.image.caption}
						className='main-image'
						loading='lazy'
						width='450px'
						height='354px'
					/>
				</div>

				<div className='author-date'>
					<p className='author'>By: {post.author.name}</p>
					<p className='published-updated-date'>
						Published: {new Date(post.datePublished).toLocaleDateString()}
						{post.dateModified &&
							` | Updated: ${new Date(post.dateModified).toLocaleDateString()}`}
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
							src='/images/Lyca-Mobile-728x90.webp'
							alt='Lyca Mobile Banner'
							className='TopBannerImage'
							width='730px'
							height='90px'
							loading='lazy'
						/>
					</a>
				</div>

				{post.content.map((section, index) => (
					<div key={index} className='content-section'>
						{section.subtitle && <h2>{section.subtitle}</h2>}
						{section.text && <>{parseString(section.text)}</>}

						{section.images &&
							Array.isArray(section.images) &&
							section.images.map((img, i) => (
								<div key={i} className='section-image-box'>
									<img
										src={img.url}
										alt={img.caption}
										className='section-image'
										width='450'
										height='300'
										loading='lazy'
									/>
									{img.caption && (
										<p className='image-caption'>{img.caption}</p>
									)}
								</div>
							))}

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
					</div>
				))}
			</div>
		</div>
	);
});

export default BlogPostContent;
