import React from "react";
import BlogPost from "../../../components/BlogPost";
import BlogPostContainer from "../../../components/BlogPostContainer";
import styled from "styled-components";

const Container = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh; // This makes the container take up the full viewport height
`;

const AdsContainer = styled.div`
	background: #eee; // Change this to your ad background color
	height: 600px; // Set the height of the ad container
	width: 160px; // Change this to your ad width
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
`;

const FreeLanceJobs: React.FC = () => {
	const freelancejob = [
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
		<BlogPostContainer>
			<Container>
				<AdsContainer>
					{/* Your ads go here */}
					<img src='https://picsum.photos/150/600' alt='Ad' />
					<p>Ad description</p>
				</AdsContainer>
			</Container>

			{freelancejob.map((freelance) => (
				<BlogPost
					key={freelance.id}
					id={freelance.id}
					title={freelance.title}
					imageUrl={freelance.imageUrl}
					content={freelance.content}
					author={freelance.author}
					datePosted={freelance.datePosted}
				/>
			))}
		</BlogPostContainer>
	);
};

export default FreeLanceJobs;
