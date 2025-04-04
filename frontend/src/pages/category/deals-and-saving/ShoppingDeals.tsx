import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom"; // Import Link
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
	image: {
		url: string;
		caption: string;
	};
	description: string;
	currentPrice: string;
	discountPercentage?: string;
	mainEntityOfPage: string;
	specialOffer?: string;
}

interface ProductCardProps extends Product {}

const ProductCard: React.FC<ProductCardProps> = ({
	id,
	headline,
	image,
	description,
	currentPrice,
	discountPercentage,
	mainEntityOfPage,
	specialOffer,
}) => {
	const generateProductSlug = () => {
		return `${id}-${headline
			.toLowerCase()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-")}`;
	};

	const parseDescription = (html: string) => {
		const tempDiv = document.createElement("div");
		tempDiv.innerHTML = html;

		const pTags = Array.from(tempDiv.querySelectorAll("p")).map((p, index) => (
			<p key={index} className='modern-p'>
				{p.textContent}
			</p>
		));

		return pTags;
	};

	return (
		<div className='product-card' data-id={id}>
			<img
				src={image.url}
				alt={image.caption}
				className='product-image'
				srcSet={`${image.url} 1x, ${image.url.replace(".webp", "@2x.webp")} 2x`}
				loading='lazy'
			/>
			<div className='product-details'>
				<h2 className='product-title'>{headline}</h2>
				<div className='product-description'>
					{parseDescription(description)}
				</div>
				<div className='product-price'>
					{specialOffer && specialOffer.trim() !== "" && (
						<p className='special-offer'>
							Get {specialOffer} Extra Discount When You Sign Up With Prime
							<a href='https://amzn.to/427UDnt'> Click Here To Try It Free </a>
							for 30 days
						</p>
					)}
					{discountPercentage && discountPercentage.trim() !== "" && (
						<span className='discount-percentage'>
							Discount: {discountPercentage}
						</span>
					)}
					<span className='current-price'> Now: {currentPrice} </span>
				</div>
				<div className='product-actions'>
					<Link
						to={`/shopping-deals/products/${generateProductSlug()}`}
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
	const pageRef = useRef<HTMLDivElement>(null);
	const adContainersRef = useRef<React.RefObject<HTMLDivElement>[]>([]);

	useEffect(() => {
		document.title = "Deals and Savings - Best Shopping Discounts";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/products.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const products: Product[] = await response.json();

				const uniqueProducts = products.filter(
					(product, index, self) =>
						index === self.findIndex((p) => p.id === product.id),
				);

				setProducts(uniqueProducts);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

	useEffect(() => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	}, [currentPage]);

	useEffect(() => {
		const timer = setTimeout(() => {
			if (adContainersRef.current) {
				adContainersRef.current.forEach((adContainer) => {
					if (
						adContainer.current &&
						adContainer.current.offsetWidth > 0 &&
						adContainer.current.offsetHeight > 0 &&
						window.innerWidth < 600
					) {
						(window.adsbygoogle = window.adsbygoogle || []).push({});
					}
				});
			}
		}, 2000);

		return () => clearTimeout(timer);
	}, []);

	const currentPosts = products.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const items: JSX.Element[] = [];
	const numColumns = window.innerWidth > 600 ? 3 : 1;

	if (adContainersRef.current.length === 0) {
		for (let i = 0; i < Math.ceil(currentPosts.length / numColumns); i++) {
			adContainersRef.current.push(React.createRef<HTMLDivElement>());
		}
	}

	for (let i = 0; i < currentPosts.length; i += numColumns) {
		const rowItems: JSX.Element[] = currentPosts
			.slice(i, i + numColumns)
			.map((product) => <ProductCard key={product.id} {...product} />);

		const refIndex = Math.floor(i / numColumns);
		items.push(
			<React.Fragment key={i}>
				<div className='products-grid'>{rowItems}</div>
				<div
					className='postings-container'
					ref={adContainersRef.current[refIndex]}
				>
					<ins
						className='adsbygoogle'
						data-ad-client='ca-pub-1079721341426198'
						data-ad-slot='6375155907'
						data-ad-format='auto'
						data-full-width-responsive='true'
					/>
				</div>
			</React.Fragment>,
		);
	}

	return (
		<div className='shopping-page-container' ref={pageRef}>
			<Helmet>
				<title>Deals and Savings - Best Shopping Discounts</title>
				<meta
					name='description'
					content='Find the best deals and savings on top products. Shop discounts on tech, gadgets, and home essentials. Limited-time offers updated daily!'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/shopping-deals'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "ItemList",
						itemListElement: products.map((product, index) => ({
							"@type": "Product",
							position: index + 1,
							name: product.headline,
							image: product.image.url,
							description: product.description,
							offers: {
								"@type": "Offer",
								price: product.currentPrice.replace("$", ""),
								priceCurrency: "USD",
								availability: "https://schema.org/InStock",
								url: product.mainEntityOfPage,
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
					className='top-banner'
				>
					<img
						src='/images/shoppinganddeals/Lyca-Mobile-728x90.webp'
						alt='Lyca Mobile Banner'
						className='top-banner-image'
						loading='eager'
					/>
				</a>
			</div>

			{items}

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
