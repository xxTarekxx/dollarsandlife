import Link from "next/link"; // Changed import
import React from "react";

interface BlogPostCardProps {
	id: string;
	headline: string;
	image: { url: string; caption: string };
	content: string; // This is expected to be an excerpt, not full HTML for stripHtml to be simple
	author: { name: string };
	datePublished: string;
	dateModified?: string;
	onClick?: () => void;
	// canonicalUrl?: string; // canonicalUrl is for the detail page, not usually on a card link
	href: string; // Changed from linkTo
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({
	headline,
	image,
	// content, // Content prop is not directly used in the provided final JSX structure for the link
	datePublished,
	href, // Changed from linkTo
}) => {
	const publishedDate = new Date(datePublished);

	// Use a more consistent date formatting approach
	const formatDate = (date: Date) => {
		const months = [
			"JAN",
			"FEB",
			"MAR",
			"APR",
			"MAY",
			"JUN",
			"JUL",
			"AUG",
			"SEP",
			"OCT",
			"NOV",
			"DEC",
		];
		return {
			day: date.getDate(),
			month: months[date.getMonth()],
		};
	};

	const { day: formattedDay, month: formattedMonth } =
		formatDate(publishedDate);

	// stripHtml might not be needed if 'content' prop is a plain text excerpt
	// If 'content' can contain HTML and needs stripping for a snippet within the card (not shown in provided JSX),
	// this SSR-safe version can be used.
	// const stripHtml = (html: string): string => {
	//   if (typeof window === 'undefined') {
	//     const basicText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
	//     return basicText.length > 150 ? basicText.substring(0, 147) + "..." : basicText || "View details";
	//   }
	//   const tmp = document.createElement("DIV");
	//   tmp.innerHTML = html;
	//   return tmp.textContent || tmp.innerText || "";
	// };
	// const textSnippet = stripHtml(content); // Use if displaying a snippet inside the card

	return (
		<Link
			href={href}
			className='blog-post-link-container'
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
						<span className='day'>{formattedDay}</span>
						<span className='month'>{formattedMonth}</span>
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
