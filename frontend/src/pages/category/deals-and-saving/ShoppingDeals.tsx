import React, { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
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
}) => {
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
				<p className='product-description'>
					<span className='description-text'>{description}</span>
				</p>
				{discountPercentage ? (
					<p className='product-price'>
						<span className='discount-percentage'>
							Discount: {discountPercentage}
						</span>
						<span className='current-price'> Now: {currentPrice} </span>
					</p>
				) : (
					<p className='product-price'>
						<span className='current-price'> Now: {currentPrice}</span>
					</p>
				)}
				<a
					href={mainEntityOfPage}
					target='_blank'
					rel='noopener noreferrer'
					className='buy-now-button'
					aria-label={`Buy ${headline} now`}
				>
					Take Me There
				</a>
			</div>
		</div>
	);
};

const ShoppingDeals: React.FC = () => {
	const [products, setProducts] = useState<Product[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Deals and Savings - Best Shopping Discounts";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/products.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const products: Product[] = await response.json();
				setProducts(products);
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
		setTimeout(() => {
			const adContainers = document.querySelectorAll(".postings-container");
			let adsPushed = false;
			adContainers.forEach((adContainer) => {
				if (
					(adContainer as HTMLElement).offsetWidth > 0 &&
					(adContainer as HTMLElement).offsetHeight > 0
				) {
					if (!adsPushed) {
						console.log("Pushing AdSense ads...");
						(window.adsbygoogle = window.adsbygoogle || []).push({});
						adsPushed = true;
					}
				}
			});
		}, 2000);
	}, []);

	const currentPosts = products.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const items: JSX.Element[] = [];
	const numColumns = window.innerWidth > 600 ? 3 : 1;

	for (let i = 0; i < currentPosts.length; i += numColumns) {
		const rowItems = currentPosts
			.slice(i, i + numColumns)
			.map((product) => <ProductCard key={product.id} {...product} />);

		items.push(
			<React.Fragment key={i}>
				<div className='products-grid'>{rowItems}</div>
				<div className='postings-container'>
					<ins
						className='adsbygoogle'
						style={{ display: "block", width: "300px", height: "250px" }}
						data-ad-client='ca-pub-1079721341426198'
						data-ad-slot='7197282987'
						data-ad-format='rectangle'
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

			<div className='postings-container'>
				<ins
					className='adsbygoogle'
					style={{ display: "block", width: "728px", height: "90px" }}
					data-ad-client='ca-pub-1079721341426198'
					data-ad-slot='6375155907'
					data-ad-format='horizontal'
					data-full-width-responsive='true'
				/>
			</div>
		</div>
	);
};

export default ShoppingDeals;
