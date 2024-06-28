import React, { useEffect, useState } from "react";
import styled from "styled-components";
import AdComponent from "../../../components/AdComponent";
import BlogPost from "../../../components/BlogPost";
import Breadcrumb from "../../../components/Breadcrumb";

const PageContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 0 1rem;
`;

const TopNav = styled.nav`
	width: 50%;
	background-color: #333;
	color: white;
	padding: 10px;
	text-align: center;
`;

const BreadcrumbContainer = styled.div`
	width: 100%;
	padding-top: 0px;
`;

const BlogPostWrapper = styled.div`
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
	gap: 1rem;
	justify-items: center;
	margin-top: 6%;
	width: 100%;
`;

const TopAdContainer = styled.div`
	display: flex;
	justify-content: center;
	background-color: white;
	margin-top: 2px;
	width: 100%;
	max-width: 728px;
	padding: 0rem 0;

	@media (max-width: 806px) {
		width: 360px;
		height: 120px;
		padding: 0;
	}
`;

const SideAdContainer = styled.div`
	max-width: 300px;
	height: 602px;
	margin: 20px 10px;
	background-color: white;

	@media (max-width: 806px) {
		display: none;
	}
`;

const MobileAdContainer = styled.div`
	display: none;
	justify-content: center;
	background-color: white;
	width: 320px;
	height: 100px;
	margin: 20px 0;

	@media (max-width: 806px) {
		display: flex;
	}
`;

const MobileBoxAdContainer = styled.div`
	display: none;
	justify-content: center;
	background-color: white;
	width: 250px;
	height: 250px;
	margin: 20px 0;

	@media (max-width: 806px) {
		display: flex;
	}
`;

const RowContainer = styled.div`
	display: grid;
	grid-template-columns: auto 1fr auto;
	width: 100%;
	max-width: 1600px;
	column-gap: 10px;
	align-items: start;

	@media (max-width: 806px) {
		grid-template-columns: 1fr;
	}
`;

const PaginationContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	margin: 20px 0;
`;

const PaginationButton = styled.button`
	padding: 10px 20px;
	margin: 0 5px;
	background-color: #333;
	color: white;
	border: none;
	cursor: pointer;

	&:disabled {
		background-color: #ddd;
		color: #666;
		cursor: not-allowed;
	}
`;

const PageNumber = styled.span`
	display: inline-block;
	padding: 10px;
	margin: 0 5px;
	background-color: #333;
	color: white;
	cursor: pointer;

	&.active {
		background-color: #666;
	}
`;

const Budgetting: React.FC = () => {
	useEffect(() => {
		document.title = "Budget Guides";
	}, []);

	const breadcrumbPaths = [
		{ title: "Home", url: "/" },
		{ title: "Extra Income ", url: "/category/extra-income" },
		{ title: "Budgetting", url: "/category/extra-income/Budgetting" },
	];

	const budget = [
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
		{
			id: 3,
			title: "Tech Innovations",
			imageUrl: "https://picsum.photos/400/300?random=3",
			content: "Suspendisse potenti. Quisque vel lacus non nunc ",
			author: "John Smith",
			datePosted: "Last week",
		},

		// ... (more posts)
	];

	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const totalPages = Math.ceil(budget.length / postsPerPage);

	const handlePrevPage = () => {
		setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
	};

	const handlePageNumberClick = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const currentPosts = budget.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	// Determine the number of columns for each row (assuming 3 columns per row)
	const columnsPerRow = 3;

	const groupedPosts = [];
	for (let i = 0; i < currentPosts.length; i += columnsPerRow) {
		groupedPosts.push(currentPosts.slice(i, i + columnsPerRow));
	}

	// Calculate the range of page numbers to display
	const maxPageNumbersToShow = 5;
	let startPageNumber = Math.max(
		1,
		currentPage - Math.floor(maxPageNumbersToShow / 2),
	);
	let endPageNumber = Math.min(
		totalPages,
		startPageNumber + maxPageNumbersToShow - 1,
	);
	if (endPageNumber - startPageNumber < maxPageNumbersToShow - 1) {
		startPageNumber = Math.max(1, endPageNumber - maxPageNumbersToShow + 1);
	}

	return (
		<PageContainer>
			<BreadcrumbContainer>
				<Breadcrumb paths={breadcrumbPaths} />
			</BreadcrumbContainer>
			<TopAdContainer>
				<AdComponent width={728} height={90} />
			</TopAdContainer>
			{groupedPosts.map((row, rowIndex) => (
				<RowContainer key={rowIndex}>
					<SideAdContainer>
						<AdComponent width={300} height={600} />
					</SideAdContainer>
					<BlogPostWrapper>
						{row.map((budget, index) => (
							<React.Fragment key={budget.id}>
								<BlogPost
									id={budget.id}
									title={budget.title}
									imageUrl={budget.imageUrl}
									content={budget.content}
									author={budget.author}
									datePosted={budget.datePosted}
								/>
								{(index + 1) % 3 === 0 && (
									<MobileBoxAdContainer>
										<AdComponent width={250} height={250} />
									</MobileBoxAdContainer>
								)}
								{(index + 1) % 4 === 0 && (
									<MobileAdContainer>
										<AdComponent width={320} height={100} />
									</MobileAdContainer>
								)}
							</React.Fragment>
						))}
					</BlogPostWrapper>

					<SideAdContainer>
						<AdComponent width={300} height={600} />
					</SideAdContainer>
				</RowContainer>
			))}
			<PaginationContainer>
				<PaginationButton onClick={handlePrevPage} disabled={currentPage === 1}>
					Previous
				</PaginationButton>
				{Array.from(
					{ length: endPageNumber - startPageNumber + 1 },
					(_, index) => (
						<PageNumber
							key={startPageNumber + index}
							className={
								currentPage === startPageNumber + index ? "active" : ""
							}
							onClick={() => handlePageNumberClick(startPageNumber + index)}
						>
							{startPageNumber + index}
						</PageNumber>
					),
				)}
				<PaginationButton
					onClick={handleNextPage}
					disabled={currentPage === totalPages}
				>
					Next
				</PaginationButton>
			</PaginationContainer>
		</PageContainer>
	);
};

export default Budgetting;
