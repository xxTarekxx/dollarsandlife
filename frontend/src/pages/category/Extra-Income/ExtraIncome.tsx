import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./ExtraIncome.css";
import Budgettingimg from "/images/icons/img-budgetting.webp";
import FreeLancerimg from "/images/icons/img-freelancer.webp";
import MoneyMakingAppsimg from "/images/icons/img-moneymakingapps.webp";
import RemoteJobimg from "/images/icons/img-remotejobs.webp";

const ExtraIncome: React.FC = () => {
	const linkBoxes = [
		{
			to: "/extra-income/freelancers",
			ariaLabel: "Explore freelance opportunities",
			imgSrc: FreeLancerimg,
			altText: "Freelance job opportunities",
			captionText: "Freelance Opportunities",
			priority: true,
		},
		{
			to: "/extra-income/budget",
			ariaLabel: "Learn budgeting strategies",
			imgSrc: Budgettingimg,
			altText: "Budgeting and financial planning",
			captionText: "Budgeting",
			priority: false,
		},
		{
			to: "/extra-income/remote-Jobs",
			ariaLabel: "Find remote job opportunities",
			imgSrc: RemoteJobimg,
			altText: "Remote jobs and online work",
			captionText: "Remote Jobs",
			priority: false,
		},
		{
			to: "/extra-income/money-making-apps",
			ariaLabel: "Earn money using apps",
			imgSrc: MoneyMakingAppsimg,
			altText: "Apps to earn money online",
			captionText: "Make Money On Apps",
			priority: false,
		},
	];

	return (
		<>
			<Helmet>
				<title>Extra Income Opportunities | Earn More Money</title>
				<meta
					name='description'
					content='Explore various ways to earn extra income, including freelancing, remote jobs, budgeting, and money-making apps.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/extra-income'
				/>

				{/* Preload only LCP image */}
				{linkBoxes
					.filter((link) => link.priority)
					.map((link, i) => (
						<link
							key={i}
							rel='preload'
							as='image'
							href={link.imgSrc}
							type='image/webp'
						/>
					))}

				{/* Structured Data */}
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Extra Income Opportunities",
						url: "https://www.dollarsandlife.com/extra-income",
						description:
							"Explore various ways to earn extra income, including freelancing, remote jobs, budgeting, and money-making apps.",
						publisher: {
							"@type": "Organization",
							name: "Dollars & Life",
							logo: {
								"@type": "ImageObject",
								url: "/images/favicon/favicon.webp",
							},
						},
					})}
				</script>
			</Helmet>

			<div>
				<h1>Explore Extra Income Opportunities</h1>

				{/* Category Links */}
				<div
					className='category-links-container'
					aria-label='Extra income categories'
				>
					{linkBoxes.map((linkBox, index) => (
						<Link
							className='link-box'
							key={index}
							to={linkBox.to}
							aria-label={linkBox.ariaLabel}
						>
							<img
								src={linkBox.imgSrc}
								alt={linkBox.altText}
								loading={linkBox.priority ? "eager" : "lazy"}
								width='220'
								height='220'
								{...(linkBox.priority ? { fetchpriority: "high" } : {})} //  No warning
							/>
							<figcaption className='extraincome-figcaption'>
								{linkBox.captionText}
							</figcaption>
						</Link>
					))}
				</div>

				{/* Advertisement Section */}
				<div className='top-banner-container'>
					<a
						href='https://lycamobileusa.sjv.io/c/5513478/2107177/25589'
						target='_blank'
						rel='noopener noreferrer'
						className='TopBanner'
					>
						<img
							src='/images/shoppinganddeals/Lyca-Mobile-728x90.webp'
							alt='Lyca Mobile Banner - Affordable International Calling'
							className='TopBannerImage'
							loading='eager'
						/>
					</a>
				</div>
			</div>
		</>
	);
};

export default ExtraIncome;
