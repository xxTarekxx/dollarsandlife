import React, { useEffect, useRef, useState } from "react";
import "../../../components/AdComponent.css";
import "../../../components/BlogPostContent.css";
import PaginationContainer from "../../../components/PaginationContainer";
import "./ShoppingDeals.css";

// Define a type for the product data
interface Product {
	id: string;
	title: string;
	imageUrl: string;
	description: string;
	currentPrice: string;
	discountPercentage?: string;
	affiliateLink: string;
}

interface ProductCardProps {
	id: string;
	title: string;
	imageUrl: string;
	description: string;
	currentPrice: string;
	discountPercentage?: string;
	affiliateLink: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
	id,
	title,
	imageUrl,
	description,
	currentPrice,
	discountPercentage,
	affiliateLink,
}) => {
	return (
		<div className='CardContainer' data-id={id}>
			<img
				src={imageUrl}
				alt={title}
				className='CardImage'
				srcSet={`${imageUrl} 1x, ${imageUrl.replace(".webp", "@2x.webp")} 2x`}
				loading='lazy'
			/>
			<div className='CardContent'>
				<h3 className='CardTitle'>{title}</h3>
				<p className='CardDescription'>
					<span className='CardDescriptionText'>{description}</span>
				</p>
				{discountPercentage && (
					<p className='CardPrice'>
						<span className='DiscountPercentage'>
							Discount: {discountPercentage}
						</span>
					</p>
				)}
				<p className='CardPrice'>Now: {currentPrice}</p>
				<a
					href={affiliateLink}
					target='_blank'
					rel='noopener noreferrer'
					className='BuyNowButton'
				>
					Buy Now
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

	// Set the document title
	useEffect(() => {
		document.title = "Deals and Savings";
	}, []);

	// Fetch product data from the JSON file
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

	// Scroll to the top of the page on page change
	useEffect(() => {
		if (pageRef.current) {
			pageRef.current.scrollIntoView({ behavior: "smooth" });
		}
	}, [currentPage]);

	const currentPosts = products.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage,
	);

	const rows = [];
	for (let i = 0; i < currentPosts.length; i += 3) {
		rows.push(currentPosts.slice(i, i + 3));
	}

	return (
		<div className='PageContainer' ref={pageRef}>
			<a
				href='https://www.amazon.com/amazonprime?primeCampaignId=studentWlpPrimeRedir&linkCode=ll2&tag=dollarsandl0c-20&linkId=879184c8c8106f03c9fbbea8df411e86&language=en_US&ref_=as_li_ss_tl'
				target='_blank'
				rel='noopener noreferrer'
				className='TopBanner'
			>
				<img
					src='/images/shoppinganddeals/amazon-banner.webp'
					alt='Amazon Prime Banner'
					className='TopBannerImage'
					loading='eager' // Preload the banner image
					srcSet='/images/shoppinganddeals/amazon-banner.webp 1x, /images/shoppinganddeals/amazon-banner@2x.webp 2x'
				/>
				<button className='topbanner-button'>Free Trial</button>
			</a>
			<h1 className='SectionHeading'>Deals and Savings</h1>
			{rows.map((row, rowIndex) => (
				<React.Fragment key={rowIndex}>
					<div className='ProductsGrid'>
						{row.map((product) => (
							<ProductCard
								key={product.id}
								id={product.id}
								title={product.title}
								imageUrl={product.imageUrl}
								description={product.description}
								currentPrice={product.currentPrice}
								discountPercentage={product.discountPercentage}
								affiliateLink={product.affiliateLink}
							/>
						))}
					</div>
					{rowIndex < rows.length - 1 && (
						<div className='postings-container'>
							<div className='postings-row-container'>
								<a
									href='https://www.kqzyfj.com/click-101252893-15236454'
									target='_blank'
									rel='noopener noreferrer'
								>
									<img
										srcSet='https://www.ftjcfx.com/image-101252893-15236454 1x, https://www.ftjcfx.com/image-101252893-15236454@2x.jpg 2x'
										alt='Ad'
										className='postings-image'
										loading='lazy'
									/>
								</a>
							</div>
						</div>
					)}
				</React.Fragment>
			))}
			<PaginationContainer
				totalItems={products.length}
				itemsPerPage={postsPerPage}
				currentPage={currentPage}
				setCurrentPage={setCurrentPage}
			/>
			<div className='postings-container'>
				<div className='postings-bottom-container'>
					<a
						href='https://www.tkqlhce.com/click-101252893-14103279'
						target='_blank'
						rel='noopener noreferrer'
					>
						<img
							className='postings-image'
							srcSet='https://www.ftjcfx.com/image-101252893-14103279 1x, https://www.ftjcfx.com/image-101252893-14103279@2x.jpg 2x'
							alt='Speak a new language fluently fast. Start now!'
							width='728'
							height='90'
							loading='lazy'
						/>
					</a>
				</div>
			</div>
		</div>
	);
};

export default ShoppingDeals;
