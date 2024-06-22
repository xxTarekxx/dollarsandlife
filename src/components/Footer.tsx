import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
	faYoutube,
	faFacebook,
	faTwitter,
	faInstagram,
} from "@fortawesome/free-brands-svg-icons";

// Styled components for SocialFlaw
const SocialContainer = styled.div`
	// width: 100%;
	background: #eee;
	padding: 25px 50px;
	display: flex;
	justify-content: center;
	flex-wrap: wrap;

	@media (max-width: 768px) {
		padding: 25px 0;
	}
`;

const SocialLink = styled.a`
	margin: 0 1rem;
	transition: transform 250ms;
	display: inline-block;

	&:hover {
		transform: translateY(-2px);
	}
`;

const Youtube = styled(SocialLink)`
	color: #eb3223;
`;

const Facebook = styled(SocialLink)`
	color: #4968ad;
`;

const Twitter = styled(SocialLink)`
	color: #49a1eb;
`;

const Instagram = styled(SocialLink)`
	color: black;
`;

// Styled components for Footer
const FooterContainer = styled.footer`
	background: #ff9a00;
	width: 100%;
	padding: 2rem 1rem;
	box-sizing: border-box;
	display: flex;
	justify-content: center;
	align-items: flex-start;
	flex-wrap: wrap;
	border-radius: 20px;

	@media (max-width: 768px) {
		justify-content: center;
	}
`;

const Column = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin-bottom: 1rem;
	padding: 0 1rem;

	@media (max-width: 768px) {
		width: 50%;
	}
`;

const Header = styled.h3`
	margin-bottom: 1rem;
	font-size: 1.05rem;
	text-align: center;
`;

const FooterLink = styled(Link)`
	text-decoration: none;
	color: black;
	margin-bottom: 0.5rem;
	font-weight: 300;
	font-size: 1rem;
	text-align: center;

	&:hover {
		color: #7b7fda;
	}

	@media (max-width: 768px) {
		font-size: 0.9rem;
	}
`;

const Copyright = styled.div`
	width: 100%;
	text-align: center;
	padding: 1rem 0;
	font-size: 0.9rem;
`;

// Combined Component
const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();
	return (
		<>
			<SocialContainer>
				<Youtube
					href='https://www.youtube.com/channel/UCIV08RQSLOnOCFMe7Kj5-iA'
					className='youtube social'
					target='_blank'
					rel='noopener noreferrer'
				>
					<FontAwesomeIcon
						icon={faYoutube as IconDefinition}
						style={{ fontSize: "30px" }}
					/>
				</Youtube>
				<Facebook
					href='https://www.facebook.com/profile.php?id=61552256902083'
					className='youtube social'
					target='_blank'
					rel='noopener noreferrer'
				>
					<FontAwesomeIcon
						icon={faFacebook as IconDefinition}
						style={{ fontSize: "30px" }}
					/>
				</Facebook>
				<Instagram
					href='https://www.instagram.com/dollarsnlife/'
					className='youtube social'
					target='_blank'
					rel='noopener noreferrer'
				>
					<FontAwesomeIcon
						icon={faInstagram as IconDefinition}
						style={{ fontSize: "30px" }}
					/>
				</Instagram>
				{/* <Twitter
					href='https://wwww.twitter.com'
					className='youtube social'
					target='_blank'
					rel='noopener noreferrer'
				>
					<FontAwesomeIcon
						icon={faTwitter as IconDefinition}
						style={{ fontSize: "30px" }}
					/>
				</Twitter> */}
			</SocialContainer>
			<FooterContainer>
				<Column>
					<Header>Discover</Header>
					<FooterLink to='/calculator'>Calculators</FooterLink>
					<FooterLink to='/budget-apps'>Budget Apps</FooterLink>
					<FooterLink to='/investment'>Investment</FooterLink>
					<FooterLink to='/passive-income-apps'>Passive Income Apps</FooterLink>
				</Column>
				<Column>
					<Header>Earning</Header>
					<FooterLink to='/'>Home</FooterLink>
					<FooterLink to='/category/manageyourfinances'>
						Manage Your Finances
					</FooterLink>
					<FooterLink to='/passive-income'>Passive Income</FooterLink>
					<FooterLink to='/side-hustles'>Side Hustles</FooterLink>
					<FooterLink to='/category/deals-and-saving/manageyourfinances'>
						Deals & Saving
					</FooterLink>
					<FooterLink to='/start-a-blog'>Start A Blog</FooterLink>
				</Column>
				<Column>
					<Header>Who Are We?</Header>
					<FooterLink to='/about-us'>About Us</FooterLink>
					<FooterLink to='/contact-us'>Contact Us</FooterLink>
					<FooterLink to='/our-team'>Our Team Members</FooterLink>
				</Column>
				<Copyright>
					© {currentYear} All Rights Reserved Texas Connect LLC
				</Copyright>
			</FooterContainer>
		</>
	);
};

export default React.memo(Footer);
