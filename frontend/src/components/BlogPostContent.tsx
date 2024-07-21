import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdComponent from "../../src/components/AdComponent";
import "./BlogPostContent.css";

interface BlogPostContentProps {
	jsonFile: string;
}

const BlogPostContent: React.FC<BlogPostContentProps> = ({ jsonFile }) => {
	const { id: postId } = useParams<{ id: string }>();
	const [post, setPost] = useState<any>(null);

	useEffect(() => {
		const fetchPost = async () => {
			console.log(`Fetching from ${jsonFile} for post ID ${postId}`);
			try {
				const response = await fetch(`/${jsonFile}`);
				if (!response.ok) {
					throw new Error("Failed to fetch post");
				}
				const data = await response.json();
				const postData = data.find((item: any) => item.id === postId);
				if (!postData) {
					throw new Error("Post not found");
				}
				setPost(postData);
			} catch (error) {
				console.error("Error fetching post:", error);
			}
		};

		fetchPost();
	}, [postId, jsonFile]);

	if (!post) {
		return <div>Loading...</div>;
	}

	return (
		<div className='blog-post-content'>
			<h1>{post.title}</h1>
			<p>{post.author}</p>
			<p>{post.datePosted}</p>
			<img src={post.imageUrl} alt={post.title} />
			<div dangerouslySetInnerHTML={{ __html: post.content }} />
			<div className='ad-container'>
				<AdComponent width={728} height={90} />
			</div>
		</div>
	);
};

export default BlogPostContent;
