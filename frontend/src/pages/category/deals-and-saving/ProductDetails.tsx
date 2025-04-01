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
	offers?: {
		availability?: string;
		price?: string;
	};
	specialOffer?: string;
}

// Custom HTML parser component
const SafeHTMLRenderer: React.FC<{ html: string }> = ({ html }) => {
	const parseHTML = (htmlString: string) => {
		const elements: JSX.Element[] = [];
		let remaining = htmlString;

		while (remaining.length > 0) {
			// Match different HTML patterns
			const h3Match = remaining.match(/<h3>(.*?)<\/h3>/);
			const ulMatch = remaining.match(/<ul>(.*?)<\/ul>/s);
			const liMatch = remaining.match(/<li>(.*?)<\/li>/);
			const pMatch = remaining.match(/<p>(.*?)<\/p>/);
			const strongMatch = remaining.match(/<strong>(.*?)<\/strong>/);

			if (h3Match) {
				elements.push(<h3 key={`h3-${elements.length}`}>{h3Match[1]}</h3>);
				remaining = remaining.slice(h3Match[0].length);
			} else if (ulMatch) {
				const listItems = ulMatch[1].split(/<li>(.*?)<\/li>/).filter(Boolean);
				elements.push(
					<ul key={`ul-${elements.length}`}>
						{listItems.map((item, i) => (
							<li key={`li-${i}`}>{item}</li>
						))}
					</ul>,
				);
				remaining = remaining.slice(ulMatch[0].length);
			} else if (liMatch) {
				elements.push(<li key={`li-${elements.length}`}>{liMatch[1]}</li>);
				remaining = remaining.slice(liMatch[0].length);
			} else if (pMatch) {
				elements.push(<p key={`p-${elements.length}`}>{pMatch[1]}</p>);
				remaining = remaining.slice(pMatch[0].length);
			} else if (strongMatch) {
				elements.push(
					<strong key={`strong-${elements.length}`}>{strongMatch[1]}</strong>,
				);
				remaining = remaining.slice(strongMatch[0].length);
			} else {
				// Handle plain text
				const text = remaining.split(/<[^>]+>/)[0];
				if (text) {
					elements.push(
						<React.Fragment key={`text-${elements.length}`}>
							{text}
						</React.Fragment>,
					);
					remaining = remaining.slice(text.length);
				} else {
					// Skip unmatched tags
					const tagMatch = remaining.match(/<[^>]+>/);
					if (tagMatch) {
						remaining = remaining.slice(tagMatch[0].length);
					} else {
						break;
					}
				}
			}
		}

		return elements;
	};

	return <div>{parseHTML(html)}</div>;
};

const ProductDetails: React.FC = () => {
	const { productSlug } = useParams<{ productSlug: string }>();
	const [product, setProduct] = useState<Product | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const navigate = useNavigate();

	useEffect(() => {
		let isMounted = true;

		const fetchProductDetails = async () => {
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

				if (!isMounted) return;

				if (!foundProduct) {
					throw new Error(`Product with ID ${productId} not found`);
				}

				setProduct(foundProduct);
				setError(null);
			} catch (err) {
				console.error("Error fetching product:", err);
				if (!isMounted) return;

				setError(err instanceof Error ? err.message : "Failed to load product");
				navigate("/shopping-deals", { replace: true });
			} finally {
				if (isMounted) {
					setLoading(false);
				}
			}
		};

		setLoading(true);
		setError(null);
		setProduct(null);
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
						<SafeHTMLRenderer html={product.description} />
						{product.specialOffer && product.specialOffer.trim() !== "" && (
							<p className='special-offer'>
								Get {product.specialOffer} Discount With Amazon Prime
								<a
									href='https://amzn.to/427UDnt'
									target='_blank'
									rel='noopener noreferrer'
								>
									Try It Free!
								</a>
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
							<p className='brand-name'> by {product.brand.name}</p>
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
