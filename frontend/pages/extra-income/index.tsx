"use client";
import "./CommonStyles.css";
import "./ExtraIncome.css";
import Head from "next/head";
import type { StaticImageData } from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { useLangFromPath, usePageCanonical } from "@/hooks/usePageCanonical";
import { prefixLang } from "@/lib/i18n/prefixLang";
import { getListingPageTranslations } from "@/lib/i18n/listing-page-translations";
import Budgettingimg from "../../src/assets/images/icons/img-budgetting.webp";
import FreeLancerimg from "../../src/assets/images/icons/img-freelancer.webp";
import MoneyMakingAppsimg from "../../src/assets/images/icons/img-moneymakingapps.webp";
import RemoteJobimg from "../../src/assets/images/icons/img-remotejobs.webp";

interface LinkBoxData {
	href: string;
	ariaLabel: string;
	imgSrc: string | StaticImageData;
	altText: string;
	captionText: string;
	priority: boolean;
}

const ExtraIncome: React.FC = () => {
	const canonical = usePageCanonical();
	const lang = useLangFromPath();
	const copy = getListingPageTranslations(lang);

	const linkBoxes: LinkBoxData[] = [
		{
			href: "/extra-income/freelance-jobs",
			imgSrc: FreeLancerimg,
			priority: true,
			...copy.extraIncome.cards.freelanceJobs,
		},
		{
			href: "/extra-income/budget",
			imgSrc: Budgettingimg,
			priority: false,
			...copy.extraIncome.cards.budget,
		},
		{
			href: "/extra-income/remote-online-jobs",
			imgSrc: RemoteJobimg,
			priority: false,
			...copy.extraIncome.cards.remoteOnlineJobs,
		},
		{
			href: "/extra-income/money-making-apps",
			imgSrc: MoneyMakingAppsimg,
			priority: false,
			...copy.extraIncome.cards.moneyMakingApps,
		},
	];

	const webPageJsonLd = useMemo(
		() =>
			JSON.stringify({
				"@context": "https://schema.org",
				"@type": "WebPage",
				name: copy.extraIncome.title,
				url: canonical,
				description: copy.extraIncome.description,
				publisher: {
					"@type": "Organization",
					name: "Dollars & Life",
					logo: {
						"@type": "ImageObject",
						url: "https://www.dollarsandlife.com/images/website-logo.webp",
					},
				},
			}),
		[canonical, copy.extraIncome.description, copy.extraIncome.title],
	);

	return (
		<>
			<Head>
				<title>{copy.extraIncome.title}</title>
				<meta name='description' content={copy.extraIncome.description} />
				<link rel='canonical' href={canonical} />

				{linkBoxes
					.filter((link) => link.priority)
					.map((link, i) => (
						<link
							key={i}
							rel='preload'
							as='image'
							href={typeof link.imgSrc === "string" ? link.imgSrc : link.imgSrc.src}
							type='image/webp'
						/>
					))}

				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{ __html: webPageJsonLd }}
				/>
				<meta property='og:title' content={copy.extraIncome.ogTitle} />
				<meta property='og:description' content={copy.extraIncome.ogDescription} />
				<meta property='og:url' content={canonical} />
				<meta property='og:type' content='website' />
				<meta property='og:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:title' content={copy.extraIncome.ogTitle} />
				<meta name='twitter:description' content={copy.extraIncome.ogDescription} />
				<meta name='twitter:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
			</Head>

			<div className='page-container'>
				<div className='section-hero'>
					<p className='section-hero-eyebrow'>{copy.extraIncome.eyebrow}</p>
					<h1 className='section-hero-title'>
						{copy.extraIncome.headingLead}{" "}
						<span>{copy.extraIncome.headingAccent}</span> Hub
					</h1>
					<p className='section-hero-sub'>{copy.extraIncome.subtitle}</p>
				</div>

				<section className='page-intro' aria-label={copy.extraIncome.introAriaLabel}>
					<p>{copy.extraIncome.intro}</p>
				</section>

				<div
					className='category-links-container'
					aria-label={copy.extraIncome.categoryLinksAriaLabel}
				>
					{linkBoxes.map((linkBox) => (
						<Link
							className='link-box'
							key={linkBox.href}
							href={prefixLang(linkBox.href, lang)}
							aria-label={linkBox.ariaLabel}
						>
							<img
								src={typeof linkBox.imgSrc === "string" ? linkBox.imgSrc : linkBox.imgSrc.src}
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
					))}
				</div>

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
							loading='eager'
						/>
					</a>
				</div>
			</div>
		</>
	);
};

export default ExtraIncome;
