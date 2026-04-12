"use client"; // Still needed for useState, useEffect, useMemo for pagination and client-side interactions
import "./ShoppingDeals.css";
import { GetServerSideProps } from "next"; // Added
import Head from "next/head";
import Link from "next/link";
import React, { useCallback, useEffect, useMemo, useState } from "react"; // Added useCallback
import PaginationContainer from "src/components/pagination/PaginationContainer";
import { getClientApiBase } from "@/lib/api-base";
import { useLangFromPath, usePageCanonical } from "@/hooks/usePageCanonical";
import { prefixLang, pathWithoutLang } from "@/lib/i18n/prefixLang";
import { buildCanonicalUrl } from "@/lib/seo/canonical";

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

/** Prefer currentPrice; if list API omitted it, use offers.price (Mongo often has both). */
function getDisplayPriceLabel(
	currentPrice: string | undefined,
	offers: Product["offers"],
): string {
	const cp = typeof currentPrice === "string" ? currentPrice.trim() : "";
	if (cp) return cp;
	const raw = typeof offers?.price === "string" ? offers.price.trim() : "";
	if (!raw) return "";
	if (/^[$\u00a3\u20ac]/.test(raw)) return raw;
	return `$${raw}`;
}

const ProductCard: React.FC<Product & { lang: string }> = ({
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
	lang,
}) => {
	let basePath: string;
	if (canonicalUrl) {
		if (canonicalUrl.startsWith("http")) {
			try {
				basePath = pathWithoutLang(new URL(canonicalUrl).pathname);
			} catch {
				const nameForSlug = shortName || headline;
				const slug = nameForSlug
					.toLowerCase()
					.replace(/[^a-z0-9\s-]/g, "")
					.replace(/\s+/g, "-");
				basePath = `/shopping-deals/products/${id}-${slug}`;
			}
		} else {
			const p = canonicalUrl.startsWith("/") ? canonicalUrl : `/${canonicalUrl}`;
			basePath = pathWithoutLang(p);
		}
	} else {
		const nameForSlug = shortName || headline;
		const slug = nameForSlug
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, "")
			.replace(/\s+/g, "-");
		basePath = `/shopping-deals/products/${id}-${slug}`;
	}
	const detailUrl = prefixLang(basePath, lang);

	const displayPriceLabel = useMemo(
		() => getDisplayPriceLabel(currentPrice, offers),
		[currentPrice, offers],
	);

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
			{/* Image area with optional discount badge overlay */}
			<div className='sd-product-image-wrap'>
				<Link href={detailUrl} prefetch={false} aria-label={`View details for ${headline}`}>
					<img
						src={image.url}
						alt={image.caption || headline}
						className='sd-product-image'
						loading='lazy'
					/>
				</Link>
				{discountPercentage && (
					<span className='sd-discount-badge'>{discountPercentage}% OFF</span>
				)}
			</div>
			<div className='sd-product-details'>
				<h3 className='sd-product-title'>
					<Link href={detailUrl} prefetch={false} className='sd-product-title-link'>
						{headline}
					</Link>
				</h3>
				<p className='sd-product-description-snippet'>{descriptionSnippet}</p>

				<div className='sd-product-price-section'>
					<span
						className={`sd-current-price ${!displayPriceLabel
							? "sd-unavailable-price"
							: ""
							}`}
					>
						{displayPriceLabel || "Currently Not Available"}
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
					<Link href={detailUrl} prefetch={false} className='sd-view-details-button'>
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
	const canonical = usePageCanonical();
	const lang = useLangFromPath();
	const [products, setProducts] = useState<Product[]>(initialProducts || []);
	const [loading, setLoading] = useState<boolean>(!initialProducts); // True if no initialProducts
	const [error, setError] = useState<string | null>(ssrError || null);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 12;
	const currentYear = new Date().getFullYear();

	const fetchClientSideDeals = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const response = await fetch(
				`${getClientApiBase()}/shopping-deals`,
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

	const listSchemaJson = useMemo(() => {
		if (products.length === 0) return "";
		const itemListElement = products.slice(0, 20).map((p, i) => ({
			"@type": "ListItem",
			position: i + 1,
			item: {
				"@type": "Product",
				name: cleanText(p.headline || "").slice(0, 200),
				image: p.image?.url ?? "",
				offers: {
					"@type": "Offer",
					priceCurrency: "USD",
					price: p.offers?.price || (p.currentPrice || "").replace("$", ""),
					availability: p.offers?.availability || "https://schema.org/InStock",
					url: buildCanonicalUrl(
						prefixLang(`/shopping-deals/products/${p.id}`, lang),
					),
				},
			},
		}));
		const payload = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			name: "Shopping Deals",
			url: canonical,
			itemListElement,
		};
		return JSON.stringify(payload).replace(/<\/script/gi, "<\\/script");
	}, [products, canonical, lang]);

	return (
		<div className='sd-page-container'>
			<Head>
				<title>Deals and Savings | Best Online Shopping Discounts {currentYear}</title>
				<meta
					name='description'
					content='Find the best deals and savings on top-rated products. Discover curated discounts, coupons, and money-saving picks to stretch your budget further.'
				/>
				<link rel='canonical' href={canonical} />
				{listSchemaJson ? (
					<script
						type='application/ld+json'
						dangerouslySetInnerHTML={{ __html: listSchemaJson }}
					/>
				) : null}
						<meta property='og:title' content={`Deals and Savings | Best Online Shopping Discounts ${currentYear}`} />
			<meta
				property='og:description'
				content='Find the best deals and savings on top-rated products. Discover curated discounts, coupons, and money-saving picks to stretch your budget further.'
			/>
			<meta property='og:url' content={canonical} />
			<meta property='og:type' content='website' />
			<meta property='og:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:title' content={`Deals and Savings | Best Online Shopping Discounts ${currentYear}`} />
			<meta
				name='twitter:description'
				content='Find the best deals and savings on top-rated products. Discover curated discounts, coupons, and money-saving picks to stretch your budget further.'
			/>
			<meta name='twitter:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
			</Head>
			<div className='section-hero'>
		<p className='section-hero-eyebrow'>Shopping</p>
		<h1 className='section-hero-title'>
			Deals &amp; <span>Savings</span>
		</h1>
		<p className='section-hero-sub'>
			Curated deals and discounts on top-rated products — hand-picked to help you save more every day.
		</p>
		{products.length > 0 && (
			<span className='section-hero-count'>{products.length} deals</span>
		)}
	</div>
			{loading && <div className='sd-loading-indicator'>Loading Deals...</div>}
			{error && <div className='sd-error-indicator'>Error: {error}</div>}
			{!loading && !error && currentProducts.length > 0 && (
				<div className='sd-products-grid'>
					{currentProducts.map((product: Product) => (
						<ProductCard key={product.id} {...product} lang={lang} />
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
