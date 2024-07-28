import React from "react";
import { Link } from "react-router-dom";
import useCompressedImage from "../components/compressed/useCompressedImage";
import ExtraIncomeImg from "../assets/images/icons/img-extraincome.webp";
import StartAblogimg from "../assets/images/icons/img-startablog.webp";
import AmazonPicksImg from "../assets/images/icons/img-dealsandsavings.webp";
import NextToPImage from "../assets/images/favcons/down-arrow.webp"; // Add the image for next to the P tag
import "./HomePage.css";

const HomePage: React.FC = () => {
	const compressedExtraIncomeImg = useCompressedImage(ExtraIncomeImg);
	const compressedStartAblogimg = useCompressedImage(StartAblogimg);
	const compressedAmazonPicksImg = useCompressedImage(AmazonPicksImg);

	const linkBoxes = [
		{
			to: "/extra-income/",
			ariaLabel: "Extra Income",
			imgSrc: compressedExtraIncomeImg || ExtraIncomeImg,
			altText: "Manage Finance Photo",
			captionText: "Extra Income",
		},
		{
			to: "/deals-and-savings",
			ariaLabel: "Deals And Savings",
			imgSrc: compressedAmazonPicksImg || AmazonPicksImg,
			altText: "Passive Income Icon",
			captionText: "Deals & Savings",
		},
		{
			to: "/amazon-products",
			ariaLabel: "Start A Blog",
			imgSrc: compressedStartAblogimg || StartAblogimg,
			altText: "Deals And Saving Icon",
			captionText: "Start A Blog",
		},
	];

	return (
		<div className='home-container'>
			<h1>Your Life Changes Here</h1>
			<p className='landing-subtitle'>
				Start Now{" "}
				<img src={NextToPImage} alt='Next to P' className='next-to-p-image' />
			</p>
			<div className='home-main-links' aria-label='Main navigation links'>
				{linkBoxes.map((linkBox, index) => (
					<Link
						className='home-links'
						key={index}
						to={linkBox.to}
						aria-label={linkBox.ariaLabel}
					>
						<img src={linkBox.imgSrc} alt={linkBox.altText} loading='lazy' />
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
