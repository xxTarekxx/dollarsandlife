import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async"; // Correct way to modify <head>
import useCompressedImage from "../../../components/compressed/useCompressedImage";
import Budgettingimg from "/images/icons/img-budgetting.webp";
import FreeLancerimg from "/images/icons/img-freelancer.webp";
import RemoteJobimg from "/images/icons/img-remotejobs.webp";
import MoneyMakingAppsimg from "/images/icons/img-moneymakingapps.webp";
import "./ExtraIncome.css";

const ExtraIncome: React.FC = () => {
	useEffect(() => {
		document.title = "Extra Income Opportunities | Earn More Money";
	}, []);

	const compressedFreeLancerimg = useCompressedImage(FreeLancerimg);
	const compressedRemoteJobimg = useCompressedImage(RemoteJobimg);
	const compressedMoneyMakingAppsimg = useCompressedImage(MoneyMakingAppsimg);
	const compressedBudgettingimg = useCompressedImage(Budgettingimg);

	const linkBoxes = [
		{
			to: "/extra-income/Freelancers",
			ariaLabel: "Explore freelance opportunities",
			imgSrc: compressedFreeLancerimg || FreeLancerimg,
			altText: "Freelance job opportunities",
			captionText: "Freelance Opportunities",
			priority: true,
		},
		{
			to: "/extra-income/Budget",
			ariaLabel: "Learn budgeting strategies",
			imgSrc: compressedBudgettingimg || Budgettingimg,
			altText: "Budgeting and financial planning",
			captionText: "Budgeting",
			priority: false,
		},
		{
			to: "/extra-income/Remote-Jobs",
			ariaLabel: "Find remote job opportunities",
			imgSrc: compressedRemoteJobimg || RemoteJobimg,
			altText: "Remote jobs and online work",
			captionText: "Remote Jobs",
			priority: false,
		},
		{
			to: "/extra-income/money-making-apps",
			ariaLabel: "Earn money using apps",
			imgSrc: compressedMoneyMakingAppsimg || MoneyMakingAppsimg,
			altText: "Apps to earn money online",
			captionText: "Make Money On Apps",
			priority: false,
		},
	];

	return (
		<>
			{/* Correct SEO Metadata Using Helmet */}
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

			{/* Main Content */}
			<div>
				<h1>Explore Extra Income Opportunities</h1>

				{/* Preload critical LCP image */}
				<link
					rel='preload'
					as='image'
					href={compressedFreeLancerimg || FreeLancerimg}
				/>

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
								srcSet={`${linkBox.imgSrc} 1x, ${linkBox.imgSrc.replace(
									".webp",
									"@2x.webp",
								)} 2x`}
								loading={linkBox.priority ? "eager" : "lazy"}
								width='220'
								height='220'
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
