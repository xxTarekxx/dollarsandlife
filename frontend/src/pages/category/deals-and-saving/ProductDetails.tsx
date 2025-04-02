import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
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
	offers?: { availability?: string };
	specialOffer?: string;
}

const ProductDetails: React.FC = () => {
	const { productSlug } = useParams<{ productSlug: string }>();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		let isMounted = true;

		const fetchProductDetails = async () => {
			setLoading(true);
			setError(null);

			try {
				if (!productSlug || !/^\d+-/.test(productSlug)) {
					throw new Error("Invalid product URL format");
				}

				const productId = productSlug.split("-")[0];
				const response = await fetch("/data/products.json");

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const products: Product[] = await response.json();
				const foundProduct = products.find((p: Product) => p.id === productId);

				if (isMounted) {
					if (!foundProduct) {
						setError(`Product with ID ${productId} not found`);
						navigate("/shopping-deals", { replace: true });
					} else {
						setProduct(foundProduct);
					}
				}
			} catch (err) {
				if (isMounted) {
					setError(
						err instanceof Error ? err.message : "Failed to load product",
					);
					navigate("/shopping-deals", { replace: true });
				}
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		fetchProductDetails();

		return () => {
			isMounted = false;
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

	const isInStock = product.offers?.availability?.includes("InStock");
	const stockStatus = isInStock ? "In Stock" : "Out Of Stock";
	const stockClass = isInStock ? "in-stock" : "out-of-stock";

	const parseDescription = (html: string) => {
		const elements: React.ReactNode[] = [];
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;

		Array.from(tempDiv.childNodes).forEach((node) => {
			if (node.nodeType === Node.ELEMENT_NODE) {
				const element = node as HTMLElement;
				if (element.tagName === "H3") {
					elements.push(
						<h3 key={elements.length} className='modern-h3'>
							{element.textContent}
						</h3>,
					);
				} else if (element.tagName === "P") {
					elements.push(
						<p key={elements.length} className='modern-p'>
							{element.textContent}
						</p>,
					);
				} else if (element.classList.contains("feature-list")) {
					Array.from(element.childNodes).forEach((featureNode) => {
						if (featureNode.nodeType === Node.ELEMENT_NODE) {
							const featureElement = featureNode as HTMLElement;
							if (featureElement.classList.contains("feature-section")) {
								elements.push(
									<div key={elements.length} className='modern-feature-section'>
										{featureElement.textContent}
									</div>,
								);
							} else if (featureElement.classList.contains("feature-item")) {
								elements.push(
									<div key={elements.length} className='modern-feature-item'>
										{featureElement.textContent}
									</div>,
								);
							}
						}
					});
				}
			}
		});
		return elements;
	};

	return (
		<div className='product-details-container'>
			<Helmet>
				<title>{product.headline} | Shopping Deals</title>
				<meta
					name='description'
					content={product.description
						.replace(/<[^>]+>/g, "")
						.substring(0, 160)}
				/>
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
						{parseDescription(product.description)}
						{product.specialOffer && product.specialOffer.trim() !== "" && (
							<p className='special-offer'>
								Get {product.specialOffer} Discount With Amazon Prime
								<a
									href='https://amzn.to/427UDnt'
									target='_blank'
									rel='noopener noreferrer'
								>
									Try It Free!
								</a>{" "}
								for 30 days
							</p>
						)}
					</div>

					<div className='price-section'>
						<div className='price-stock-group'>
							<span className='current-price'>{product.currentPrice}</span>
							<span className={`stock-status ${stockClass}`}>
								{stockStatus}
							</span>
						</div>
						{product.brand && (
							<p className='brand-name'>by {product.brand.name}</p>
						)}
					</div>

					<div className='action-buttons'>
						{isInStock ? (
							<a
								href={product.purchaseUrl}
								target='_blank'
								rel='noopener noreferrer'
								className='purchase-button'
							>
								Buy Now
							</a>
						) : (
							<button className='notify-button'>Notify When Available</button>
						)}
						<button
							onClick={() => navigate("/shopping-deals")}
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
