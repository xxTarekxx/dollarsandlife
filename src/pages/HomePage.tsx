import React from "react";
import { Link } from "react-router-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import BackGroundImage from "../images/background.jpg";
import BackGroundImage2 from "../images/background-2.jpg";
import ManageIcon from "../images/icons/manage-your-finances-icon.png";
import PassiveIcon from "../images/icons/passive-income.png";
import DealsIcon from "../images/icons/deal-and-savings-icon.png";

const Container = styled.div`
	// background-color: white;
`;

const LinksContainer = styled.div`
	width: 100%;
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
	background-attachment: fixed;
	margin: 9% auto;
	display: flex;
	flex-wrap: wrap;
	justify-content: center;
	align-items: center;
`;

const shakeAnimation = keyframes`
  0% { transform: translateX(0); }
  10% { transform: translateX(-10px); }
  20% { transform: translateX(10px); }
  30% { transform: translateX(-10px); }
  40% { transform: translateX(10px); }
  50% { transform: translateX(0); }
`;

const LinkBox = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	background: white;
	font-size: 22px;
	border-top-right-radius: 10px;
	border-bottom-left-radius: 10px;
	margin: 1% 1%;
	text-decoration: none;
	color: black;

	box-shadow: rgba(50, 50, 93, 0.25) 0px 50px 100px -20px,
		rgba(0, 0, 0, 0.3) 0px 30px 60px -30px,
		rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset;

	&:hover img {
		animation: ${shakeAnimation} 0.5s;
		animation-iteration-count: 1; // Run the animation only once
	}

	@media (max-width: 768px) {
		width: 70%;
		height: auto;
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
	height: 100%;
	width: 100%;
	margin: 0;
	padding: 0.5rem;

	figcaption {
		color: black;
		transition: color 0.3s ease-in-out; // Smooth color transition for hover effect
	}

	&:hover figcaption {
		color: #7600ff; // Color change on hover
	}
`;

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
`;

const TrendingTopics = styled.div`
	// background-color: white;
	// background-image: url(${BackGroundImage2});
	background-position: center;
	background-repeat: no-repeat;
	background-size: cover;
	background-attachment: fixed;
	margin: 2% auto;
	display: flex;
	flex-wrap: wrap;
	// justify-content: space-around;
	// max-width: 1280px;
`;

const TrendingBox = styled.div`
	max-width: 1280px;
	width: 350px;
	height: 720px;
	display: flex;
	margin: auto;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	border: 1px solid black;
	text-decoration: none;
	color: black;
	// background-color: gray;
	border-radius: 10%;
	transition: transform 0.3s ease-in-out;
`;

const HomePage: React.FC = () => {
	return (
		<>
			<GlobalStyle />

			<Container>
				<LinksContainer aria-label='Main navigation links'>
					<LinkBox>
						<Figure>
							<Link to='/category/manageyourfinances'>
								<img src={ManageIcon} alt='Manage Finace Photo' />
								<figcaption>Manage Your Finances</figcaption>
							</Link>
						</Figure>
					</LinkBox>
					<LinkBox>
						<Figure>
							<Link to='/passive-income'>
								<img src={PassiveIcon} alt='Manage Finace Photo' />
								<figcaption>Passive Income</figcaption>
							</Link>
						</Figure>
					</LinkBox>
					<LinkBox>
						<Figure>
							<Link to='/amazon-products'>
								<img src={DealsIcon} alt='Deals And Saving Icon' />
								<figcaption>Deals</figcaption>
							</Link>
						</Figure>
					</LinkBox>

					{/* <LinkBox>
						<Figure>
							<Link to='/manage-your-finances'>
								<figcaption>Side Hustles</figcaption>
							</Link>
						</Figure>
					</LinkBox>
					<LinkBox>
						<Figure>
							<Link to='/start-a-blog'>
								<figcaption>Start A Blog</figcaption>
							</Link>
						</Figure>
					</LinkBox> */}
				</LinksContainer>
			</Container>
		</>
	);
};

export default HomePage;
