import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import parse from "html-react-parser"; // Use the parser
import "./ProductDetails.css"; // Ensure CSS is imported

// Interface for Product Data (Matches JSON structure)
interface Product {
	id: string;
	headline: string;
	image: { url: string; caption: string };
	description: string;
	currentPrice: string;
	discountPercentage?: string;
	brand?: { name: string };
	purchaseUrl: string;
	offers?: { availability?: string };
	specialOffer?: string;
	aggregateRating?: {
		ratingValue: string;
		reviewCount: string;
	};
}

// The Component
const ProductDetails: React.FC = () => {
	const { productSlug } = useParams<{ productSlug: string }>();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	// Effect for Data Fetching
	useEffect(() => {
		let isMounted = true;

		if (!productSlug) {
			setError("Invalid product URL.");
			setLoading(false);
			setProduct(null);
			return;
		}

		setLoading(true);
		setError(null);
		setProduct(null); // Clear previous product on new fetch

		const fetchProduct = async () => {
			try {
				if (!/^\d+-/.test(productSlug))
					throw new Error("Invalid product URL format.");
				const productId = productSlug.split("-")[0];

				const response = await fetch("/data/products.json");
				if (!response.ok)
					throw new Error(`HTTP error! Status: ${response.status}`);

				const allProducts: Product[] = await response.json();
				const foundProduct = allProducts.find((p) => p.id === productId);

				if (isMounted) {
					if (foundProduct) {
						setProduct(foundProduct);
						setError(null);
					} else {
						setError(`Product not found (ID: ${productId}).`);
					}
				}
			} catch (err) {
				if (isMounted) {
					setError(
						err instanceof Error
							? err.message
							: "An unknown fetch error occurred.",
					);
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchProduct();
		window.scrollTo({ top: 0, behavior: "smooth" });

		// Cleanup function
		return () => {
			isMounted = false;
		};
	}, [productSlug, navigate]);

	// --- Render States ---
	if (loading) {
		return (
			<div className='pdf-status-container pdf-loading'>
				<div className='pdf-spinner'></div>
				<p>Loading Product...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='pdf-status-container pdf-error'>
				<h2>Error Loading Product</h2>
				<p>{error}</p>
				<button
					onClick={() => navigate("/shopping-deals")}
					className='pdf-button pdf-button-back'
				>
					Back to Deals
				</button>
			</div>
		);
	}

	if (!product) {
		return (
			<div className='pdf-status-container pdf-error'>
				<h2>Product Not Available</h2>
				<p>The requested product data could not be displayed.</p>
				<button
					onClick={() => navigate("/shopping-deals")}
					className='pdf-button pdf-button-back'
				>
					Back to Deals
				</button>
			</div>
		);
	}

	// --- Prepare derived data ---
	const isInStock = product.offers?.availability?.includes("InStock") ?? false;
	const stockStatusText = isInStock ? "In Stock" : "Out Of Stock";
	const stockStatusClass = isInStock ? "in-stock" : "out-of-stock";
	const metaDesc =
		product.description
			?.replace(/<[^>]+>/g, "")
			.replace(/\s+/g, " ")
			.trim()
			.substring(0, 160) ?? "";

	// --- Star rendering logic ---
	const renderStars = (ratingValue: string | undefined): React.ReactNode => {
		if (!ratingValue) return null;
		const rating = parseFloat(ratingValue);
		if (isNaN(rating)) return null;
		return Array.from({ length: 5 }, (_, i) => {
			const starType =
				rating >= i + 1 ? "filled" : rating >= i + 0.5 ? "half" : "empty";
			return (
				<span key={i} className={`pdf-star pdf-star-${starType}`}>
					★
				</span>
			);
		});
	};

	// --- Render Product Details ---
	return (
		<div className='pdf-container'>
			<Helmet>
				<title>{`${product.headline} | Shopping Deals`}</title>
				<meta name='description' content={metaDesc} />
			</Helmet>

			<article className='pdf-card'>
				{/* Image Column */}
				<div className='pdf-image-section'>
					<img
						src={product.image.url}
						alt={product.image.caption || product.headline}
						className='pdf-image'
						loading='eager'
					/>
					{product.discountPercentage && (
						<span className='pdf-discount-badge'>
							{product.discountPercentage} OFF
						</span>
					)}
				</div>

				{/* Info Column */}
				<div className='pdf-info-section'>
					{/* Header */}
					<header className='pdf-header'>
						<h1>{product.headline}</h1>
						{product.brand && (
							<span className='pdf-brand'>by {product.brand.name}</span>
						)}
					</header>

					{/* Description (Parsed HTML) */}
					<div className='pdf-description'>{parse(product.description)}</div>

					{/* Price & Stock */}
					<div className='pdf-price-stock-section'>
						<span className='pdf-price'>{product.currentPrice}</span>
						<span className={`pdf-stock-status pdf-stock-${stockStatusClass}`}>
							{stockStatusText}
						</span>
					</div>

					{/* Rating */}
					{product.aggregateRating && (
						<div className='pdf-rating'>
							<span className='pdf-stars'>
								{renderStars(product.aggregateRating.ratingValue)}
							</span>
							{product.aggregateRating.ratingValue && (
								<span className='pdf-rating-value'>
									({product.aggregateRating.ratingValue})
								</span>
							)}
							{product.aggregateRating.reviewCount && (
								<span className='pdf-review-count'>
									{product.aggregateRating.reviewCount} reviews
								</span>
							)}
						</div>
					)}

					{/* Optional Special Offer */}
					{product.specialOffer && (
						<p className='pdf-special-offer'>{product.specialOffer}</p>
					)}

					{/* Action Buttons */}
					<div className='pdf-actions'>
						{isInStock ? (
							<a
								href={product.purchaseUrl}
								target='_blank'
								rel='noopener noreferrer'
								className='pdf-button pdf-button-buy'
							>
								Buy Now
							</a>
						) : (
							<button className='pdf-button pdf-button-oos' disabled>
								Out Of Stock
							</button>
						)}
						<button
							onClick={() => navigate("/shopping-deals")}
							className='pdf-button pdf-button-back'
						>
							Back to Deals
						</button>
					</div>
				</div>
			</article>
		</div>
	);
};

export default ProductDetails;
