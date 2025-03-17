import React from "react";
import "./BlogPostCard.css";

interface BlogPostCardProps {
	id: string;
	title: string;
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
	title,
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
				src={image.url} // Access the `url` of the image
				alt={image.caption} // Access the `caption` for alt text
				loading='lazy'
				width='320'
				height='240'
			/>
			<div className='card-content'>
				<header>
					<h2 className='card-title'>{title}</h2>
				</header>
				<p className='card-text'>{content}</p>

				<div className='author-date'>
					<p className='card-author'>By {author.name}</p>{" "}
					{/* Access author name */}
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
					<div>
						<button
							className='read-more-button'
							aria-label={`Read more about ${title}`}
						>
							Read More
						</button>
					</div>
				</div>
			</div>
		</article>
	);
};

export default BlogPostCard;
