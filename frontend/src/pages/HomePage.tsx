import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./HomePage.css";

// Import images directly, if using Webpack's file-loader or similar
import ShoppingDealsImg from "../../public/images/icons/img-dealsandsavings.webp";
import ExtraIncomeImg from "../../public/images/icons/img-extraincome.webp";
import StartAblogimg from "../../public/images/icons/img-startablog.webp";

// Define the LinkBox interface for type safety
interface LinkBoxData {
	to: string;
	ariaLabel: string;
	imgSrc: string;
	altText: string;
	captionText: string;
	width: number;
	height: number;
	priority: boolean;
	keywords: string;
}

const HomePage: React.FC = () => {
	const linkBoxes: LinkBoxData[] = [
		{
			to: "/extra-income",
			ariaLabel: "Extra Income",
			imgSrc: ExtraIncomeImg,
			altText: "Extra Income Menu link",
			captionText: "Boost Your Income",
			width: 220,
			height: 220,
			priority: false,
			keywords: "side hustle, remote jobs, passive income",
		},
		{
			to: "/shopping-deals",
			ariaLabel: "Shopping Deals",
			imgSrc: ShoppingDealsImg,
			altText: "Shopping Deals Menu link",
			captionText: "Smart Shopping",
			width: 220,
			height: 220,
			priority: false,
			keywords: "discount deals, save money shopping, best deals",
		},
		{
			to: "/start-a-blog",
			ariaLabel: "Start A Blog",
			imgSrc: StartAblogimg,
			altText: "Start A Blog Guide link",
			captionText: "Start Your Blog",
			width: 220,
			height: 220,
			priority: true,
			keywords: "start a blog, blogging tips, make money blogging",
		},
	];

	return (
		<div className='main-container'>
			<Helmet>
				<title>Dollars And Life: Personal Finance & Blogging Tips</title>
				<meta
					name='description'
					content='Learn personal finance, discover extra income opportunities, find shopping deals, and start your own blog. Expert advice for a better financial life.'
				/>
				<meta
					property='og:title'
					content='Dollars And Life: Personal Finance & Blogging'
				/>
				<meta
					property='og:description'
					content='Expert tips on personal finance, earning extra income, finding shopping deals, and starting a blog. Your guide to financial success.'
				/>
				<meta
					property='og:image'
					content='https://www.dollarsandlife.com/path-to-home-image.jpg'
				/>
				<meta property='og:url' content='https://www.dollarsandlife.com/' />
				<meta property='og:type' content='website' />
				<link rel='canonical' href='https://www.dollarsandlife.com' />

				{linkBoxes
					.filter((link) => link.priority)
					.map((link, i) => (
						<link
							key={i}
							rel='preload'
							as='image'
							href={link.imgSrc}
							type='image/webp'
						/>
					))}

				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Dollars And Life: Personal Finance & Blogging",
						description:
							"Expert tips on personal finance, earning extra income, finding shopping deals, and starting a blog. Your guide to financial success.",
						url: "https://www.dollarsandlife.com/",
						publisher: {
							"@type": "Organization",
							name: "Dollars And Life",
							logo: {
								"@type": "ImageObject",
								url: "https://www.dollarsandlife.com/favicon.webp",
							},
						},
					})}
				</script>
			</Helmet>

			<section className='intro-section'>
				<h1>Unlock Your Financial Potential</h1>
				<p className='intro-text'>
					Welcome to Dollars And Life, your trusted resource for navigating the
					world of personal finance and online entrepreneurship. We provide
					expert advice on earning extra income, finding smart shopping deals,
					and guiding you through the process of starting your own blog.
				</p>
			</section>

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
						loading='eager'
					/>
				</a>
			</div>

			<div className='home-main-links' aria-label='Main navigation links'>
				{linkBoxes.map((linkBox, index) => (
					<Link
						className='home-links'
						key={index}
						to={linkBox.to}
						aria-label={linkBox.ariaLabel}
					>
						<img
							src={linkBox.imgSrc}
							alt={linkBox.altText}
							width={linkBox.width}
							height={linkBox.height}
							loading={linkBox.priority ? "eager" : "lazy"}
							{...(linkBox.priority ? { fetchpriority: "high" } : {})}
						/>
						<figcaption className='home-figcaption'>
							{linkBox.captionText}
						</figcaption>
						<div className='keywords-display'>{linkBox.keywords}</div>
					</Link>
				))}
			</div>
		</div>
	);
};

export default HomePage;
