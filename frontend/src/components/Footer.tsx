import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faYoutube,
	faFacebook,
	faInstagram,
} from "@fortawesome/free-brands-svg-icons";
import "./Footer.css";

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
				{ to: "/financial-calculators", text: "Calculators" },
				// { to: "/budget-apps", text: "Budget Apps" },
				{ to: "/extra-income/money-making-apps", text: "Investment" },
				{ to: "/extra-income/money-making-apps", text: "Passive Income Apps" },
			],
		},
		{
			header: "Earning",
			links: [
				{ to: "/extra-income/Freelancers", text: "Freelancer Oppurtunities" },
				// { to: "/extra-income/Side-Hustles", text: "Side Hustles" },
				{ to: "/extra-income/Budget/", text: "Budgeting" },
				{ to: "/Shopping-Deals", text: "Deals & Saving" },
				{ to: "/Start-A-Blog", text: "Start A Blog" },
			],
		},
		{
			header: "Who Are We?",
			links: [
				{ to: "/about-us", text: "About Us" },
				{ to: "/contact-us", text: "Contact Us" },
				{ to: "/terms-of-service", text: "Terms Of Service" },
			],
		},
	];

	return (
		<div className='footer-container'>
			<div className='social-container'>
				{socialLinks.map((link, index) => (
					<a
						key={index}
						href={link.href}
						target='_blank'
						rel='noopener noreferrer'
						className='social-link'
						style={{ color: link.color }}
					>
						<FontAwesomeIcon icon={link.icon} style={{ fontSize: "30px" }} />
					</a>
				))}
			</div>
			<div className='main-footer-container'>
				{footerLinks.map((column, index) => (
					<div className='column' key={index}>
						<h3 className='header'>{column.header}</h3>
						{column.links.map((link, linkIndex) => (
							<Link key={linkIndex} to={link.to} className='footer-link'>
								{link.text}
							</Link>
						))}
					</div>
				))}
			</div>
			<div className='copyright'>
				© {currentYear} All Rights Reserved Texas Connect LLC
			</div>
		</div>
	);
};

export default React.memo(Footer);
