import React, { useEffect, useState, useRef } from "react";
import AdComponent from "../../../components/AdComponent";
import Breadcrumb from "../../../components/Breadcrumb";
import PaginationContainer from "../../../components/PaginationContainer";
import ProductCard from "./ProductCard";

import "./DealsAndSavings.css";

const DealsAndSavings: React.FC = () => {
	const [products, setProducts] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 12; // 4 rows per page
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
		if ((i + 1) % 6 === 0) {
			items.push(
				<div className='ad-row-container' key={`ad-row-${i}`}>
					<AdComponent width={660} height={440} />
				</div>,
			);
		}
	}

	return (
		<div className='page-container' ref={pageRef}>
			<div className='breadcrumb-container'>
				<Breadcrumb paths={breadcrumbPaths} />
			</div>
			<div className='top-ad-container'>
				<AdComponent width={728} height={90} />
			</div>
			<h2 className='section-heading'>Deals and Savings</h2>
			<div className='products-grid'>{items}</div>
			<PaginationContainer
				totalItems={products.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</div>
	);
};

export default DealsAndSavings;
