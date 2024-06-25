import React from "react";
import BlogPost from "../../../components/BlogPost";
import BlogPostContainer from "../../../components/BlogPostContainer";
import styled from "styled-components";
import AdSense from "react-adsense";

// Styled component for the Ad container
const AdContainer = styled.div`
	padding-top: 10px;
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	// flex-direction: row;
`;

// FreelanceJobs dummy data component
const FreeLanceJobs: React.FC = () => {
	const freelancejob = [
		{
			id: 1,
			title: "Delicious Food",
			imageUrl: "https://picsum.photos/400/300?random=1",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "Jony Doe",
			datePosted: "Yesterday",
		},
		{
			id: 2,
			title: "Amazing Travel",
			imageUrl: "https://picsum.photos/400/300?random=2",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "Jane Doe",
			datePosted: "Two days ago",
		},
		{
			id: 3,
			title: "Tech Innovations",
			imageUrl: "https://picsum.photos/400/300?random=3",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "John Smith",
			datePosted: "Last week",
		},
	];

	return (
		<BlogPostContainer>
			<AdContainer>
				<AdSense.Google
					client='ca-pub-1234567890123456'
					slot='1234567890'
					style={{ display: "block", width: 728, height: 90 }}
					format='auto'
					responsive='true'
				/>
			</AdContainer>

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
