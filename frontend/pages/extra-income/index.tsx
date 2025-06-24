"use client"; // Retained for useState, useEffect for dynamic posts and existing interactions
import Head from "next/head";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import React from "react";
import Budgettingimg from "../../src/assets/images/icons/img-budgetting.webp";
import FreeLancerimg from "../../src/assets/images/icons/img-freelancer.webp";
import MoneyMakingAppsimg from "../../src/assets/images/icons/img-moneymakingapps.webp";
import RemoteJobimg from "../../src/assets/images/icons/img-remotejobs.webp";

// Interface for the statically defined link boxes
interface LinkBoxData {
	href: string;
	ariaLabel: string;
	imgSrc: string | StaticImageData;
	altText: string;
	captionText: string;
	priority: boolean;
}

// Static link boxes data - moved outside component to prevent hydration issues
const linkBoxes: LinkBoxData[] = [
	{
		href: "/extra-income/freelance-jobs",
		ariaLabel: "Explore freelance opportunities",
		imgSrc: FreeLancerimg,
		altText: "Freelance job opportunities",
		captionText: "Freelance Opportunities",
		priority: true,
	},
	{
		href: "/extra-income/budget",
		ariaLabel: "Learn budgeting strategies",
		imgSrc: Budgettingimg,
		altText: "Budgeting and financial planning",
		captionText: "Budgeting",
		priority: false,
	},
	{
		href: "/extra-income/remote-online-jobs",
		ariaLabel: "Find remote job opportunities",
		imgSrc: RemoteJobimg,
		altText: "Remote jobs and online work",
		captionText: "Remote Jobs",
		priority: false,
	},
	{
		href: "/extra-income/money-making-apps",
		ariaLabel: "Earn money using apps",
		imgSrc: MoneyMakingAppsimg,
		altText: "Apps to earn money online",
		captionText: "Make Money On Apps",
		priority: false,
	},
];

const ExtraIncome: React.FC = () => {
	return (
		<>
			<Head>
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
							href={
								typeof link.imgSrc === "string" ? link.imgSrc : link.imgSrc.src
							}
							type='image/webp'
						/>
					))}

				{/* Structured Data */}
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
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
									url: "/images/website-logo.webp",
								},
							},
						}),
					}}
				/>
			</Head>

			<div className='page-container'>
				<h1>Explore Extra Income Opportunities</h1>

				{/* Category Links */}
				<div
					className='category-links-container'
					aria-label='Extra income categories'
				>
					{linkBoxes.map(
						(
							linkBox, // index removed as key is now linkBox.href
						) => (
							<Link
								className='link-box'
								key={linkBox.href} // Use a unique prop like href for key
								href={linkBox.href}
								aria-label={linkBox.ariaLabel}
							>
								<img
									src={
										typeof linkBox.imgSrc === "string"
											? linkBox.imgSrc
											: linkBox.imgSrc.src
									}
									alt={linkBox.altText}
									loading={linkBox.priority ? "eager" : "lazy"}
									width='220'
									height='220'
									{...(linkBox.priority ? { fetchpriority: "high" } : {})} // No warning
								/>
								<figcaption className='extraincome-figcaption'>
									{linkBox.captionText}
								</figcaption>
							</Link>
						),
					)}
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
							src='/images/Lyca-Mobile-728x90.webp'
							alt='Lyca Mobile Banner - Affordable International Calling'
							className='TopBannerImage'
							width='730px'
							height='90px'
							loading='eager' // Keep LCP image eager
						/>
					</a>
				</div>
			</div>
		</>
	);
};

export default ExtraIncome;
