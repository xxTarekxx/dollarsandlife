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
		<div className='card-container' onClick={onClick}>
			<img className='card-image' src={imageUrl} alt={title} />
			<div className='card-content'>
				<div>
					<h3 className='card-title'>{title}</h3>
				</div>
				<p className='card-text'>{content}</p>
				<div>
					<p className='card-author'>{author}</p>
					<p className='card-date'>{formattedDate}</p>
					<button className='read-more-button'>Read More</button>
				</div>
			</div>
		</div>
	);
};

export default BlogPostCard;
