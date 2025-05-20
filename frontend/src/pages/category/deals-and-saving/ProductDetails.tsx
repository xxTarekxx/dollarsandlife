import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import parse from "html-react-parser";
import "./ProductDetails.css";

interface Product {
	id: string;
	headline: string;
	image: { url: string; caption: string };
	description: string;
	currentPrice: string;
	discountPercentage?: string;
	brand?: { name: string };
	purchaseUrl: string;
	offers?: { availability?: string; displayShippingInfo?: string };
	specialOffer?: string;
	aggregateRating?: {
		ratingValue: string;
		reviewCount: string;
	};
}

const ProductDetails: React.FC = () => {
	const { productSlug } = useParams<{ productSlug: string }>();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [notFound, setNotFound] = useState(false);

	useEffect(() => {
		let isMounted = true;

		if (!productSlug || !/^\d+-/.test(productSlug)) {
			setNotFound(true);
			return;
		}

		const productId = productSlug.split("-")[0];

		const fetchProduct = async () => {
			try {
				const response = await fetch(
					`${process.env.REACT_APP_API_BASE}/shopping-deals/${productId}`,
				);
				if (!response.ok) throw new Error("Failed to fetch product data");

				const product: Product = await response.json();
				if (isMounted) {
					setProduct(product);
					setNotFound(false);
				}
			} catch {
				if (isMounted) setNotFound(true);
			} finally {
				if (isMounted) setLoading(false);
			}
		};

		fetchProduct();
		window.scrollTo({ top: 0, behavior: "smooth" });
		return () => {
			isMounted = false;
		};
	}, [productSlug]);

	if (loading) {
		return (
			<div className='pdf-status-container pdf-loading'>
				<div className='pdf-spinner'></div>
				<p>Loading Product...</p>
			</div>
		);
	}

	if (notFound) {
		return <Navigate to='/404' replace />;
	}

	if (!product) return null;

	const isInStock = product.offers?.availability?.includes("InStock") ?? false;
	const stockStatusText = isInStock ? "In Stock" : "Out Of Stock";
	const stockStatusClass = isInStock ? "in-stock" : "out-of-stock";
	const metaDesc =
		product.description
			?.replace(/<[^>]+>/g, "")
			.replace(/\s+/g, " ")
			.trim()
			.substring(0, 160) ?? "";

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

	return (
		<div className='pdf-container'>
			<Helmet>
				<title>{`${product.headline} | Shopping Deals`}</title>
				<meta name='description' content={metaDesc} />
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "Product",
						name: product.headline,
						image: product.image.url,
						description: metaDesc,
						brand: {
							"@type": "Brand",
							name: product.brand?.name || "Generic",
						},
						offers: {
							"@type": "Offer",
							priceCurrency: "USD",
							price: product.currentPrice.replace("$", ""),
							availability:
								product.offers?.availability || "https://schema.org/InStock",
							url: product.purchaseUrl,
						},
						aggregateRating: product.aggregateRating
							? {
									"@type": "AggregateRating",
									ratingValue: product.aggregateRating.ratingValue,
									reviewCount: product.aggregateRating.reviewCount,
							  }
							: undefined,
					})}
				</script>
			</Helmet>

			<article className='pdf-card'>
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

				<div className='pdf-info-section'>
					<header className='pdf-header'>
						<h1>{product.headline}</h1>
						{product.brand && (
							<span className='pdf-brand'>by {product.brand.name}</span>
						)}
					</header>

					<div className='pdf-description'>{parse(product.description)}</div>

					{product.offers?.displayShippingInfo?.includes(
						"Free Prime Delivery",
					) && (
						<p className='pdf-shipping-info'>
							<strong>Free Prime Delivery</strong> —{" "}
							<a
								href='https://amzn.to/4cTcIec'
								target='_blank'
								rel='noopener noreferrer'
							>
								Try Amazon Prime Free
							</a>
						</p>
					)}

					<div className='pdf-price-stock-section'>
						<span className='pdf-price'>{product.currentPrice}</span>
						<span className={`pdf-stock-status pdf-stock-${stockStatusClass}`}>
							{stockStatusText}
						</span>
					</div>

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

					{product.specialOffer && (
						<p className='pdf-special-offer'>{product.specialOffer}</p>
					)}

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
							onClick={() => window.history.back()}
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
