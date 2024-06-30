import React from "react";
import styled from "styled-components";

const CardContainer = styled.div`
	display: flex;
	flex-direction: column;
	background-color: white;
	border: 1px solid #ddd;
	border-radius: 8px;
	overflow: hidden;
	cursor: pointer;
	transition: transform 0.2s;

	&:hover {
		transform: translateY(-5px);
	}
`;

const CardImage = styled.img`
	width: 100%;
	height: 200px;
	object-fit: cover;
`;

const CardContent = styled.div`
	padding: 16px;
`;

const CardTitle = styled.h3`
	font-size: 1.5rem;
	margin: 0;
	color: #333;
`;

const CardAuthor = styled.p`
	font-size: 0.9rem;
	color: #777;
`;

const CardDate = styled.p`
	font-size: 0.8rem;
	color: #aaa;
`;

const CardText = styled.p`
	font-size: 1rem;
	color: #555;
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
				<CardTitle>{title}</CardTitle>
				<CardAuthor>{author}</CardAuthor>
				<CardDate>{datePosted}</CardDate>
				<CardText>{content}</CardText>
			</CardContent>
		</CardContainer>
	);
};

export default BlogPostCard;
