import React from "react";
import "./BlogPostCard.css";

interface BlogPostCardProps {
	id: string;
	title: string;
	imageUrl: string;
	content: string;
	author: string;
	datePosted: string;
	onClick?: () => void;
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({
	title,
	imageUrl,
	content,
	author,
	datePosted,
	onClick,
}) => {
	const formattedDate = new Date(datePosted).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});

	return (
		<article className='card-container' onClick={onClick}>
			<img className='card-image' src={imageUrl} alt={title} loading='lazy' />
			<div className='card-content'>
				<header>
					<h2 className='card-title'>{title}</h2>
				</header>
				<p className='card-text'>{content}</p>
				<div>
					<p className='card-author'>By {author}</p>
					<time className='card-date' dateTime={datePosted}>
						{formattedDate}
					</time>
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
		</article>
	);
};

export default BlogPostCard;
