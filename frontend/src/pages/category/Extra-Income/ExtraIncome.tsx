import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import useCompressedImage from "../../../components/compressed/useCompressedImage";
import Breadcrumb from "../../../components/Breadcrumb";
import ExtraIncomeImage from "../../../assets/images/icons/extra-income-icon.webp";
import PassiveIcon from "../../../assets/images/icons/passive-income.png";
import DealsIcon from "../../../assets/images/icons/deal-and-savings-icon.webp";
import { PageContainer } from "../../../components/CommonStyles";
import {
	TopAdContainer,
	AdRowContainer,
	ContentWrapper,
} from "../../../components/CommonStyles";
import AdComponent from "../../../components/AdComponent";

// const PageContainer = styled.div`
// 	display: flex;
// 	flex-direction: column;
// 	align-items: center;
// 	overflow: hidden;
// `;

const LinksContainer = styled.div`
	max-width: 1280px;
	width: 100%;
	margin: 2% auto;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
`;

const BreadcrumbContainer = styled.div`
	width: 100%;
	padding-top: 20px;
	padding-left: 20px;
`;

const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  10% { transform: translateX(-10px); }
  20% { transform: translateX(10px); }
  30% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  50% { transform: translateX(0); }
`;

const LinkBox = styled(Link)`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	background: white;
	font-size: 1.4rem;
	border-radius: 20px;
	box-sizing: border-box;
	margin: 0.5% 2%;
	color: black;
	box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
		rgba(0, 0, 0, 0.3) 0px 30px 60px -30px,
		rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;
	text-align: center;
	text-decoration: none;

	&:hover img {
		animation: ${shakeAnimation} 0.5s;
		animation-iteration-count: 1;
	}

	&:hover figcaption {
		color: #7600ff;
	}

	&:focus {
		outline: 3px solid #7600ff;
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
	padding: 10px;
`;

const ExtraIncome: React.FC = () => {
	useEffect(() => {
		document.title = "Extra Income";
	}, []);

	const compressedExtraIncomeImage = useCompressedImage(ExtraIncomeImage);
	const compressedPassiveIcon = useCompressedImage(PassiveIcon);
	const compressedDealsIcon = useCompressedImage(DealsIcon);

	const breadcrumbPaths = [
		{ title: "Home", url: "/" },
		{ title: "Extra Income ", url: "/category/extra-income" },
	];

	const linkBoxes = [
		{
			to: "/category/extra-income/Freelancers",
			ariaLabel: "Become A Freelancer",
			imgSrc: compressedExtraIncomeImage || ExtraIncomeImage,
			altText: "Manage Finance Photo",
			captionText: "Become A Freelancer",
		},
		{
			to: "/category/extra-income/Budgetting",
			ariaLabel: "Budgetting Guides",
			imgSrc: compressedPassiveIcon || PassiveIcon,
			altText: "Passive Income Icon",
			captionText: "Budgeting",
		},
		{
			to: "/category/extra-income/Remote-Jobs",
			ariaLabel: "Deals",
			imgSrc: compressedDealsIcon || DealsIcon,
			altText: "Deals And Saving Icon",
			captionText: "Remote Jobs",
		},
		{
			to: "/category/extra-income/Side-Hustles",
			ariaLabel: "Deals",
			imgSrc: compressedDealsIcon || DealsIcon,
			altText: "Deals And Saving Icon",
			captionText: "Side Hustles",
		},
		{
			to: "/category/extra-income/money-making-apps",
			ariaLabel: "Deals",
			imgSrc: compressedDealsIcon || DealsIcon,
			altText: "Deals And Saving Icon",
			captionText: "Make Money On Apps",
		},
		{
			to: "/category/extra-income/Start-A-Blog",
			ariaLabel: "Deals",
			imgSrc: compressedDealsIcon || DealsIcon,
			altText: "Deals And Saving Icon",
			captionText: "Start A Blog",
		},
	];

	return (
		<PageContainer>
			<BreadcrumbContainer>
				<Breadcrumb paths={breadcrumbPaths} />
			</BreadcrumbContainer>
			<TopAdContainer>
				<AdComponent width={728} height={90} />
			</TopAdContainer>
			<ContentWrapper>
				<LinksContainer aria-label='Main navigation links'>
					{linkBoxes.map((linkBox, index) => (
						<LinkBox key={index} to={linkBox.to} aria-label={linkBox.ariaLabel}>
							<img src={linkBox.imgSrc} alt={linkBox.altText} loading='lazy' />
							<Figcaption>{linkBox.captionText}</Figcaption>
						</LinkBox>
					))}
				</LinksContainer>
			</ContentWrapper>
		</PageContainer>
	);
};

export default ExtraIncome;
