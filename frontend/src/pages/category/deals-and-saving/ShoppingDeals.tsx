import React, { useEffect, useRef, useState } from "react";
import "../../../components/AdComponent.css";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "./ShoppingDeals.css";

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

// Define a type for the product data
interface Product {
	id: string;
	title: string;
	imageUrl: string;
	description: string;
	currentPrice: string;
	discountPercentage?: string;
	affiliateLink: string;
}

interface ProductCardProps extends Product {}

const ProductCard: React.FC<ProductCardProps> = ({
	id,
	title,
	imageUrl,
	description,
	currentPrice,
	discountPercentage,
	affiliateLink,
}) => {
	return (
		<div className='CardContainer' data-id={id}>
			<img
				src={imageUrl}
				alt={title}
				className='CardImage'
				srcSet={`${imageUrl} 1x, ${imageUrl.replace(".webp", "@2x.webp")} 2x`}
				loading='lazy'
			/>
			<div className='CardContent'>
				<h3 className='CardTitle'>{title}</h3>
				<p className='CardDescription'>
					<span className='CardDescriptionText'>{description}</span>
				</p>
				{discountPercentage && (
					<p className='CardPrice'>
						<span className='DiscountPercentage'>
							Discount: {discountPercentage}
						</span>
					</p>
				)}
				<p className='CardPrice'>Now: {currentPrice}</p>
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

const ShoppingDeals: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Deals and Savings";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/products.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const products: Product[] = await response.json();
				setProducts(products);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	// useEffect(() => {
	// 	if (pageRef.current) {
	// 		pageRef.current.scrollIntoView({ behavior: "smooth" });
	// 	}
	// }, [currentPage]);

	// ✅ Completely remove auto-scrolling
	useEffect(() => {
		// Do nothing (no scrolling at all)
	}, [currentPage]);

	useEffect(() => {
		setTimeout(() => {
			const adContainers = document.querySelectorAll(".postings-container");
			let adsPushed = false;
			adContainers.forEach((adContainer) => {
				if (
					(adContainer as HTMLElement).offsetWidth > 0 &&
					(adContainer as HTMLElement).offsetHeight > 0
				) {
					if (!adsPushed) {
						console.log("Pushing AdSense ads...");
						(window.adsbygoogle = window.adsbygoogle || []).push({});
						adsPushed = true;
					}
				}
			});
		}, 2000);
	}, []);

	const currentPosts = products.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const items: JSX.Element[] = [];
	const numColumns = window.innerWidth > 600 ? 3 : 1; // Detects mobile vs desktop layout

	for (let i = 0; i < currentPosts.length; i += numColumns) {
		const rowItems = currentPosts
			.slice(i, i + numColumns)
			.map((product) => <ProductCard key={product.id} {...product} />);

		items.push(
			<React.Fragment key={i}>
				<div className='ProductsGrid'>{rowItems}</div>
				<div className='postings-container'>
					<ins
						className='adsbygoogle'
						style={{ display: "block", width: "300px", height: "250px" }}
						data-ad-client='ca-pub-2295073683044412'
						data-ad-slot='9380614635'
						data-ad-format='rectangle'
						data-full-width-responsive='false'
					/>
				</div>
			</React.Fragment>,
		);
	}

	return (
		<div className='PageContainer' ref={pageRef}>
			<div className='top-banner-container'>
				<a
					href='https://lycamobileusa.sjv.io/c/5513478/2107177/25589'
					target='_blank'
					rel='noopener noreferrer'
					className='TopBanner'
				>
					<img
						src='/images/shoppinganddeals/Lyca-Mobile-728x90.webp'
						alt='Lyca Mobile Banner'
						className='TopBannerImage'
						loading='eager'
					/>
				</a>
			</div>
			<h1>Deals and Savings</h1>
			{items}
			<PaginationContainer
				totalItems={products.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
			<div className='postings-container'>
				<ins
					className='adsbygoogle'
					style={{ display: "block", width: "728px", height: "90px" }}
					data-ad-client='ca-pub-2295073683044412'
					data-ad-slot='9380614635'
					data-ad-format='horizontal'
					data-full-width-responsive='false'
				/>
			</div>
		</div>
	);
};

export default ShoppingDeals;
