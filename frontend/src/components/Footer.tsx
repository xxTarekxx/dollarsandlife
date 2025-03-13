import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./Footer.css";
import FacebookIcon from "/images/favicon/facebook-icon.svg";
import InstagramIcon from "/images/favicon/instagram-icon.svg";
import YoutubeIcon from "/images/favicon/youtube-icon.svg";

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	const footerLinks = [
		{
			header: "Discover",
			links: [
				{ to: "/financial-calculators", text: "Calculators" },
				{ to: "/Extra-Income/Money-Making-Apps", text: "Investment" },
				{ to: "/Extra-Income/Money-Making-Apps", text: "Passive Income Apps" },
			],
		},
		{
			header: "Earning",
			links: [
				{ to: "/Extra-Income/Freelancers", text: "Freelancer Opportunities" },
				{ to: "/Extra-Income/Budget/", text: "Budgeting" },
				{ to: "/Shopping-Deals", text: "Deals & Saving" },
				{ to: "/Start-A-Blog", text: "Start A Blog" },
			],
		},
		{
			header: "Get In Touch",
			links: [
				{ to: "/contact-us", text: "Contact Us" },
				{ to: "/terms-of-service", text: "Terms Of Service" },
			],
		},
	];

	return (
		<>
			<Helmet>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "Organization",
						name: "Dollars And Life",
						url: "https://www.dollarsandlife.com",
						logo: "/images/favicon/favicon.webp",
						sameAs: [
							"https://www.facebook.com/profile.php?id=61552256902083",
							"https://www.instagram.com/dollarsnlife/",
							"https://www.youtube.com/channel/UCIV08RQSLOnOCFMe7Kj5-iA",
						],
						contactPoint: {
							"@type": "ContactPoint",
							email: "contact@dollarsandlife.com",
							contactType: "Customer Service",
						},
					})}
				</script>
			</Helmet>

			<div className='footer-container'>
				{/* Social Media Section */}
				<div className='social-container'>
					<div className='social-media youtube'>
						<a
							href='https://www.youtube.com/@dollarsandlife'
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
							href='https://www.instagram.com/dollars_and_life/'
							target='_blank'
							rel='noopener noreferrer'
						>
							<img
								src={InstagramIcon}
								alt='Instagram'
								className='social-icon'
							/>
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

				{/* Disclaimer Statement */}
				<div className='disclosure-statment'>
					<p>
						This site contains affiliate links, and we may earn a commission if
						you make a purchase. Some apps or services mentioned may collect and
						share data for market research. We do not target ads based on
						sensitive data, and all recommendations are intended for general
						audiences only. Refer to{" "}
						<a href='https://www.dollarsandlife.com/terms-of-service'>
							Terms Of Service
						</a>{" "}
						and{" "}
						<a href='https://www.dollarsandlife.com/privacy-policy'>
							Privacy Policy
						</a>{" "}
						page.
					</p>
				</div>

				{/* Copyright & Developer Info */}
				<div className='copyright'>
					© {currentYear} All Rights Reserved Texas Connect LLC <br />
					Developed And Designed By
					<a href='https://www.linkedin.com/in/tarek-ismael-96777578/'>
						{" "}
						Tarek I.{" "}
					</a>
				</div>
			</div>
		</>
	);
};

export default React.memo(Footer);
