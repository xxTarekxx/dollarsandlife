import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";

// Styled components
const Container = styled.div`
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center; /* Align vertically */
	// height: 100vh; /* Full height of the viewport */
	max-width: 1280px;
	margin: auto;
`;

const Card = styled.div`
	background: #7f7fd5;
	border-radius: 10px;
	box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
	transition: 0.3s;
	width: 300px;
	margin: 1rem 1rem;
`;

const CardHeader = styled.div`
	img {
		width: 100%;
		border-radius: 10px 10px 0 0;
	}
`;

const CardBody = styled.div`
	padding: 2px 16px;
`;

const CardFooter = styled.div`
	padding: 2px 16px;
`;

const UserImage = styled.img`
	border-radius: 50%;
	width: 40px;
`;

const UserInfo = styled.div`
	display: inline-block;
	vertical-align: middle;
	margin-left: 8px;
`;

const Tag = styled.span`
	display: inline-block;
	background-color: #d1913c;
	color: white;
	border-radius: 10px;
	padding: 5px;
	margin-right: 5px;
	font-size: 12px;
`;

// BlogPost component props interface
interface BlogPostProps {
	id: number;
	title: string;
	imageUrl: string;
	content: string;
	author: string;
	datePosted: string;
}

// BlogPost component
const BlogPost: React.FC<BlogPostProps> = ({
	id,
	title,
	imageUrl,
	content,
	author,
	datePosted,
}) => {
	return (
		<Container>
			<Card>
				<CardHeader>
					<Link to={`/blog/${id}`} style={{ textDecoration: "none" }}>
						<img src={imageUrl} alt={title} />
					</Link>
				</CardHeader>
				<CardBody>
					<Tag>Category</Tag>
					<Link
						to={`/blog/${id}`}
						style={{ textDecoration: "none", color: "inherit" }}
					>
						<h4>{title}</h4>
					</Link>
					<p>{content}</p>
				</CardBody>
				<CardFooter>
					<UserImage src='./user-image-placeholder.png' alt={author} />
					<UserInfo>
						<h5>{author}</h5>
						<small>{datePosted}</small>
					</UserInfo>
				</CardFooter>
			</Card>
		</Container>
	);
};

export default BlogPost;