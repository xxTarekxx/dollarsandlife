import React from "react";
import BlogPost from "../../../components/BlogPost";
import Container from "../../../components/BlogPostContainer";

const RemoteOnlineJobs: React.FC = () => {
	const remotejobs = [
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
			{remotejobs.map((remotejob) => (
				<BlogPost
					key={remotejob.id}
					id={remotejob.id}
					title={remotejob.title}
					imageUrl={remotejob.imageUrl}
					content={remotejob.content}
					author={remotejob.author}
					datePosted={remotejob.datePosted}
				/>
			))}
		</Container>
	);
};

export default RemoteOnlineJobs;
