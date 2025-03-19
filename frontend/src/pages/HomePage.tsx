import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./HomePage.css";

import NextToPImage from "/images/favicon/down-arrow.svg";
import ShoppingDealsImg from "/images/icons/img-dealsandsavings.webp";
import ExtraIncomeImg from "/images/icons/img-extraincome.webp";
import StartAblogimg from "/images/icons/img-startablog.webp";

const HomePage: React.FC = () => {
	const linkBoxes = [
		{
			to: "/extra-income",
			ariaLabel: "Extra Income",
			imgSrc: ExtraIncomeImg,
			altText: "Extra Income Menu link",
			captionText: "Extra Income",
			width: 220,
			height: 220,
			priority: false,
		},
		{
			to: "/shopping-deals",
			ariaLabel: "Shopping Deals",
			imgSrc: ShoppingDealsImg,
			altText: "Shopping Deals Menu link",
			captionText: "Shopping Deals",
			width: 220,
			height: 220,
			priority: false,
		},
		{
			to: "/start-a-blog",
			ariaLabel: "Start A Blog",
			imgSrc: StartAblogimg,
			altText: "Start A Blog Guide link",
			captionText: "Start A Blog",
			width: 220,
			height: 220,
			priority: true, // LCP image
		},
	];

	return (
		<div className='home-container'>
			{/* SEO Metadata */}
			<Helmet>
				<title>Home - Dollars And Life: Personal Finance Tips</title>
				<meta
					name='description'
					content='Discover personal finance tips, how to earn extra income, shopping deals, and how to start a blog at Dollars And Life.'
				/>
				<meta property='og:title' content='Home - Dollars And Life' />
				<meta
					property='og:description'
					content='Discover personal finance tips, how to earn extra income, shopping deals, and how to start a blog at Dollars And Life.'
				/>
				<meta
					property='og:image'
					content='https://www.dollarsandlife.com/path-to-home-image.jpg'
				/>
				<meta property='og:url' content='https://www.dollarsandlife.com/' />
				<meta property='og:type' content='website' />
				<link rel='canonical' href='https://www.dollarsandlife.com' />

				{/* Preload key navigation images */}
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

				{/* Structured Data */}
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Home - Dollars And Life",
						description:
							"Discover personal finance tips, how to earn extra income, shopping deals, and how to start a blog at Dollars And Life.",
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

			<h1>Your Life Changes Here</h1>

			{/* Top Banner Ad */}
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

			{/* Decorative arrows */}
			<h2 className='pointers'>
				<img
					src={NextToPImage}
					alt='Decorative arrow'
					className='pointers-img'
				/>
				<img
					src={NextToPImage}
					alt='Decorative arrow'
					className='pointers-img'
				/>
				<img
					src={NextToPImage}
					alt='Decorative arrow'
					className='pointers-img'
				/>
			</h2>

			{/* Main Links */}
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
							{...(linkBox.priority ? { fetchpriority: "high" } : {})} // ✅ correct way
						/>
						<figcaption className='home-figcaption'>
							{linkBox.captionText}
						</figcaption>
					</Link>
				))}
			</div>
		</div>
	);
};

export default HomePage;
