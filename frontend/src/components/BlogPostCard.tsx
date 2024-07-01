import React from "react";
import {
	CardContainer,
	CardImage,
	CardContent,
	CardTitle,
	CardAuthor,
	CardDate,
	CardText,
	ReadMoreButton,
} from "./CommonStyles";

interface BlogPostCardProps {
	id: number;
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
	return (
		<CardContainer onClick={onClick}>
			<CardImage src={imageUrl} alt={title} />
			<CardContent>
				<div>
					<CardTitle>{title}</CardTitle>
					<CardAuthor>{author}</CardAuthor>
					<CardDate>{datePosted}</CardDate>
				</div>
				<CardText>{content}</CardText>
				<ReadMoreButton>Read More</ReadMoreButton>
			</CardContent>
		</CardContainer>
	);
};

export default BlogPostCard;
