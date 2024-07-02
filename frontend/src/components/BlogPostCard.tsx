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
	max-width: 600px;
	width: 100%;
	margin: 20px 0px;

	&:hover {
		transform: translateY(-10px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
	}

	@media (max-width: 768px) {
		flex-direction: column;
		width: 90%;
		margin: 20px auto;
	}
`;

const CardImage = styled.img`
	width: 40%;
	object-fit: cover;

	@media (max-width: 768px) {
		width: 100%;
		height: auto;
	}
`;

const CardContent = styled.div`
	padding: 8px 4px;
	display: flex;
	flex-direction: column;
	margin-left: 2px;
	// justify-content: space-between;
	width: 60%;

	@media (max-width: 768px) {
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
	margin-bottom: 0px;
	margin-left: 2px;
`;

const CardDate = styled.p`
	font-size: 0.75rem;
	color: #999;
	margin: 0px;
	padding-bottom: 4px;
	margin-left: 2px;
`;

const CardText = styled.p`
	font-size: 0.875rem;
	color: #666;
	margin: 0px 15px 15px 0px;
	display: -webkit-box;
	-webkit-line-clamp: 4;
	-webkit-box-orient: vertical;
	text-wrap: wrap;
	overflow: hidden;
	// text-overflow: ellipsis;
	line-height: 1.5;
`;

const ReadMoreButton = styled.button`
	background-color: #00a60b;
	color: black;
	border: none;
	border-radius: 5px;
	padding: 10px 15px;
	font-size: 0.875rem;
	margin-top: 0px;
	cursor: pointer;
	transition: background-color 0.3s;
	align-self: flex-start;

	&:hover {
		background-color: #ffc000;
	}
`;

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
		<CardContainer onClick={onClick}>
			<CardImage src={imageUrl} alt={title} />
			<CardContent>
				<div>
					<CardTitle>{title}</CardTitle>
				</div>
				<CardText>{content}</CardText>
				<div>
					<CardAuthor>{author}</CardAuthor>
					<CardDate>{formattedDate}</CardDate>
					<ReadMoreButton>Read More</ReadMoreButton>
				</div>
			</CardContent>
		</CardContainer>
	);
};

export default BlogPostCard;
