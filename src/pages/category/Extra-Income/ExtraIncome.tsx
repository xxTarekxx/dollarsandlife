import React from "react";
import { Link } from "react-router-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";
import ManageIcon from "../images/icons/manage-your-finances-icon.png";
import PassiveIcon from "../images/icons/passive-income.png";
import DealsIcon from "../images/icons/deal-and-savings-icon.png";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
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
		// animation: ${shakeAnimation} 0.5s;
		// animation-iteration-count: 1;

		
    // position: absolute;
    // top: 50%;
    // left: 50%;
    // width: 120px;
    // height: 120px;
    // margin:-60px 0 0 -60px;
    -webkit-animation:spin 14s linear infinite;
    -moz-animation:spin 4s linear infinite;
    animation:spin 0.2s linear 1;
}
@-moz-keyframes spin { 
    100% { -moz-transform: rotate(360deg); } 
}
@-webkit-keyframes spin { 
    100% { -webkit-transform: rotate(360deg); } 
}
@keyframes spin { 
    100% { 
        -webkit-transform: rotate(360deg); 
        transform:rotate(360deg); 
    } 
}
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
		transition: color 0.3s ease-in-out;
	}

	&:hover figcaption {
		color: #7600ff;
	}

	a {
		text-decoration: none; // This will remove the underline from links
	}
`;

const ExtraIncome: React.FC = () => {
	return (
		<>
			<GlobalStyle />
			<LinksContainer aria-label='Main navigation links'>
				<LinkBox>
					<Figure>
						<Link to='/category/manageyourfinances'>
							<img src={ManageIcon} alt='Manage Finance Photo' />
							<figcaption>Manage Your Finances</figcaption>
						</Link>
					</Figure>
				</LinkBox>
				<LinkBox>
					<Figure>
						<Link to='/category/ExtraIncome/FreelanceJobs'>
							<img src={ManageIcon} alt='Manage Finance Photo' />
							<figcaption>Manage Your Finances</figcaption>
						</Link>
					</Figure>
				</LinkBox>
				<LinkBox>
					<Figure>
						<Link to='/category/manageyourfinances'>
							<img src={ManageIcon} alt='Manage Finance Photo' />
							<figcaption>Manage Your Finances</figcaption>
						</Link>
					</Figure>
				</LinkBox>
				<LinkBox>
					<Figure>
						<Link to='/category/manageyourfinances'>
							<img src={ManageIcon} alt='Manage Finance Photo' />
							<figcaption>Manage Your Finances</figcaption>
						</Link>
					</Figure>
				</LinkBox>
				<LinkBox>
					<Figure>
						<Link to='/passive-income'>
							<img src={PassiveIcon} alt='Passive Income Icon' />
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
			</LinksContainer>
		</>
	);
};

export default ExtraIncome;
