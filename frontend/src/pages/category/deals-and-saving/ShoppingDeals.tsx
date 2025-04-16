import React, { useEffect, useRef, useState, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PaginationContainer from "../../../components/PaginationContainer"; // Verify path
import "./ShoppingDeals.css";

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

// Interface for Product Data
interface Product {
	id: string;
	headline: string;
	image: { url: string; caption: string };
	description: string;
	currentPrice: string;
	discountPercentage?: string;
	mainEntityOfPage: string;
	purchaseUrl: string;
	specialOffer?: string;
	offers?: {
		"@type"?: "Offer";
		price?: string;
		priceCurrency?: string;
		url?: string;
		availability?: string;
		hasMerchantReturnPolicy?: string;
		shippingDetails?: string;
	};
	brand?: {
		"@type"?: "Brand";
		name: string;
	};
	aggregateRating?: {
		"@type": "AggregateRating";
		ratingValue: string;
		reviewCount: string;
	};
	datePublished?: string;
	dateModified?: string;
	keywords?: string[];
	designer?: object;
	publisher?: object;
	canonicalUrl?: string;
}

// Product Card Sub-Component
const ProductCard: React.FC<Product> = ({
	id,
	headline,
	image,
	description,
	currentPrice,
	discountPercentage,
	specialOffer,
	aggregateRating,
	canonicalUrl,
}) => {
	const productSlug = `${id}-${headline
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")}`;

	const descriptionSnippet =
		description
			?.replace(/<[^>]+>/g, "")
			.replace(/\s+/g, " ")
			.trim()
			.substring(0, 150) + (description?.length > 150 ? "..." : "");

	const renderStars = (ratingValue: string | undefined): React.ReactNode => {
		if (!ratingValue) return null;
		const rating = parseFloat(ratingValue);
		if (isNaN(rating)) return null;
		return Array.from({ length: 5 }, (_, i) => {
			const starType =
				rating >= i + 1 ? "filled" : rating >= i + 0.5 ? "half" : "empty";
			return (
				<span key={i} className={`sd-star sd-star-${starType}`}>
					★
				</span>
			);
		});
	};

	return (
		<div className='sd-product-card' data-id={id}>
			<Link
				to={canonicalUrl || "#"}
				aria-label={`View details for ${headline}`}
			>
				<img
					src={image.url}
					alt={image.caption || headline}
					className='sd-product-image'
					loading='lazy'
				/>
			</Link>
			<div className='sd-product-details'>
				<h2 className='sd-product-title'>
					<Link to={canonicalUrl || "#"}>{headline}</Link>
				</h2>
				<p className='sd-product-description-snippet'>{descriptionSnippet}</p>
				<div className='sd-product-price-section'>
					{discountPercentage && (
						<span className='sd-discount-percentage'>
							{discountPercentage}% OFF
						</span>
					)}
					<span className='sd-current-price'>{currentPrice}</span>
				</div>
				{specialOffer && (
					<p className='sd-special-offer-badge'>{specialOffer}</p>
				)}

				{/* --- Rating Section --- */}
				{aggregateRating && (
					<div className='sd-product-rating'>
						{/* Stars */}
						{aggregateRating.ratingValue && (
							<span className='sd-stars'>
								{renderStars(aggregateRating.ratingValue)}
							</span>
						)}
						{/* Numeric Value */}
						{aggregateRating.ratingValue && (
							<span className='sd-rating-value'>
								({aggregateRating.ratingValue})
							</span>
						)}
						{/* --- FIX: Add Review Count --- */}
						{aggregateRating.reviewCount && (
							<span className='sd-review-count'>
								({aggregateRating.reviewCount} Amazon reviews)
							</span>
						)}
						{/* --- End Fix --- */}
					</div>
				)}
				{/* --- End Rating Section --- */}

				<div className='sd-product-actions'>
					<Link to={canonicalUrl || "#"} className='sd-view-details-button'>
						View Details
					</Link>
				</div>
			</div>
		</div>
	);
};

// Main ShoppingDeals Component (No changes needed below this line for this specific fix)
const ShoppingDeals: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 12;

	// Effect to Fetch Products
	useEffect(() => {
		setLoading(true);
		setError(null);
		document.title = "Deals and Savings - Best Shopping Discounts";
		fetch("/data/products.json")
			.then((res) => {
				if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
				return res.json();
			})
			.then((data: Product[]) => {
				const uniqueProducts = data.filter(
					(p, i, a) => a.findIndex((t) => t.id === p.id) === i,
				);
				setProducts(uniqueProducts);
			})
			.catch((err) => {
				setError(err instanceof Error ? err.message : "Failed to load deals.");
			})
			.finally(() => {
				setLoading(false);
			});
	}, []); // Fetch only once

	// Effect to Scroll Top on Page Change
	useEffect(() => {
		const isInitialMount = currentPage === 1;
		if (!isInitialMount) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [currentPage]);

	// Prepare Products for Display
	const currentProducts = useMemo(() => {
		const startIndex = (currentPage - 1) * postsPerPage;
		const endIndex = startIndex + postsPerPage;
		return products.slice(startIndex, endIndex);
	}, [products, currentPage, postsPerPage]);

	// Generate Schema.org JSON-LD
	const schemaData = useMemo(
		() => ({
			"@context": "https://schema.org",
			"@type": "ItemList",
			name: "Shopping Deals",
			description: "Current deals and savings on various products.",
			url: "https://www.dollarsandlife.com/shopping-deals",
			itemListElement: products.map((p: Product, i: number) => ({
				"@type": "ListItem",
				position: i + 1,
				item: {
					/* ... schema item details ... */
				},
			})),
		}),
		[products],
	);

	// Render UI
	return (
		<div className='sd-page-container'>
			<Helmet>
				<title>Deals and Savings - Best Shopping Discounts</title>
				<meta
					name='description'
					content='Find the best deals and savings on top products.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/shopping-deals'
				/>
				<script type='application/ld+json'>{JSON.stringify(schemaData)}</script>
			</Helmet>
			<h1 className='sd-page-title'>Deals and Savings</h1>
			{loading && <div className='sd-loading-indicator'>Loading Deals...</div>}
			{error && <div className='sd-error-indicator'>Error: {error}</div>}
			{!loading && !error && currentProducts.length > 0 && (
				<div className='sd-products-grid'>
					{currentProducts.map((product: Product) => (
						<ProductCard key={product.id} {...product} />
					))}
				</div>
			)}
			{!loading && !error && currentProducts.length === 0 && (
				<div className='sd-no-products'>No deals available.</div>
			)}
			{products.length > postsPerPage && (
				<PaginationContainer
					totalItems={products.length}
					itemsPerPage={postsPerPage}
					currentPage={currentPage}
					setCurrentPage={setCurrentPage}
				/>
			)}
		</div>
	);
};

export default ShoppingDeals;
