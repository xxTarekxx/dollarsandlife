import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import useCompressedImage from "../components/compressed/useCompressedImage";
import ExtraIncomeImg from "../assets/images/icons/img-extraincome.webp";
import StartAblogimg from "../assets/images/icons/img-startablog.webp";
import DealsAndSavingimg from "../assets/images/icons/img-dealsandsavings.webp";

const LinksContainer = styled.div`
	width: 100%;
	margin: 12% auto;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
	max-width: 1280px;
`;

const spinAnimation = keyframes`
  100% { transform: rotate(360deg); }
`;

const LinkBox = styled(Link)`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: white;
	letter-spacing: 0.5px;
	border-radius: 20px;
	margin: 1%;
	color: black;
	font-size: 18px;

	box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
		rgba(0, 0, 0, 0.3) 0px 30px 60px -30px,
		rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;

	text-align: center;
	text-decoration: none;

	&:hover img {
		animation: ${spinAnimation} 0.2s linear 1;
	}

	&:hover figcaption {
		color: #7600ff;
	}

	&:focus {
		outline: 3px solid #7600ff; /* Focus state for keyboard navigation */
	}

	@media (max-width: 768px) {
		width: 70%;
	}

	img {
		padding: 5px;
		width: 220px;
		height: 200px;
	}
`;

const Figcaption = styled.figcaption`
	color: black;
	transition: color 0.3s ease-in-out;
	padding: 20px;
`;

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
		<LinkBox to={to} aria-label={ariaLabel}>
			<img src={imgSrc} alt={altText} loading='lazy' />
			<Figcaption>{captionText}</Figcaption>
		</LinkBox>
	);

	return (
		<LinksContainer aria-label='Main navigation links'>
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
		</LinksContainer>
	);
};

export default HomePage;
