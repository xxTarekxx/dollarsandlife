import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import useCompressedImage from "../../../components/compressed/useCompressedImage";
import ExtraIncomeImage from "../../../assets/images/icons/extra-income-icon.webp";
import PassiveIcon from "../../../assets/images/icons/passive-income.png";
import DealsIcon from "../../../assets/images/icons/deal-and-savings-icon.webp";
import Breadcrumb from "../../../components/Breadcrumb";

const PageContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	overflow: hidden; /* add this line */
`;

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
	font-size: 22px;
	border-radius: 20px;
	box-sizing: border-box; /* add this line */
	margin: 0.5% 2%; /* adjust this line, reduce the margin */
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

	&:hover {
		color: #7600ff;
	}
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

	return (
		<PageContainer>
			<BreadcrumbContainer>
				<Breadcrumb paths={breadcrumbPaths} />
			</BreadcrumbContainer>
			<LinksContainer aria-label='Main navigation links'>
				<LinkBox
					to='/category/extra-income/Freelancers'
					aria-label='Become A Freelancer'
				>
					<img
						src={compressedExtraIncomeImage || ExtraIncomeImage}
						alt='Manage Finance Photo'
						loading='lazy'
					/>
					<Figcaption>Become A Freelancer</Figcaption>
				</LinkBox>
				<LinkBox
					to='/category/extra-income/Budgetting'
					aria-label='Budgetting Guides'
				>
					<img
						src={compressedPassiveIcon || PassiveIcon}
						alt='Passive Income Icon'
						loading='lazy'
					/>
					<Figcaption>Budgeting</Figcaption>
				</LinkBox>
				<LinkBox to='/category/extra-income/Remote-Jobs' aria-label='Deals'>
					<img
						src={compressedDealsIcon || DealsIcon}
						alt='Deals And Saving Icon'
						loading='lazy'
					/>
					<Figcaption>Remote Jobs </Figcaption>
				</LinkBox>
				<LinkBox to='/category/extra-income/Side-Hustles' aria-label='Deals'>
					<img
						src={compressedDealsIcon || DealsIcon}
						alt='Deals And Saving Icon'
						loading='lazy'
					/>
					<Figcaption>Side Hustles</Figcaption>
				</LinkBox>
				<LinkBox
					to='/category/extra-income/money-making-apps'
					aria-label='Deals'
				>
					<img
						src={compressedDealsIcon || DealsIcon}
						alt='Deals And Saving Icon'
						loading='lazy'
					/>
					<Figcaption>Make Money On Apps</Figcaption>
				</LinkBox>
				<LinkBox to='/category/extra-income/Start-A-Blog' aria-label='Deals'>
					<img
						src={compressedDealsIcon || DealsIcon}
						alt='Deals And Saving Icon'
						loading='lazy'
					/>
					<Figcaption>Start A Blog</Figcaption>
				</LinkBox>
			</LinksContainer>
		</PageContainer>
	);
};

export default ExtraIncome;
