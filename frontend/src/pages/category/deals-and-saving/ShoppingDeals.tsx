import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import PaginationContainer from "../../../components/PaginationContainer";
import "./ShoppingDeals.css";

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

interface Product {
	id: string;
	headline: string;
	image: { url: string; caption: string };
	description: string;
	currentPrice: string;
	discountPercentage?: string;
	mainEntityOfPage: string;
	specialOffer?: string;
	aggregateRating?: {
		"@type": "AggregateRating";
		ratingValue: string;
		reviewCount: string;
	};
}

const ProductCard: React.FC<Product> = ({
	id,
	headline,
	image,
	description,
	currentPrice,
	discountPercentage,
	mainEntityOfPage,
	specialOffer,
	aggregateRating,
}) => {
	const productSlug = `${id}-${headline
		.toLowerCase()
		.replace(/[^\w\s-]/g, "")
		.replace(/\s+/g, "-")
		.replace(/-+/g, "-")}`;

	const parsedDescription = description
		.split("<p>")
		.filter((part) => part.includes("</p>"))
		.slice(0, 4)
		.map((part, index) => (
			<p key={index} className='modern-p'>
				{part.replace(/<\/?[^>]+(>|$)/g, "")}
			</p>
		));

	const renderStars = (rating: string) => {
		const starCount = parseFloat(rating);
		if (isNaN(starCount)) return null;

		const stars = Array.from({ length: 5 }, (_, i) => {
			if (starCount >= i + 1)
				return (
					<span key={i} className='star filled'>
						&#9733;
					</span>
				);
			if (starCount >= i + 0.5 && starCount < i + 1)
				return (
					<span key={i} className='star half'>
						&#9733;
					</span>
				);
			return (
				<span key={i} className='star'>
					&#9733;
				</span>
			);
		});

		return stars;
	};

	return (
		<div className='product-card' data-id={id}>
			<img
				src={image.url}
				alt={image.caption}
				className='product-image'
				loading='lazy'
			/>
			<div className='product-details'>
				<h2 className='product-title'>{headline}</h2>
				<div className='product-description'>{parsedDescription}</div>
				<div className='product-price'>
					{specialOffer && (
						<p className='special-offer'>{`Get ${specialOffer} Extra Discount. Click Here To Try Prime Free.`}</p>
					)}
					{discountPercentage && (
						<span className='discount-percentage'>{`Discount: ${discountPercentage}`}</span>
					)}
					<span className='current-price'>{`Now: ${currentPrice}`}</span>
				</div>
				{aggregateRating && (
					<div className='product-rating'>
						{aggregateRating.ratingValue && (
							<span className='rating-stars'>
								{renderStars(aggregateRating.ratingValue)}
								<span className='rating-value'>
									{" "}
									({aggregateRating.ratingValue})
								</span>
							</span>
						)}
						{aggregateRating.reviewCount && (
							<span className='review-count'>
								({aggregateRating.reviewCount} reviews)
							</span>
						)}
					</div>
				)}
				<div className='product-actions'>
					<Link
						to={`/shopping-deals/products/${productSlug}`}
						className='view-details-button'
						aria-label={`View details for ${headline}`}
					>
						More Details
					</Link>
				</div>
			</div>
		</div>
	);
};

const ShoppingDeals: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const adContainersRef = useRef<React.RefObject<HTMLDivElement>[]>([]);

	useEffect(() => {
		document.title = "Deals and Savings - Best Shopping Discounts";
		fetch("/data/products.json")
			.then((res) => res.json())
			.then((data: Product[]) =>
				setProducts(
					data.filter((p, i, a) => a.findIndex((t) => t.id === p.id) === i),
				),
			)
			.catch((err) => console.error("Error fetching products:", err));
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [currentPage]);

	useEffect(() => {
		const timer = setTimeout(() => {
			adContainersRef.current?.forEach((ref) => {
				if (
					ref.current &&
					ref.current.offsetWidth > 0 &&
					ref.current.offsetHeight > 0 &&
					window.innerWidth < 600
				) {
					(window.adsbygoogle = window.adsbygoogle || []).push({});
				}
			});
		}, 2000);
		return () => clearTimeout(timer);
	}, []);

	const currentProducts = products.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);
	const numColumns = window.innerWidth > 600 ? 3 : 1;

	if (adContainersRef.current.length === 0) {
		adContainersRef.current = Array.from(
			{ length: Math.ceil(currentProducts.length / numColumns) },
			() => React.createRef<HTMLDivElement>(),
		);
	}

	const productGrid = Array.from(
		{ length: Math.ceil(currentProducts.length / numColumns) },
		(_, i) => (
			<React.Fragment key={i}>
				<div className='products-grid'>
					{currentProducts
						.slice(i * numColumns, (i + 1) * numColumns)
						.map((product) => (
							<ProductCard key={product.id} {...product} />
						))}
				</div>
				<div className='postings-container' ref={adContainersRef.current[i]}>
					<ins
						className='adsbygoogle'
						data-ad-client='ca-pub-1079721341426198'
						data-ad-slot='6375155907'
						data-ad-format='auto'
						data-full-width-responsive='true'
					/>
				</div>
			</React.Fragment>
		),
	);

	return (
		<div className='shopping-page-container'>
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
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: products.map((p, i) => ({
							"@type": "Product",
							position: i + 1,
							name: p.headline,
							image: p.image.url,
							description: p.description,
							offers: {
								"@type": "Offer",
								price: p.currentPrice.replace("$", ""),
								priceCurrency: "USD",
								availability: "https://schema.org/InStock",
								url: p.mainEntityOfPage,
							},
						})),
					})}
				</script>
			</Helmet>
			<h1 className='page-title'>Deals and Savings</h1>
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
						width='730px'
						height='90px'
						loading='eager'
					/>
				</a>
			</div>
			{productGrid}
			<PaginationContainer
				totalItems={products.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
		</div>
	);
};

export default ShoppingDeals;
