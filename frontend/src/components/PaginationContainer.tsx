import React from "react";
import "./PaginationContainer.css";

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
		<nav className='pagination-wrapper' aria-label='Page navigation'>
			<button
				className='pagination-button'
				onClick={handlePrevPage}
				disabled={currentPage === 1}
				aria-label='Previous page'
			>
				Previous
			</button>
			{Array.from({ length: totalPages }).map((_, index) => (
				<span
					key={index}
					className={`page-number ${currentPage === index + 1 ? "active" : ""}`}
					onClick={() => handlePageNumberClick(index + 1)}
					aria-label={`Page ${index + 1}`}
				>
					{index + 1}
				</span>
			))}
			<button
				className='pagination-button'
				onClick={handleNextPage}
				disabled={currentPage === totalPages}
				aria-label='Next page'
			>
				Next
			</button>
		</nav>
	);
};

export default PaginationContainer;
