import React, { useEffect, useState, useRef } from "react";
import "../../../components/AdComponent.css";
import "./ShoppingDeals.css";
import "../../../components/BlogPostContent.css"; // Import the BlogPostContent CSS
import PaginationContainer from "../../../components/PaginationContainer";
import "../../../components/AdComponent.css";

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
				</button>
			</a>
			<h1 className='SectionHeading'>Deals and Savings</h1>
			{rows.map((row, rowIndex) => (
				<React.Fragment key={rowIndex}>
					<div className='ProductsGrid'>
						{row.map((productData) => (
							<ProductCard
								key={productData.id}
								id={productData.id}
								title={productData.title}
								imageUrl={productData.imageUrl}
								description={productData.description}
								currentPrice={productData.currentPrice}
								discountPercentage={productData.discountPercentage}
								affiliateLink={productData.affiliateLink}
							/>
						))}
					</div>
					{/* Insert small ad (300x250) after each row except the last one */}
					{rowIndex < rows.length - 1 && (
						<div className='ad-container'>
							<div className='ad-row-container'>
								<a
									href='https://www.kqzyfj.com/click-101252893-15236454'
									target='_blank'
								>
									<img
										src='https://www.ftjcfx.com/image-101252893-15236454'
										alt=''
										className='ad-image'
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

			{/* Large Ad (728x90) at the very bottom */}
			<div className='ad-container'>
				<div className='ad-bottom-container'>
					<a
						href='https://www.tkqlhce.com/click-101252893-14103279'
						target='_blank'
					>
						<img
							className='ad-image'
							src='https://www.ftjcfx.com/image-101252893-14103279'
							alt='Speak a new language fluently fast. Start now!'
						/>
					</a>
				</div>
			</div>
		</div>
	);
};

export default ShoppingDeals;
