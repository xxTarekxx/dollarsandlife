import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import parse from "html-react-parser"; // Use the parser

// Import the corresponding CSS file
import "./ProductDetails.css";

// --- Interface for Product Data ---
interface Product {
	id: string;
	headline: string;
	image: { url: string; caption: string };
	description: string; // HTML string from JSON
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
	// Add any other fields from your JSON structure if needed
}

// --- The Component ---
const ProductDetails: React.FC = () => {
	// Using the original name
	const { productSlug } = useParams<{ productSlug: string }>();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	// --- Log Mount/Update ---
	useEffect(() => {
		console.log(
			`[ProductDetails MOUNT/REMOUNT] Triggered for slug: ${
				productSlug ?? "undefined"
			}`,
		);
		return () => {
			console.log(
				`%c[ProductDetails UNMOUNT] Cleaning up for slug: ${
					productSlug ?? "undefined"
				}`,
				"color: red; font-weight: bold;",
			);
		};
	}, [productSlug]);

	// --- Effect for Data Fetching ---
	useEffect(() => {
		let isMounted = true;
		console.log(`[Effect - Fetch] START for slug: ${productSlug}`);

		if (!productSlug) {
			console.error("[Effect - Fetch] Error: No product slug provided.");
			setError("Invalid product URL.");
			setLoading(false);
			setProduct(null); // Clear product if slug is missing
			return;
		}

		// Reset state for the new product load
		setLoading(true);
		setError(null);
		setProduct(null); // Explicitly clear previous product

		const fetchProduct = async () => {
			try {
				if (!/^\d+-/.test(productSlug))
					throw new Error("Invalid product URL format.");
				const productId = productSlug.split("-")[0];
				console.log(`[Effect - Fetch] Fetching JSON for ID: ${productId}`);

				const response = await fetch("/data/products.json"); // Ensure this path is correct
				if (!response.ok)
					throw new Error(`HTTP error! Status: ${response.status}`);

				const allProducts: Product[] = await response.json();
				const foundProduct = allProducts.find((p) => p.id === productId);

				if (isMounted) {
					if (foundProduct) {
						console.log(
							`[Effect - Fetch] Success: Product ${productId} found. Setting state.`,
						);
						setProduct(foundProduct);
						setError(null);
					} else {
						console.error(
							`[Effect - Fetch] Error: Product ${productId} not found in JSON.`,
						);
						setError(`Product not found (ID: ${productId}).`);
					}
				} else {
					console.log(
						`[Effect - Fetch] Aborted: Component unmounted before fetch completed for ${productId}.`,
					);
				}
			} catch (err) {
				console.error("[Effect - Fetch] Error:", err);
				if (isMounted) {
					setError(
						err instanceof Error
							? err.message
							: "An unknown fetch error occurred.",
					);
				}
			} finally {
				if (isMounted) {
					console.log(
						`[Effect - Fetch] FINALLY: Setting loading=false for ${productSlug}.`,
					);
					setLoading(false);
				}
			}
		};

		fetchProduct();
		window.scrollTo({ top: 0, behavior: "smooth" });

		return () => {
			console.log(`[Effect - Fetch] CLEANUP running for ${productSlug}.`);
			isMounted = false;
		};
	}, [productSlug, navigate]);

	// --- Render States ---
	if (loading) {
		console.log(`[Render] LOADING state for slug: ${productSlug}`);
		return (
			<div className='pdf-status-container pdf-loading'>
				{" "}
				{/* Using pdf- classes */}
				<div className='pdf-spinner'></div>
				<p>Loading Product...</p>
			</div>
		);
	}

	if (error) {
		console.log(
			`[Render] ERROR state for slug: ${productSlug}, Error: ${error}`,
		);
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
		console.log(`[Render] NO PRODUCT state for slug: ${productSlug}`);
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

	// --- If loading=false and product exists, render details ---
	console.log(`[Render] SUCCESS state for product: ${product.id}`);

	// --- Prepare derived data ---
	const isInStock = product.offers?.availability?.includes("InStock") ?? false;
	const stockStatusText = isInStock ? "In Stock" : "Out Of Stock";
	const stockStatusClass = isInStock ? "in-stock" : "out-of-stock"; // Keep class name consistent if needed elsewhere
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
			// This logic correctly determines filled/half/empty
			const starType =
				rating >= i + 1 ? "filled" : rating >= i + 0.5 ? "half" : "empty";
			return (
				<span key={i} className={`pdf-star pdf-star-${starType}`}>
					★
				</span>
			);
		});
	};

	return (
		// Using pdf- prefixed classes
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
							{" "}
							{/* pdf-stock-in-stock / pdf-stock-out-of-stock */}
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

export default ProductDetails; // Export with the original name
