import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./Footer.css";
import FacebookIcon from "/images/favicon/facebook-icon.svg";
import InstagramIcon from "/images/favicon/instagram-icon.svg";
import YoutubeIcon from "/images/favicon/youtube-icon.svg";

const Footer: React.FC = () => {
	const currentYear = new Date().getFullYear();

	const footerColumns = [
		{
			title: "Discover",
			links: [
				{ to: "/financial-calculators", text: "Calculators" },
				{ to: "/extra-income/money-making-apps", text: "Investment" },
				{ to: "/extra-income/money-making-apps", text: "Passive Income Apps" },
			],
		},
		{
			title: "Earning",
			links: [
				{ to: "/extra-income/freelancers", text: "Freelancer Opportunities" },
				{ to: "/extra-income/budget", text: "Budgeting" },
				{ to: "/shopping-deals", text: "Deals & Saving" },
				{ to: "/start-a-blog", text: "Start A Blog" },
			],
		},
		{
			title: "Get In Touch",
			links: [
				{ to: "/contact-us", text: "Contact Us" },
				{ to: "/terms-of-service", text: "Terms Of Service" },
				{ to: "/privacy-policy", text: "Privacy Policy" },
			],
		},
	];

	const socialLinks = [
		{
			href: "https://www.youtube.com/@dollarsandlife",
			icon: YoutubeIcon,
			alt: "YouTube",
		},
		{
			href: "https://www.facebook.com/profile.php?id=61552256902083",
			icon: FacebookIcon,
			alt: "Facebook",
		},
		{
			href: "https://www.instagram.com/dollars_and_life/",
			icon: InstagramIcon,
			alt: "Instagram",
		},
	];

	return (
		<>
			{/* Structured Data */}
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

			<footer className='footer-container'>
				{/* Social Media */}
				<div className='social-container'>
					{socialLinks.map(({ href, icon, alt }, idx) => (
						<a
							key={idx}
							href={href}
							target='_blank'
							rel='noopener noreferrer'
							className='social-media'
							aria-label={alt}
						>
							<img src={icon} alt={alt} className='social-icon' />
						</a>
					))}
				</div>

				{/* Footer Columns */}
				<div className='main-footer-container'>
					{footerColumns.map((column, idx) => (
						<div className='column' key={idx}>
							<h2 className='header'>{column.title}</h2>
							{column.links.map((link, linkIdx) => (
								<Link key={linkIdx} to={link.to} className='footer-link'>
									{link.text}
								</Link>
							))}
						</div>
					))}
				</div>

				{/* Disclosure */}
				<div className='disclosure-statment'>
					<p>
						This site contains affiliate links, and we may earn a commission if
						you make a purchase. Some apps or services mentioned may collect and
						share data for market research. We do not target ads based on
						sensitive data, and all recommendations are intended for general
						audiences only. Refer to our{" "}
						<Link to='/terms-of-service'>Terms Of Service</Link> and{" "}
						<Link to='/privacy-policy'>Privacy Policy</Link> pages.
					</p>
				</div>

				{/* Copyright */}
				<div className='copyright'>
					© {currentYear} All Rights Reserved Texas Connect LLC <br />
					Developed And Designed By{" "}
					<a
						href='https://www.linkedin.com/in/tarek-ismael-96777578/'
						target='_blank'
						rel='noopener noreferrer'
					>
						Tarek I.
					</a>
				</div>
			</footer>
		</>
	);
};

export default React.memo(Footer);
