import React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import BlogPost from "../../../components/BlogPost";
import Container from "../../../components/BlogPostContainer";

const PassiveIncome: React.FC = () => {
	const jobs = [
		{
			id: 1,
			title: "Delicious Food",
			imageUrl: "https://picsum.photos/400/300",
			content:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi perferendis molestiae non nemo doloribus. Doloremque, nihil! At ea atque quidem!",
			author: "Jony Doe",
			datePosted: "Yesterday",
		},
		{
			id: 1,
			title: "Delicious Food",
			imageUrl: "https://picsum.photos/400/300",
			content:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi perferendis molestiae non nemo doloribus. Doloremque, nihil! At ea atque quidem!",
			author: "Jony Doe",
			datePosted: "Yesterday",
		},
		{
			id: 1,
			title: "Delicious Food",
			imageUrl: "https://picsum.photos/400/300",
			content:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi perferendis molestiae non nemo doloribus. Doloremque, nihil! At ea atque quidem!",
			author: "Jony Doe",
			datePosted: "Yesterday",
		},
		{
			id: 1,
			title: "Delicious Food",
			imageUrl: "https://picsum.photos/400/300",
			content:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi perferendis molestiae non nemo doloribus. Doloremque, nihil! At ea atque quidem!",
			author: "Jony Doe",
			datePosted: "Yesterday",
		},
		{
			id: 1,
			title: "Delicious Food",
			imageUrl: "https://picsum.photos/400/300",
			content:
				"Lorem ipsum dolor sit amet consectetur adipisicing elit. Sequi perferendis molestiae non nemo doloribus. Doloremque, nihil! At ea atque quidem!",
			author: "Jony Doe",
			datePosted: "Yesterday",
		},
		// Add more jobs here...
	];

	return (
		<Container>
			{jobs.map((job) => (
				<BlogPost
					key={job.id}
					id={job.id}
					title={job.title}
					imageUrl={job.imageUrl}
					content={job.content}
					author={job.author}
					datePosted={job.datePosted}
				/>
			))}
		</Container>
	);
};

export default PassiveIncome;
