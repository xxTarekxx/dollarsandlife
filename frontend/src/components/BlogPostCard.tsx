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
	id,
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
		<div className='card-container'>
			<a href={`/post/${id}`} className='card-link' onClick={onClick}>
				<img className='card-image' src={imageUrl} alt={title} loading='lazy' />
				<div className='card-content'>
					<h3 className='card-title'>{title}</h3>
					<p className='card-text'>{content}</p>
					<div>
						<p className='card-author'>By {author}</p>
						<p className='card-date'>{formattedDate}</p>
						<span className='read-more-link'>Read More</span>
					</div>
				</div>
			</a>
		</div>
	);
};

export default BlogPostCard;
