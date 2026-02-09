"use client"; // Still needed for useState, useEffect, useMemo for pagination and client-side interactions
import { GetServerSideProps } from "next"; // Added
import Head from "next/head";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react"; // Added useCallback
import PaginationContainer from "src/components/pagination/PaginationContainer";
import { getCanonicalUrl, getJsonLdUrl } from "../../src/utils/url";

interface Product {
	id: string;
	headline: string;
	shortName?: string;
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
		displayShippingInfo?: string;
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

// cleanText and ProductCard component remain the same

const cleanText = (text: string): string => {
	if (!text || typeof text !== "string") return "";

	// Broader regex to find anything that looks like a tag or entity
	const htmlEntitiesAndTagsRegex = /<[^>]*>|&[a-zA-Z0-9#]+;/g;

	// Replacement function to be absolutely sure no partial tags/entities remain
	const deepClean = (input: string): string => {
		let sanitized = input;
		let previous;
		do {
			previous = sanitized;
			sanitized = sanitized.replace(htmlEntitiesAndTagsRegex, "");
		} while (sanitized !== previous);

		// Remove any stray angle brackets or ampersands that might be left
		sanitized = sanitized.replace(/[<>&\s]/g, " ").trim(); // Replace with space and then trim

		// Additionally, remove any non-alphanumeric characters for safety in slugs/URLs
		// but keep spaces to be replaced by hyphens later.
		sanitized = sanitized.replace(/[^a-zA-Z0-9\s-]/g, "");

		return sanitized;
	};


	return deepClean(text);
};

const ProductCard: React.FC<Product> = ({
	id,
	headline,
	shortName,
	image,
	description,
	currentPrice,
	discountPercentage,
	specialOffer,
	aggregateRating,
	offers,
	canonicalUrl,
}) => {
	// Use canonicalUrl from DB when present; otherwise build from id + shortName/headline
	const detailUrl = canonicalUrl
		? (canonicalUrl.startsWith("http")
			? new URL(canonicalUrl).pathname
			: canonicalUrl.startsWith("/")
				? canonicalUrl
				: `/${canonicalUrl}`)
		: (() => {
				const nameForSlug = shortName || headline;
				const slug = nameForSlug
					.toLowerCase()
					.replace(/[^a-z0-9\s-]/g, "")
					.replace(/\s+/g, "-");
				return `/shopping-deals/products/${id}-${slug}`;
			})();

	const descriptionSnippet = useMemo(() => {
		if (!description) return "";
		const cleaned = cleanText(description);
		// Use Array.from to correctly handle Unicode characters
		const truncated = Array.from(cleaned).slice(0, 150).join('');
		return truncated + (Array.from(cleaned).length > 150 ? "..." : "");
	}, [description]);

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
			<Link href={detailUrl} aria-label={`View details for ${headline}`}>
				<img
					src={image.url}
					alt={image.caption || headline}
					className='sd-product-image'
					loading='lazy'
				/>
			</Link>
			<div className='sd-product-details'>
				<h2 className='sd-product-title'>
					<Link href={detailUrl} className='sd-product-title-link'>
						{headline}
					</Link>
				</h2>
				<p className='sd-product-description-snippet'>{descriptionSnippet}</p>

				<div className='sd-product-price-section'>
					{discountPercentage && (
						<span className='sd-discount-percentage'>
							{discountPercentage}% OFF
						</span>
					)}
					<span
						className={`sd-current-price ${!currentPrice || currentPrice.trim() === ""
							? "sd-unavailable-price"
							: ""
							}`}
					>
						{currentPrice && currentPrice.trim() !== ""
							? currentPrice
							: "Currently Not Available"}
					</span>
				</div>

				{offers?.displayShippingInfo?.includes("Free Prime Delivery") && (
					<p className='sd-shipping-info'>
						<strong>Free Prime Delivery</strong> —
						<a
							href='https://amzn.to/4cTcIec'
							target='_blank'
							rel='noopener noreferrer'
						>
							Try Amazon Prime Free
						</a>
					</p>
				)}

				{specialOffer && (
					<p className='sd-special-offer-badge'>{specialOffer}</p>
				)}

				{aggregateRating && (
					<div className='sd-product-rating'>
						{aggregateRating.ratingValue && (
							<span className='sd-stars'>
								{renderStars(aggregateRating.ratingValue)}
							</span>
						)}
						{aggregateRating.ratingValue && (
							<span className='sd-rating-value'>
								({aggregateRating.ratingValue})
							</span>
						)}
						{aggregateRating.reviewCount && (
							<span className='sd-review-count'>
								({aggregateRating.reviewCount} Amazon reviews)
							</span>
						)}
					</div>
				)}

				<div className='sd-product-actions'>
					<Link href={detailUrl} className='sd-view-details-button'>
						View Details
					</Link>
				</div>
			</div>
		</div>
	);
};

interface ShoppingDealsPageProps {
	initialProducts?: Product[];
	error?: string;
}

export const getServerSideProps: GetServerSideProps = async () => {
	try {
		const response = await fetch(
			`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/shopping-deals`,
		);
		if (!response.ok) {
			console.error(`SSR Error fetching shopping deals: ${response.status}`);
			return {
				props: {
					initialProducts: [],
					error: "Failed to load deals from server.",
				},
			};
		}
		const initialProductsData = await response.json();
		const initialProducts: Product[] = Array.isArray(initialProductsData)
			? initialProductsData
			: initialProductsData
				? [initialProductsData]
				: [];
		return { props: { initialProducts } };
	} catch (error) {
		console.error("SSR Exception fetching shopping deals:", error);
		return {
			props: {
				initialProducts: [],
				error: "Server exception when loading deals.",
			},
		};
	}
};

const ShoppingDeals: React.FC<ShoppingDealsPageProps> = ({
	initialProducts,
	error: ssrError,
}) => {
	const [products, setProducts] = useState<Product[]>(initialProducts || []);
	const [loading, setLoading] = useState<boolean>(!initialProducts); // True if no initialProducts
	const [error, setError] = useState<string | null>(ssrError || null);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 12;

	const fetchClientSideDeals = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				`${process.env.NEXT_PUBLIC_REACT_APP_API_BASE}/shopping-deals`,
			);
			if (!response.ok)
				throw new Error(`HTTP error! Status: ${response.status}`);
			const data: Product[] = await response.json();
			const uniqueProducts = data.filter(
				(p, i, a) => a.findIndex((t) => t.id === p.id) === i,
			);
			setProducts(uniqueProducts);
		} catch (err) {
			setError(
				err instanceof Error
					? err.message
					: "Failed to load deals client-side.",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (initialProducts && initialProducts.length > 0) {
			setProducts(initialProducts);
			setLoading(false);
			setError(null);
		} else if (ssrError) {
			// ssrError is set, no client fetch needed unless triggered by user action
			setLoading(false);
			// products are already initialized to [] so UI will show "No deals" or error message
		} else if (products.length === 0) {
			// No initial products, no SSR error, and no products yet
			fetchClientSideDeals();
		}
	}, [initialProducts, products.length, ssrError, fetchClientSideDeals]);

	useEffect(() => {
		if (currentPage !== 1) {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	}, [currentPage]);

	const currentProducts = useMemo(() => {
		const startIndex = (currentPage - 1) * postsPerPage;
		const endIndex = startIndex + postsPerPage;
		return products.slice(startIndex, endIndex);
	}, [products, currentPage, postsPerPage]);

	const schemaData = useMemo(
		() => ({
			"@context": "https://schema.org",
			"@type": "ItemList",
			name: "Shopping Deals",
			description: "Current deals and savings on various products.",
			url: getJsonLdUrl("/shopping-deals"),
			itemListElement: products.map((p: Product, i: number) => ({
				"@type": "ListItem",
				position: i + 1,
				item: {
					"@type": "Product",
					name: cleanText(p.headline),
					image: p.image.url,
					description: Array.from(cleanText(p.description)).slice(0, 200).join(''),
					offers: {
						"@type": "Offer",
						priceCurrency: "USD",
						price: p.offers?.price || p.currentPrice.replace("$", ""),
						availability:
							p.offers?.availability || "https://schema.org/InStock",
						url: p.canonicalUrl || getJsonLdUrl(`/shopping-deals/products/${p.id}`),
					},
					aggregateRating: p.aggregateRating && {
						"@type": "AggregateRating",
						ratingValue: p.aggregateRating.ratingValue,
						reviewCount: p.aggregateRating.reviewCount,
					},
				},
			})),
		}),
		[products],
	);

	return (
		<div className='sd-page-container'>
			<Head>
				<title>Deals and Savings - Best Shopping Discounts</title>
				<meta
					name='description'
					content='Find the best deals and savings on top products.'
				/>
				<link
					rel='canonical'
					href={getCanonicalUrl("/shopping-deals")}
				/>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(schemaData)
							.replace(/<\/script>/g, "<\\/script>")
							.replace(/[\u2028\u2029]/g, ""),
					}}
				/>
			</Head>
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
