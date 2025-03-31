import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import "./ProductDetails.css";

interface Product {
	id: string;
	headline: string;
	shortName?: string;
	image: {
		url: string;
		caption: string;
	};
	description: string;
	currentPrice: string;
	discountPercentage?: string;
	mainEntityOfPage: string;
	keywords?: string[];
	brand?: {
		name: string;
	};
	purchaseUrl: string;
}

const ProductDetails: React.FC = () => {
	const { productSlug } = useParams<{ productSlug: string }>();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		let isMounted = true; // Flag to prevent state updates after unmount

		const fetchProductDetails = async () => {
			try {
				// Debug: Log the incoming productSlug
				console.log("Fetching product for slug:", productSlug);

				// Validate productSlug format first
				if (!productSlug || !/^\d+-/.test(productSlug)) {
					throw new Error("Invalid product URL format");
				}

				// Extract ID from "28-laneige-lip-sleeping-mask"
				const productId = productSlug.split("-")[0];
				console.log("Extracted product ID:", productId);

				const response = await fetch("/data/products.json");
				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const products: Product[] = await response.json();

				const foundProduct = products.find((p: Product) => p.id === productId);

				if (!isMounted) return; // Don't update if component unmounted

				if (!foundProduct) {
					throw new Error(`Product with ID ${productId} not found`);
				}

				setProduct(foundProduct);
				setError(null);
			} catch (err) {
				console.error("Error fetching product:", err);
				if (!isMounted) return;

				setError(err instanceof Error ? err.message : "Failed to load product");
				// Redirect with replace to prevent back navigation to broken URL
				navigate("/shopping-deals", { replace: true });
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		// Reset states when starting new fetch
		setLoading(true);
		setError(null);
		setProduct(null);

		fetchProductDetails();

		return () => {
			isMounted = false; // Cleanup function
		};
	}, [productSlug, navigate]);

	if (loading) {
		return (
			<div className='product-details-loading'>
				<div className='loading-spinner'></div>
				<p>Loading product details...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className='product-details-error'>
				<p>{error}</p>
				<p>Redirecting back to shopping deals...</p>
			</div>
		);
	}

	if (!product) return null;

	return (
		<div className='product-details-container'>
			<Helmet>
				<title>{product.headline} | Shopping Deals</title>
				<meta
					name='description'
					content={product.description.substring(0, 160)}
				/>
				{product.keywords && (
					<meta name='keywords' content={product.keywords.join(", ")} />
				)}
			</Helmet>

			<article className='product-details-card'>
				<div className='product-image-wrapper'>
					<img
						src={product.image.url}
						alt={product.image.caption}
						className='product-image'
						loading='eager'
					/>
					{product.discountPercentage && (
						<span className='discount-badge'>
							{product.discountPercentage} OFF
						</span>
					)}
				</div>

				<div className='product-info'>
					<div className='product-header'>
						<h1>{product.headline}</h1>
					</div>

					<div className='product-description'>
						<p>{product.description}</p>
					</div>
					<div className='price-section'>
						<span className='current-price'>{product.currentPrice}</span>
						{product.brand && (
							<span className='brand-name'> by {product.brand.name}</span>
						)}
					</div>
					<div className='action-buttons'>
						<a
							href={product.purchaseUrl}
							target='_blank'
							rel='noopener noreferrer'
							className='purchase-button'
						>
							Buy Now
						</a>
						<button
							onClick={() => window.open("/shopping-deals", "_blank")}
							className='back-button'
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
