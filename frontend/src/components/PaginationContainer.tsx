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

	if (totalPages <= 1) return null; // Don't render pagination if only 1 page

	const handlePageClick = (page: number) => {
		if (page !== currentPage) {
			setCurrentPage(page);
		}
	};

	return (
		<nav className='pagination-wrapper' aria-label='Pagination Navigation'>
			<button
				className={`pagination-button ${currentPage === 1 ? "disabled" : ""}`}
				onClick={() => handlePageClick(currentPage - 1)}
				disabled={currentPage === 1}
				aria-label='Go to previous page'
			>
				Previous
			</button>

			{Array.from({ length: totalPages }, (_, index) => (
				<button
					key={index}
					className={`page-number ${currentPage === index + 1 ? "active" : ""}`}
					onClick={() => handlePageClick(index + 1)}
					aria-label={`Go to page ${index + 1}`}
				>
					{index + 1}
				</button>
			))}

			<button
				className={`pagination-button ${
					currentPage === totalPages ? "disabled" : ""
				}`}
				onClick={() => handlePageClick(currentPage + 1)}
				disabled={currentPage === totalPages}
				aria-label='Go to next page'
			>
				Next
			</button>
		</nav>
	);
};

export default PaginationContainer;
