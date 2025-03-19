import React from "react";
import "./BlogPostCard.css";

interface BlogPostCardProps {
	id: string;
	headline: string;
	image: {
		url: string;
		caption: string;
	};
	content: string;
	author: {
		name: string;
	};
	datePublished: string;
	dateModified?: string;
	onClick?: () => void;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({
	headline,
	image,
	content,
	author,
	datePublished,
	dateModified,
	onClick,
}) => {
	const formattedDatePosted = new Date(datePublished).toLocaleDateString(
		"en-US",
		{
			year: "numeric",
			month: "long",
			day: "numeric",
		},
	);

	const formattedArticleUpdated = dateModified
		? new Date(dateModified).toLocaleDateString("en-US", {
				year: "numeric",
				month: "long",
				day: "numeric",
		  })
		: null;

	return (
		<article className='card-container' onClick={onClick}>
			<img
				className='card-image'
				src={image.url || "/images/placeholder.webp"}
				alt={image.caption || "Blog post image"}
				loading='lazy'
				width='320'
				height='240'
			/>
			<div className='card-content'>
				<header>
					<h2 className='card-title'>{headline}</h2>
				</header>

				<p className='card-text'>{content}</p>

				<div className='author-date'>
					<p className='card-author'>By {author.name}</p>
					<div className='date-group'>
						<time className='card-date' dateTime={datePublished}>
							Posted: {formattedDatePosted}
						</time>
						{formattedArticleUpdated && (
							<time className='updated-date' dateTime={dateModified}>
								Updated: {formattedArticleUpdated}
							</time>
						)}
					</div>
				</div>

				<div className='read-more-container'>
					<button
						className='read-more-button'
						aria-label={`Read more about ${headline}`}
					>
						Read More
					</button>
				</div>
			</div>
		</article>
	);
};

export default React.memo(BlogPostCard);
