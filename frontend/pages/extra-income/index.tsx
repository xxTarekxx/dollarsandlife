"use client"; // Retained for useState, useEffect for dynamic posts and existing interactions
import "./CommonStyles.css";
import "./ExtraIncome.css";
import Head from "next/head";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { useLangFromPath, usePageCanonical } from "@/hooks/usePageCanonical";
import { prefixLang } from "@/lib/i18n/prefixLang";
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
	const canonical = usePageCanonical();
	const lang = useLangFromPath();
	const webPageJsonLd = useMemo(
		() =>
			JSON.stringify({
				"@context": "https://schema.org",
				"@type": "WebPage",
				name: "Extra Income Opportunities",
				url: canonical,
				description:
					"Explore various ways to earn extra income, including freelancing, remote jobs, budgeting, and money-making apps.",
				publisher: {
					"@type": "Organization",
					name: "Dollars & Life",
					logo: {
						"@type": "ImageObject",
						url: "https://www.dollarsandlife.com/images/website-logo.webp",
					},
				},
			}),
		[canonical],
	);

	return (
		<>
			<Head>
				<title>Extra Income Hub | Dollars &amp; Life</title>
				<meta
					name='description'
					content='Explore various ways to earn extra income, including freelancing, remote jobs, budgeting, and money-making apps.'
				/>
				<link rel='canonical' href={canonical} />

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
					dangerouslySetInnerHTML={{ __html: webPageJsonLd }}
				/>
						<meta property='og:title' content='Extra Income Hub | Dollars & Life' />
			<meta
				property='og:description'
				content='Explore various ways to earn extra income, including freelancing, remote jobs, budgeting, and money-making apps.'
			/>
			<meta property='og:url' content={canonical} />
			<meta property='og:type' content='website' />
			<meta property='og:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
			<meta name='twitter:card' content='summary_large_image' />
			<meta name='twitter:title' content='Extra Income Hub | Dollars & Life' />
			<meta
				name='twitter:description'
				content='Explore various ways to earn extra income, including freelancing, remote jobs, budgeting, and money-making apps.'
			/>
			<meta name='twitter:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
			</Head>

			<div className='page-container'>
				<div className='section-hero'>
					<p className='section-hero-eyebrow'>Extra Income</p>
					<h1 className='section-hero-title'>
						Extra <span>Income</span> Hub
					</h1>
					<p className='section-hero-sub'>
						Practical strategies to earn more money — on your own schedule, from anywhere.
					</p>
				</div>

				<section className='page-intro' aria-label='About Extra Income'>
					<p>
						Explore practical guides on freelancing, remote jobs, money-making apps, and smart budgeting — everything you need to earn more and keep more of what you make.
					</p>
				</section>

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
								href={prefixLang(linkBox.href, lang)}
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
									fetchPriority={linkBox.priority ? "high" : "auto"}
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
							width={728}
							height={90}
							loading='eager' // Keep LCP image eager
						/>
					</a>
				</div>
			</div>
		</>
	);
};

export default ExtraIncome;
