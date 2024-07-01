import React from "react";
import styled from "styled-components";

const PaginationWrapper = styled.nav`
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
		if (currentPage > 1) {
			setCurrentPage(currentPage - 1);
		}
	};

	const handleNextPage = () => {
		if (currentPage < totalPages) {
			setCurrentPage(currentPage + 1);
		}
	};

	const handlePageNumberClick = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	return (
		<PaginationWrapper aria-label='Page navigation'>
			<PaginationButton
				onClick={handlePrevPage}
				disabled={currentPage === 1}
				aria-label='Previous page'
			>
				Previous
			</PaginationButton>
			{Array.from({ length: totalPages }).map((_, index) => (
				<PageNumber
					key={index}
					className={currentPage === index + 1 ? "active" : ""}
					onClick={() => handlePageNumberClick(index + 1)}
					aria-label={`Page ${index + 1}`}
				>
					{index + 1}
				</PageNumber>
			))}
			<PaginationButton
				onClick={handleNextPage}
				disabled={currentPage === totalPages}
				aria-label='Next page'
			>
				Next
			</PaginationButton>
		</PaginationWrapper>
	);
};

export default PaginationContainer;
