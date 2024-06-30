import React from "react";
import styled from "styled-components";

const CardContainer = styled.div`
	background: #fff;
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	overflow: hidden;
	cursor: pointer;
	transition: transform 0.3s, box-shadow 0.3s;
	display: flex;
	flex-direction: row;
	max-width: 800px;
	width: 100%;
	margin: 20px 0;

	&:hover {
		transform: translateY(-10px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 806px) {
		flex-direction: column;
	}
`;

const CardImage = styled.img`
	width: 40%;
	object-fit: cover;

	@media (max-width: 806px) {
		width: 100%;
		height: auto;
	}
`;

const CardContent = styled.div`
	padding: 20px;
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	width: 60%;

	@media (max-width: 806px) {
		width: 100%;
	}
`;

const CardTitle = styled.h3`
	font-size: 1.5rem;
	margin: 0;
	color: #333;
	font-weight: 700;
`;

const CardAuthor = styled.p`
	font-size: 0.875rem;
	color: #555;
`;

const CardDate = styled.p`
	font-size: 0.75rem;
	color: #999;
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

const ReadMoreButton = styled.button`
	background-color: #007bff;
	color: white;
	border: none;
	border-radius: 5px;
	padding: 10px 20px;
	font-size: 0.875rem;
	cursor: pointer;
	transition: background-color 0.3s;
	align-self: flex-start; /* Align to the left */

	&:hover {
		background-color: #0056b3;
	}
`;

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
