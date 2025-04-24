import React from "react";
import { Link } from "react-router-dom";
import "./BlogPostCard.css";

interface BlogPostCardProps {
	id: string;
	headline: string;
	image: { url: string; caption: string };
	content: string;
	author: { name: string };
	datePublished: string;
	dateModified?: string;
	onClick?: () => void;
	canonicalUrl?: string; // ✅ Add this line
	linkTo?: string;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({
	headline,
	image,
	content,
	datePublished,
	linkTo = "#",
}) => {
	const publishedDate = new Date(datePublished);
	const day = publishedDate.getDate();
	const month = publishedDate
		.toLocaleDateString("en-US", { month: "short" })
		.toUpperCase();

	const stripHtml = (html: string) => {
		const tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";
	};

	const textSnippet = stripHtml(content);

	return (
		<Link
			className='blog-post-link-container'
			to={linkTo}
			style={{ textDecoration: "none", display: "block" }}
			aria-label={`Read more about ${headline}`}
		>
			<figure className='card-container'>
				<div className='card-image-wrapper'>
					<img
						className='card-image'
						src={image.url || "/images/placeholder.webp"}
						alt={image.caption || headline || "Blog post image"}
						loading='lazy'
					/>
					<div className='card-date-float'>
						<span className='day'>{day}</span>
						<span className='month'>{month}</span>
					</div>
				</div>
				<figcaption className='card-content'>
					<h2 className='card-title'>{headline}</h2>
				</figcaption>
			</figure>
		</Link>
	);
};

export default React.memo(BlogPostCard);
