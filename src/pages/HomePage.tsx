import React from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import ManageIcon from "../images/icons/manage-your-finances-icon.png";
import PassiveIcon from "../images/icons/passive-income.png";
import DealsIcon from "../images/icons/deal-and-savings-icon.png";

const LinksContainer = styled.div`
	width: 100%;
	margin: 9% auto;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
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
	font-size: 22px;
	border-radius: 20px;
	margin: 1%;
	color: black;
	box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
		rgba(0, 0, 0, 0.3) 0px 30px 60px -30px,
		rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;

	text-align: center;
	text-decoration: none;

	&:hover img {
		animation: ${spinAnimation} 0.2s linear 1;
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

const HomePage = () => {
	return (
		<LinksContainer aria-label='Main navigation links'>
			<LinkBox to='/category/extra-income/' aria-label='Extra Income'>
				<img src={ManageIcon} alt='Manage Finance Photo' loading='lazy' />
				<Figcaption>Extra Income</Figcaption>
			</LinkBox>
			<LinkBox to='/passive-income' aria-label='Passive Income'>
				<img src={PassiveIcon} alt='Passive Income Icon' loading='lazy' />
				<Figcaption>Passive Income</Figcaption>
			</LinkBox>
			<LinkBox to='/amazon-products' aria-label='Deals'>
				<img src={DealsIcon} alt='Deals And Saving Icon' loading='lazy' />
				<Figcaption>Deals</Figcaption>
			</LinkBox>
		</LinksContainer>
	);
};

export default HomePage;
