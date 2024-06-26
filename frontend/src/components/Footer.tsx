import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faYoutube,
	faFacebook,
	faInstagram,
} from "@fortawesome/free-brands-svg-icons";

const Container = styled.div`
	background-color: rgba(255, 255, 255, 0.9);
	padding: 2rem 1rem;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
`;

const SocialLink = styled.a`
	margin: 0 1rem;
	transition: transform 250ms;
	display: inline-block;

	&:hover {
		transform: translateY(-2px);
	}
`;

const SocialContainer = styled.div`
	display: flex;
	justify-content: center;
	padding-bottom: 1rem;
`;

const FooterLink = styled(Link)`
	text-decoration: none;
	color: black;
	margin-bottom: 0.5rem;
	font-weight: 500;
	font-size: 1rem;
	text-align: center;

	&:hover {
		color: #7600ff;
	}

	@media (max-width: 768px) {
		font-size: 0.9rem;
	}
`;

const FooterContainer = styled.div`
	display: flex;
	justify-content: center;
	width: 100%;
	padding: 1rem 0;

	@media (max-width: 768px) {
		flex-direction: column;
		align-items: center;
	}
`;

const Column = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 0px 15px;
`;

const Header = styled.h3`
	margin-bottom: 1rem;
	font-size: 1.05rem;
	text-align: center;
`;

const Copyright = styled.div`
	width: 100%;
	text-align: center;
	padding: 1rem 0;
	font-size: 0.9rem;
`;

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	const socialLinks = [
		{
			href: "https://www.youtube.com/channel/UCIV08RQSLOnOCFMe7Kj5-iA",
			icon: faYoutube,
			color: "#eb3223",
		},
		{
			href: "https://www.facebook.com/profile.php?id=61552256902083",
			icon: faFacebook,
			color: "#4968ad",
		},
		{
			href: "https://www.instagram.com/dollarsnlife/",
			icon: faInstagram,
			color: "black",
		},
	];

	const footerLinks = [
		{
			header: "Discover",
			links: [
				{ to: "/calculator", text: "Calculators" },
				{ to: "/budget-apps", text: "Budget Apps" },
				{ to: "/investment", text: "Investment" },
				{ to: "/passive-income-apps", text: "Passive Income Apps" },
			],
		},
		{
			header: "Earning",
			links: [
				{ to: "/passive-income", text: "Passive Income" },
				{ to: "/side-hustles", text: "Side Hustles" },
				{
					to: "/category/deals-and-saving/manageyourfinances",
					text: "Deals & Saving",
				},
				{ to: "/start-a-blog", text: "Start A Blog" },
			],
		},
		{
			header: "Who Are We?",
			links: [
				{ to: "/about-us", text: "About Us" },
				{ to: "/contact-us", text: "Contact Us" },
				{ to: "/our-team", text: "Our Team Members" },
			],
		},
	];

	return (
		<Container>
			<SocialContainer>
				{socialLinks.map((link, index) => (
					<SocialLink
						key={index}
						href={link.href}
						target='_blank'
						rel='noopener noreferrer'
						style={{ color: link.color }}
					>
						<FontAwesomeIcon icon={link.icon} style={{ fontSize: "30px" }} />
					</SocialLink>
				))}
			</SocialContainer>
			<FooterContainer>
				{footerLinks.map((column, index) => (
					<Column key={index}>
						<Header>{column.header}</Header>
						{column.links.map((link, linkIndex) => (
							<FooterLink key={linkIndex} to={link.to}>
								{link.text}
							</FooterLink>
						))}
					</Column>
				))}
			</FooterContainer>
			<Copyright>
				© {currentYear} All Rights Reserved Texas Connect LLC
			</Copyright>
		</Container>
	);
};

export default React.memo(Footer);
