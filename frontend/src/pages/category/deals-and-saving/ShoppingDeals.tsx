import React, { useEffect, useState, useRef } from "react";
import AdComponent from "../../../components/AdComponent";
import PaginationContainer from "../../../components/PaginationContainer";
import "../../../components/AdComponent.css";
import "./ShoppingDeals.css";

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
		<div className='CardContainer'>
			<img src={imageUrl} alt={title} className='CardImage' />
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
	const [products, setProducts] = useState<any[]>([]);
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 9;
	const pageRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		document.title = "Deals and Savings";
	}, []);

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch("/data/products.json");
				if (!response.ok) {
					throw new Error("Failed to fetch data");
				}
				const products = await response.json();
				setProducts(products);
			} catch (error) {
				console.error("Error fetching data:", error);
			}
		};

		fetchData();
	}, []);

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
				/>
				<button className='topbanner-button'>
					Click Here To Get Your Free Trial
				</button>{" "}
				{/* Updated button name and text */}
			</a>
			<h2 className='SectionHeading'>Deals and Savings</h2>
			{rows.map((row, rowIndex) => (
				<React.Fragment key={rowIndex}>
					<div className='ProductsGrid'>
						{row.map((productData, productIndex) => (
							<React.Fragment key={productData.id}>
								<ProductCard
									id={productData.id}
									title={productData.title}
									imageUrl={productData.imageUrl}
									description={productData.description}
									currentPrice={productData.currentPrice}
									discountPercentage={productData.discountPercentage}
									affiliateLink={productData.affiliateLink}
								/>
								{/* Ad for mobile devices after every 2 products */}
								{window.innerWidth <= 600 && productIndex % 2 === 1 && (
									<div className='mobile-ad-container'>
										<AdComponent width={320} height={320} />
									</div>
								)}
							</React.Fragment>
						))}
					</div>
					{/* Ad for desktop devices after every row */}
					{window.innerWidth > 600 && (
						<div className='ad-row-container'>
							<AdComponent width={660} height={440} />
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
		</div>
	);
};

export default ShoppingDeals;
