import React, { useEffect, useState, useRef } from "react";
import styled from "styled-components";
import AdComponent from "../../../components/AdComponent";
import Breadcrumb from "../../../components/Breadcrumb";
import PaginationContainer from "../../../components/PaginationContainer";
import ProductCard from "./ProductCard";

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
	display: grid;
	grid-template-columns: repeat(3, 1fr);
	gap: 20px;
	justify-items: center;
	max-width: 1280px;
	margin: 12px 0;

	@media (max-width: 806px) {
		grid-template-columns: 1fr;
	}
`;

const TopAdContainer = styled.div`
	display: flex;
	justify-content: center;
	background-color: white;
	margin-top: 2px;
	width: 100%;
	max-width: 728px;
	padding: 0;

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

const SectionHeading = styled.h2`
	font-size: 2rem;
	color: #333;
	margin: 20px 0;
	text-align: center;
`;

const DealsAndSavings: React.FC = () => {
	const [products, setProducts] = useState<any[]>([]);
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

	const currentPosts = products.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const breadcrumbPaths = [
		{ title: "Home", url: "/" },
		{
			title: "Deals and Savings",
			url: "/deals-and-savings",
		},
	];

	// Insert ads into the product list at specified positions
	const items = [];
	for (let i = 0; i < currentPosts.length; i++) {
		items.push(
			<ProductCard
				key={currentPosts[i].id}
				id={currentPosts[i].id}
				title={currentPosts[i].title}
				imageUrl={currentPosts[i].imageUrl}
				description={currentPosts[i].description}
				originalPrice={currentPosts[i].originalPrice}
				discountedPrice={currentPosts[i].discountedPrice}
				affiliateLink={currentPosts[i].affiliateLink}
			/>,
		);
		if ((i + 1) % 2 === 0) {
			items.push(
				<MobileBoxAdContainer key={`box-ad-${i}`}>
					<AdComponent width={250} height={250} />
				</MobileBoxAdContainer>,
			);
		}
		if ((i + 1) % 3 === 0) {
			items.push(
				<MobileAdContainer key={`mobile-ad-${i}`}>
					<AdComponent width={320} height={100} />
				</MobileAdContainer>,
			);
		}
	}

	return (
		<PageContainer ref={pageRef}>
			<BreadcrumbContainer>
				<Breadcrumb paths={breadcrumbPaths} />
			</BreadcrumbContainer>
			<TopAdContainer>
				<AdComponent width={728} height={90} />
			</TopAdContainer>
			<SectionHeading>Deals and Savings</SectionHeading>
			<ProductsGrid>{items}</ProductsGrid>
			<PaginationContainer
				totalItems={products.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</PageContainer>
	);
};

export default DealsAndSavings;
