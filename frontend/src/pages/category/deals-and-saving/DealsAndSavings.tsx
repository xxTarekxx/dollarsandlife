import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import AdComponent from "../../../components/AdComponent";
import Breadcrumb from "../../../components/Breadcrumb";
import { Link } from "react-router-dom";

const PageContainer = styled.div`
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	padding: 0 1rem;
`;

const BreadcrumbContainer = styled.div`
	width: 100%;
	padding-top: 0px;
`;

const ProductsGrid = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
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

const AdRowContainer = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
	max-width: 660px;
	margin: 20px 0;
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
	display: flex;
	flex-direction: row;
	justify-content: center;
	width: 100%;
	max-width: 1200px;
	align-items: center;
	margin-bottom: 20px;

	@media (max-width: 806px) {
		flex-direction: column;
		align-items: center;
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

const ProductCard = styled.div`
	background: #fff;
	border-radius: 10px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	overflow: hidden;
	cursor: pointer;
	transition: transform 0.3s, box-shadow 0.3s;
	width: 100%;
	max-width: 280px;
	margin: 10px;

	&:hover {
		transform: translateY(-10px);
		box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
	}
`;

const ProductImage = styled.img`
	width: 100%;
	height: 200px;
	object-fit: cover;
`;

const ProductInfo = styled.div`
	padding: 20px;
`;

const ProductTitle = styled.h2`
	font-size: 1.5rem;
	color: #333;
	margin: 0;
`;

const ProductDescription = styled.p`
	font-size: 1rem;
	color: #777;
	margin: 10px 0;
`;

const ProductPrice = styled.p`
	font-size: 1rem;
	color: #333;
`;

const OriginalPrice = styled.span`
	text-decoration: line-through;
	color: #999;
	margin-right: 10px;
`;

const DiscountedPrice = styled.span`
	color: #e60023;
	font-weight: bold;
`;

const BuyNowButton = styled.a`
	display: inline-block;
	margin-top: 10px;
	padding: 10px 20px;
	background: #007bff;
	color: white;
	text-decoration: none;
	border-radius: 5px;
	transition: background 0.3s;

	&:hover {
		background: #0056b3;
	}
`;

interface ProductProps {
	id: number;
	title: string;
	imageUrl: string;
	description: string;
	originalPrice: number;
	discountedPrice: number;
	affiliateLink: string;
}

const ProductComponent: React.FC<ProductProps> = ({
	id,
	title,
	imageUrl,
	description,
	originalPrice,
	discountedPrice,
	affiliateLink,
}) => {
	return (
		<ProductCard key={id}>
			<ProductImage src={imageUrl} alt={title} />
			<ProductInfo>
				<ProductTitle>{title}</ProductTitle>
				<ProductDescription>{description}</ProductDescription>
				<ProductPrice>
					<OriginalPrice>{originalPrice}</OriginalPrice>
					<DiscountedPrice>{discountedPrice}</DiscountedPrice>
				</ProductPrice>
				<BuyNowButton
					href={affiliateLink}
					target='_blank'
					rel='noopener noreferrer'
				>
					Buy Now
				</BuyNowButton>
			</ProductInfo>
		</ProductCard>
	);
};

const DealsAndSavings: React.FC = () => {
	const [products, setProducts] = useState<ProductProps[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Deals and Savings";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/products.json");
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const data = await response.json();
				console.log("Fetched Data:", data);
				setProducts(data);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		if (pageRef.current) {
			pageRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [currentPage]);

	const totalPages = Math.ceil(products.length / postsPerPage);

	const handlePrevPage = () => {
		setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
	};

	const handleNextPage = () => {
		setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
	};

	const handlePageNumberClick = (pageNumber: number) => {
		setCurrentPage(pageNumber);
	};

	const currentPosts = products.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const groupedPosts = [];
	for (let i = 0; i < currentPosts.length; i += 3) {
		groupedPosts.push(currentPosts.slice(i, i + 3));
	}

	const breadcrumbPaths = [
		{ title: "Home", url: "/" },
		{ title: "Deals and Savings", url: "/deals-and-savings" },
	];

	return (
		<PageContainer ref={pageRef}>
			<BreadcrumbContainer>
				<Breadcrumb paths={breadcrumbPaths} />
			</BreadcrumbContainer>
			<TopAdContainer>
				<AdComponent width={728} height={90} />
			</TopAdContainer>
			<ProductsGrid>
				{groupedPosts.map((row, rowIndex) => (
					<React.Fragment key={rowIndex}>
						<RowContainer>
							{row.map((product) => (
								<ProductComponent {...product} key={product.id} />
							))}
						</RowContainer>
						{rowIndex % 2 === 0 && (
							<AdRowContainer>
								<AdComponent width={660} height={440} />
							</AdRowContainer>
						)}
						{rowIndex % 2 === 0 && (
							<MobileBoxAdContainer>
								<AdComponent width={250} height={250} />
							</MobileBoxAdContainer>
						)}
						{rowIndex % 4 === 0 && (
							<MobileAdContainer>
								<AdComponent width={320} height={100} />
							</MobileAdContainer>
						)}
					</React.Fragment>
				))}
			</ProductsGrid>
			<PaginationContainer>
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
			</PaginationContainer>
		</PageContainer>
	);
};

export default DealsAndSavings;
