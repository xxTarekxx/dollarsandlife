import React, { useEffect, useState, useRef } from "react";
import AdComponent from "../../../components/AdComponent";
import Breadcrumb from "../../../components/Breadcrumb";
import PaginationContainer from "../../../components/PaginationContainer";
import "./DealsAndSavings.css";

interface ProductCardProps {
	id: string;
	title: string;
	imageUrl: string;
	description: string;
	originalPrice: string;
	discountedPrice: string;
	affiliateLink: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
	title,
	imageUrl,
	description,
	originalPrice,
	discountedPrice,
	affiliateLink,
}) => {
	return (
		<div className='CardContainer'>
			<img src={imageUrl} alt={title} className='CardImage' />
			<div className='CardContent'>
				<h3 className='CardTitle'>{title}</h3>
				<p className='CardDescription'>{description}</p>
				<p className='CardPrice'>
					<span className='OriginalPrice'>{originalPrice}</span>
					<span className='DiscountedPrice'>{discountedPrice}</span>
				</p>
				<a
					href={affiliateLink}
					target='_blank'
					rel='noopener noreferrer'
					className='BuyNowButton'
				>
					Buy Now
				</a>
			</div>
		</div>
	);
};

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
		<div className='PageContainer' ref={pageRef}>
			<div className='TopAdContainer'>
				<AdComponent width={728} height={90} />
			</div>
			<h2 className='SectionHeading'>Deals and Savings</h2>
			{rows.map((row, rowIndex) => (
				<React.Fragment key={rowIndex}>
					<div className='ProductsGrid'>
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
					</div>
					{(rowIndex + 1) % 2 === 0 && (
						<div className='AdRowContainer'>
							<AdComponent width={660} height={440} />
						</div>
					)}
					{(rowIndex + 1) % 2 === 0 && (
						<div className='MobileBoxAdContainer'>
							<AdComponent width={250} height={250} />
						</div>
					)}
					{(rowIndex + 1) % 2 === 0 && (
						<div className='MobileAdContainer'>
							<AdComponent width={320} height={100} />
						</div>
					)}
				</React.Fragment>
			))}
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
