import React from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import ManageIcon from "../images/icons/manage-your-finances-icon.png";
import PassiveIcon from "../images/icons/passive-income.png";
import DealsIcon from "../images/icons/deal-and-savings-icon.png";

// Define GlobalStyle in the root of your application
// const GlobalStyle = createGlobalStyle`...`;

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

const LinkBox = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	background: white;
	font-size: 22px;
	border-radius: 10px;
	margin: 1%;
	text-decoration: none;
	color: black;
	box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
		rgba(0, 0, 0, 0.3) 0px 30px 60px -30px,
		rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;

	&:hover img {
		animation: ${spinAnimation} 0.2s linear 1;
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

const Figure = styled.figure`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	text-align: center;
	margin: 0;
	padding: 0.5rem;

	figcaption {
		color: black;
		transition: color 0.3s ease-in-out;
	}

	&:hover figcaption {
		color: #7600ff;
	}

	a {
		text-decoration: none;
	}
`;

const HomePage = () => {
	return (
		<LinksContainer aria-label='Main navigation links'>
			<LinkBox>
				<Figure>
					<Link to='/category/extra-income'>
						<img src={ManageIcon} alt='Manage Finance Photo' loading='lazy' />
						<figcaption>Extra Income</figcaption>
					</Link>
				</Figure>
			</LinkBox>
			<LinkBox>
				<Figure>
					<Link to='/passive-income'>
						<img src={PassiveIcon} alt='Passive Income Icon' loading='lazy' />
						<figcaption>Passive Income</figcaption>
					</Link>
				</Figure>
			</LinkBox>
			<LinkBox>
				<Figure>
					<Link to='/amazon-products'>
						<img src={DealsIcon} alt='Deals And Saving Icon' loading='lazy' />
						<figcaption>Deals</figcaption>
					</Link>
				</Figure>
			</LinkBox>
		</LinksContainer>
	);
};

export default HomePage;
