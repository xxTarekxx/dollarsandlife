"use client";

import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { prefixLang } from "@/lib/i18n/prefixLang";
import type { FooterLabels } from "@/lib/i18n/ui-translations";
import facebookIcon from "../../../src/assets/images/favicon/facebook-icon.svg";
import instagramIcon from "../../../src/assets/images/favicon/instagram-icon.svg";
import youtubeIcon from "../../../src/assets/images/favicon/youtube-icon.svg";

const Footer: React.FC<{ lang?: string; labels?: FooterLabels }> = ({ lang, labels }) => {
	const [currentYear, setCurrentYear] = useState<number>(2024); // Default fallback

	useEffect(() => {
		setCurrentYear(new Date().getFullYear());
	}, []);

	// Use translated labels when provided, else fall back to English
	const footerColumns = [
		{
			title: labels?.discoverHeading ?? "Discover",
			links: [
				{ to: "/financial-calculators", text: labels?.calculators ?? "Calculators" },
				{ to: "/extra-income/money-making-apps", text: labels?.investment ?? "Investment" },
				{ to: "/extra-income/money-making-apps", text: labels?.passiveIncomeApps ?? "Passive Income Apps" },
			],
		},
		{
			title: labels?.earningHeading ?? "Earning",
			links: [
				{ to: "/extra-income/freelance-jobs", text: labels?.freelancerOpportunities ?? "Freelancer Opportunities" },
				{ to: "/extra-income/budget", text: labels?.budgeting ?? "Budgeting" },
				{ to: "/shopping-deals", text: labels?.dealsAndSaving ?? "Deals & Saving" },
				{ to: "/start-a-blog", text: labels?.startABlog ?? "Start A Blog" },
			],
		},
		{
			title: labels?.getInTouchHeading ?? "Get In Touch",
			links: [
				{ to: "/contact-us", text: labels?.contactUs ?? "Contact Us" },
				{ to: "/terms-of-service", text: labels?.termsOfService ?? "Terms Of Service" },
				{ to: "/privacy-policy", text: labels?.privacyPolicy ?? "Privacy Policy" },
				{ to: "/about-us", text: labels?.aboutUs ?? "About Us" },
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
								<Link key={linkIdx} href={prefixLang(link.to, lang)} className='footer-link'>
									{link.text}
								</Link>
							))}
						</div>
					))}
				</div>

				<div className='disclosure-statment'>
					<p>
						{labels?.disclosureText ??
							"This site contains affiliate links, and we may earn a commission if you make a purchase. Some apps or services mentioned may collect and share data for market research. We do not target ads based on sensitive data, and all recommendations are intended for general audiences only."}{" "}
						Refer to our{" "}
						<Link href={prefixLang("/terms-of-service", lang)}>{labels?.termsOfService ?? "Terms Of Service"}</Link> and{" "}
						<Link href={prefixLang("/privacy-policy", lang)}>{labels?.privacyPolicy ?? "Privacy Policy"}</Link> pages.
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
