import React from "react";
import { Helmet } from "react-helmet-async"; // Import Helmet for dynamic metadata
import { Link } from "react-router-dom";
import useCompressedImage from "../components/compressed/useCompressedImage";
import "./HomePage.css";
import NextToPImage from "/images/favicon/down-arrow.svg";
import AmazonPicksImg from "/images/icons/img-dealsandsavings.webp";
import ExtraIncomeImg from "/images/icons/img-extraincome.webp";
import StartAblogimg from "/images/icons/img-startablog.webp";

const HomePage: React.FC = () => {
	const compressedExtraIncomeImg = useCompressedImage(ExtraIncomeImg);
	const compressedStartAblogimg = useCompressedImage(StartAblogimg);
	const compressedAmazonPicksImg = useCompressedImage(AmazonPicksImg);

	const linkBoxes = [
		{
			to: "/extra-income/",
			ariaLabel: "Extra Income",
			imgSrc: compressedExtraIncomeImg || ExtraIncomeImg,
			altText: "Extra Income Menu link",
			captionText: "Extra Income",
			width: 220,
			height: 220,
			priority: false, // Non-critical image
		},
		{
			to: "/Shopping-deals",
			ariaLabel: "Shopping Deals",
			imgSrc: compressedAmazonPicksImg || AmazonPicksImg,
			altText: "Shopping List Menu link",
			captionText: "Shopping Deals",
			width: 220,
			height: 220,
			priority: false, // Non-critical image
		},
		{
			to: "/Start-A-Blog",
			ariaLabel: "Start A Blog",
			imgSrc: compressedStartAblogimg || StartAblogimg,
			altText: "Start A Blog Guide link",
			captionText: "Start A Blog",
			width: 220,
			height: 220,
			priority: true, // This is the critical LCP image
		},
	];

	return (
		<div className='home-container'>
			{/* Helmet for SEO: Title, Meta Description, and Open Graph Tags */}
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
				{/* Preload the critical LCP image */}
				<link
					rel='preload'
					as='image'
					href={compressedStartAblogimg || StartAblogimg}
					imageSrcSet={`${compressedStartAblogimg || StartAblogimg} 1x`}
				/>
			</Helmet>

			{/* Main H1 tag for SEO */}
			<h1>Your Life Changes Here</h1>

			<h2 className='landing-subtitle'>
				<img src={NextToPImage} alt='Next to P' className='next-to-p-image' />
				Start Now
				<img src={NextToPImage} alt='Next to P' className='next-to-p-image' />
			</h2>

			{/* Main Navigation Links */}
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
							loading={linkBox.priority ? "eager" : "lazy"} // Eager loading for LCP image
							width={linkBox.width}
							height={linkBox.height}
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
