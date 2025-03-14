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
			{/* Optimize image loading with srcSet for responsiveness */}
			<img
				className='card-image'
				src={imageUrl}
				alt={title}
				loading='lazy'
				srcSet={`
					${imageUrl} 1x,
					${imageUrl.replace(".jpg", "@2x.jpg")} 2x
				`}
				width='320' // Adjust the width and height for layout stability
				height='240'
			/>
			<div className='card-content'>
				<header>
					<h2 className='card-title'>{title}</h2>
				</header>
				<p className='card-text'>{content}</p>
				<div className='author-date'>
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
