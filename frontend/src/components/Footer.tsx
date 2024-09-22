import React from "react";
import { Link } from "react-router-dom";
import "./Footer.css";
import FacebookIcon from "/images/favicon/facebook-icon.svg";
import InstagramIcon from "/images/favicon/instagram-icon.svg";
import YoutubeIcon from "/images/favicon/youtube-icon.svg";

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	// Ensure footerLinks is defined
	const footerLinks = [
		{
			header: "Discover",
			links: [
				{ to: "/financial-calculators", text: "Calculators" },
				{ to: "/extra-income/money-making-apps", text: "Investment" },
				{ to: "/extra-income/money-making-apps", text: "Passive Income Apps" },
			],
		},
		{
			header: "Earning",
			links: [
				{ to: "/extra-income/Freelancers", text: "Freelancer Opportunities" },
				{ to: "/extra-income/Budget/", text: "Budgeting" },
				{ to: "/Shopping-Deals", text: "Deals & Saving" },
				{ to: "/Start-A-Blog", text: "Start A Blog" },
			],
		},
		{
			header: "Who Are We?",
			links: [
				// { to: "/about-us", text: "About Us" },
				{ to: "/contact-us", text: "Contact Us" },
				{ to: "/terms-of-service", text: "Terms Of Service" },
			],
		},
	];

	return (
		<div className='footer-container'>
			{/* Social Media Section */}
			<div className='social-container'>
				<div className='social-media youtube'>
					<a
						href='https://www.youtube.com/channel/UCIV08RQSLOnOCFMe7Kj5-iA'
						target='_blank'
						rel='noopener noreferrer'
					>
						<img src={YoutubeIcon} alt='YouTube' className='social-icon' />
					</a>
				</div>
				<div className='social-media facebook'>
					<a
						href='https://www.facebook.com/profile.php?id=61552256902083'
						target='_blank'
						rel='noopener noreferrer'
					>
						<img src={FacebookIcon} alt='Facebook' className='social-icon' />
					</a>
				</div>
				<div className='social-media instagram'>
					<a
						href='https://www.instagram.com/dollarsnlife/'
						target='_blank'
						rel='noopener noreferrer'
					>
						<img src={InstagramIcon} alt='Instagram' className='social-icon' />
					</a>
				</div>
			</div>
			{/* Main Footer Links */}
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
			{/* Copyright */}
			<div className='copyright'>
				© {currentYear} All Rights Reserved Texas Connect LLC <br />
				Developed And Designed By
				<a href='https://www.linkedin.com/in/tarek-ismael-96777578/'>
					{" "}
					Tarek I.{" "}
				</a>
			</div>
		</div>
	);
};

export default React.memo(Footer);
