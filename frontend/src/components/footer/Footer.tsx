import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import facebookIcon from "../../../src/assets/images/favicon/facebook-icon.svg";
import instagramIcon from "../../../src/assets/images/favicon/instagram-icon.svg";
import youtubeIcon from "../../../src/assets/images/favicon/youtube-icon.svg";

const Footer: React.FC = () => {
	const [currentYear, setCurrentYear] = useState<number>(2024); // Default fallback

	useEffect(() => {
		setCurrentYear(new Date().getFullYear());
	}, []);

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
				{ to: "/extra-income/freelance-jobs", text: "Freelancer Opportunities" },
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
				{ to: "/about-us", text: "About Us" },
			],
		},
	];

	const socialLinks = [
		{
			href: "https://www.youtube.com/@dollarsandlife",
			icon: youtubeIcon.src,
			alt: "YouTube",
		},
		{
			href: "https://www.facebook.com/profile.php?id=61552256902083",
			icon: facebookIcon.src,
			alt: "Facebook",
		},
		{
			href: "https://www.instagram.com/dollars_and_life/",
			icon: instagramIcon.src,
			alt: "Instagram",
		},
	];

	return (
		<>
			<Head>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "Organization",
						name: "Dollars And Life",
						url: "https://www.dollarsandlife.com",
						logo: "/images/website-logo.webp",
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
			</Head>

			<footer className='footer-container'>
				<div className='social-container'>
					{socialLinks.map(({ href, icon, alt }, idx) => (
						<a
							key={idx}
							href={href}
							target='_blank'
							rel='noopener noreferrer'
							className='social-link'
							aria-label={alt}
						>
							<img src={icon} alt={alt} className='social-icon' />
						</a>
					))}
				</div>

				<div className='main-footer-container'>
					{footerColumns.map((column, idx) => (
						<div className='column' key={idx}>
							<h2 className='header'>{column.title}</h2>
							{column.links.map((link, linkIdx) => (
								<Link key={linkIdx} href={link.to} className='footer-link'>
									{link.text}
								</Link>
							))}
						</div>
					))}
				</div>

				<div className='disclosure-statment'>
					<p>
						This site contains affiliate links, and we may earn a commission if
						you make a purchase. Some apps or services mentioned may collect and
						share data for market research. We do not target ads based on
						sensitive data, and all recommendations are intended for general
						audiences only. Refer to our{" "}
						<Link href='/terms-of-service'>Terms Of Service</Link> and{" "}
						<Link href='/privacy-policy'>Privacy Policy</Link> pages.
					</p>
				</div>

				<div className='copyright'>
					© {currentYear} All Rights Reserved Texas Connect LLC <br />
					Developed And Designed By{" "}
					<a
						href='https://www.linkedin.com/in/tarek-ismail-96777578/'
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
