import React from "react";
import styled from "styled-components";

const PaginationWrapper = styled.div`
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

interface PaginationContainerProps {
	totalItems: number;
	itemsPerPage: number;
	currentPage: number;
	setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}

const PaginationContainer: React.FC<PaginationContainerProps> = ({
	totalItems,
	itemsPerPage,
	currentPage,
	setCurrentPage,
}) => {
	const totalPages = Math.ceil(totalItems / itemsPerPage);

	const handlePrevPage = () => {
		setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
	};

	const handlePageNumberClick = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	return (
		<PaginationWrapper>
			<PaginationButton onClick={handlePrevPage} disabled={currentPage === 1}>
				Previous
			</PaginationButton>
			{Array.from({ length: totalPages }).map((_, index) => (
				<PageNumber
					key={index}
					className={currentPage === index + 1 ? "active" : ""}
					onClick={() => handlePageNumberClick(index + 1)}
				>
					{index + 1}
				</PageNumber>
			))}
			<PaginationButton
				onClick={handleNextPage}
				disabled={currentPage === totalPages}
			>
				Next
			</PaginationButton>
		</PaginationWrapper>
	);
};

export default PaginationContainer;
