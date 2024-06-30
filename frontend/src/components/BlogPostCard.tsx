import React from "react";
import styled from "styled-components";

const CardContainer = styled.div`
	display: flex;
	flex-direction: column;
	background-color: white;
	border-radius: 10px;
	overflow: hidden;
	cursor: pointer;
	transition: all 0.3s ease-in-out;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

	&:hover {
		box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
		transform: translateY(-5px);
	}
`;

const CardImage = styled.img`
	width: 100%;
	height: 200px;
	object-fit: cover;
`;

const CardContent = styled.div`
	padding: 20px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	height: 100%;
`;

const CardTitle = styled.h3`
	font-size: 1.25rem;
	margin: 0;
	color: #333;
	font-weight: 700;
	margin-bottom: 10px;
`;

const CardAuthor = styled.p`
	font-size: 0.875rem;
	color: #555;
	margin: 0;
`;

const CardDate = styled.p`
	font-size: 0.75rem;
	color: #999;
	margin: 0;
	margin-top: 5px;
`;

const CardText = styled.p`
	font-size: 0.875rem;
	color: #666;
	margin: 15px 0;
	display: -webkit-box;
	-webkit-line-clamp: 4;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.5;
`;

interface BlogPostCardProps {
	id: number;
	title: string;
	imageUrl: string;
	content: string;
	author: string;
	datePosted: string;
	onClick?: () => void; // Make onClick optional
}

const BlogPostCard: React.FC<BlogPostCardProps> = ({
	title,
	imageUrl,
	content,
	author,
	datePosted,
	onClick, // Destructure onClick
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
			</CardContent>
		</CardContainer>
	);
};

export default BlogPostCard;
