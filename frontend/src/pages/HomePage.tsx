import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import useCompressedImage from "../components/compressed/useCompressedImage";
import ExtraIncomeImg from "../assets/images/icons/img-extraincome.webp";
import StartAblogimg from "../assets/images/icons/img-startablog.webp";
import DealsAndSavingimg from "../assets/images/icons/img-dealsandsavings.webp";
import "./HomePage.css";

const HomePage: React.FC = () => {
	const compressedExtraIncomeImg = useCompressedImage(ExtraIncomeImg);
	const compressedStartAblogimg = useCompressedImage(StartAblogimg);
	const compressedDealsAndSavingimg = useCompressedImage(DealsAndSavingimg);

	const renderLinkBox = (
		to: string,
		ariaLabel: string,
		imgSrc: string,
		altText: string,
		captionText: string,
	) => (
		<Link className='link-box' to={to} aria-label={ariaLabel}>
			<img src={imgSrc} alt={altText} loading='lazy' />
			<figcaption className='figcaption'>{captionText}</figcaption>
		</Link>
	);

	return (
		<div className='links-container' aria-label='Main navigation links'>
			{renderLinkBox(
				"/category/extra-income/",
				"Extra Income",
				compressedExtraIncomeImg || ExtraIncomeImg,
				"Manage Finance Photo",
				"Extra Income",
			)}
			{renderLinkBox(
				"/deals-and-savings",
				"Deals And Savings",
				compressedDealsAndSavingimg || DealsAndSavingimg,
				"Passive Income Icon",
				"Deals & Savings",
			)}
			{renderLinkBox(
				"/amazon-products",
				"Deals",
				compressedStartAblogimg || StartAblogimg,
				"Deals And Saving Icon",
				"Start A Blog",
			)}
		</div>
	);
};

export default HomePage;
