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

	const rows = [];
	for (let i = 0; i < currentPosts.length; i += 3) {
		rows.push(currentPosts.slice(i, i + 3));
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
			{rows.map((row, rowIndex) => (
				<React.Fragment key={rowIndex}>
					<ProductsGrid>
						{row.map((productData) => (
							<ProductCard
								key={productData.id}
								id={productData.id}
								title={productData.title}
								imageUrl={productData.imageUrl}
								description={productData.description}
								originalPrice={productData.originalPrice}
								discountedPrice={productData.discountedPrice}
								affiliateLink={productData.affiliateLink}
							/>
						))}
					</ProductsGrid>
					{(rowIndex + 1) % 2 === 0 && (
						<AdRowContainer>
							<AdComponent width={660} height={440} />
						</AdRowContainer>
					)}
					{(rowIndex + 1) % 2 === 0 && (
						<MobileBoxAdContainer>
							<AdComponent width={250} height={250} />
						</MobileBoxAdContainer>
					)}
					{(rowIndex + 1) % 2 === 0 && (
						<MobileAdContainer>
							<AdComponent width={320} height={100} />
						</MobileAdContainer>
					)}
				</React.Fragment>
			))}
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
