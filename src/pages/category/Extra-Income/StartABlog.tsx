import React from "react";
import BlogPost from "../../../components/BlogPost";
import Container from "../../../components/BlogPostContainer";

const StartAblog: React.FC = () => {
	const blogguide = [
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
			{blogguide.map((guide) => (
				<BlogPost
					key={guide.id}
					id={guide.id}
					title={guide.title}
					imageUrl={guide.imageUrl}
					content={guide.content}
					author={guide.author}
					datePosted={guide.datePosted}
				/>
			))}
		</Container>
	);
};

export default StartAblog;
