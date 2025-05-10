import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./HomePage.css";

import ShoppingDealsImg from "../assets/icons/img-dealsandsavings.webp";
import ExtraIncomeImg from "../assets/icons/img-extraincome.webp";
import StartAblogimg from "../assets/icons/img-startablog.webp";

interface LinkBoxData {
	to: string;
	ariaLabel: string;
	imgSrc: string;
	altText: string;
	captionText: string;
	width: number;
	height: number;
	priority: boolean;
	keywords: string;
}

const HomePage: React.FC = () => {
	const linkBoxes: LinkBoxData[] = [
		{
			to: "/extra-income",
			ariaLabel: "Learn how to earn extra income",
			imgSrc: ExtraIncomeImg,
			altText: "Boost your income with side hustles and remote jobs",
			captionText: "Boost Your Income",
			width: 220,
			height: 220,
			priority: false,
			keywords: "side hustle, remote jobs, passive income",
		},
		{
			to: "/shopping-deals",
			ariaLabel: "Explore shopping deals and save money",
			imgSrc: ShoppingDealsImg,
			altText: "Find the best online shopping deals and discounts",
			captionText: "Smart Shopping",
			width: 220,
			height: 220,
			priority: false,
			keywords: "discount deals, save money shopping, best deals",
		},
		{
			to: "/start-a-blog",
			ariaLabel: "Start your own blog and grow online",
			imgSrc: StartAblogimg,
			altText: "Learn how to start a blog and make money blogging",
			captionText: "Start Your Blog",
			width: 220,
			height: 220,
			priority: true,
			keywords: "start a blog, blogging tips, make money blogging",
		},
	];

	return (
		<div className='main-container'>
			<Helmet>
				<title>DollarsAndLife.com | Budget Smarter, Earn More, Live Free</title>
				<meta
					name='description'
					content='Explore expert tips on budgeting, earning extra income, smart shopping, and starting a profitable blog. Your guide to financial freedom.'
				/>
				<meta
					property='og:title'
					content='Dollars And Life | Personal Finance & Online Income'
				/>
				<meta
					property='og:description'
					content='Unlock practical financial strategies for saving, earning, and blogging. Join the DollarsAndLife.com community today.'
				/>
				<meta
					property='og:image'
					content='https://www.dollarsandlife.com/path-to-home-image.jpg'
				/>
				<meta property='og:url' content='https://www.dollarsandlife.com/' />
				<meta property='og:type' content='website' />
				<link rel='canonical' href='https://www.dollarsandlife.com' />

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

				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						mainEntityOfPage: "https://www.dollarsandlife.com/",
						name: "Dollars And Life | Personal Finance & Online Income",
						description:
							"Explore expert tips on budgeting, earning extra income, smart shopping, and starting a profitable blog. Your guide to financial freedom.",
						url: "https://www.dollarsandlife.com/",
						publisher: {
							"@type": "Organization",
							name: "Dollars And Life",
							logo: {
								"@type": "ImageObject",
								url: "https://www.dollarsandlife.com/favicon.webp",
							},
						},
						potentialAction: {
							"@type": "SearchAction",
							target:
								"https://www.dollarsandlife.com/search?q={search_term_string}",
							"query-input": "required name=search_term_string",
						},
					})}
				</script>
			</Helmet>

			<main className='intro-section'>
				<h1>Welcome to Dollars And Life</h1>
				<p className='intro-text'>
					Take control of your finances with step-by-step guides on budgeting,
					increasing your income, finding the best deals, and launching a
					successful blog. Whether you're just starting out or ready to scale
					your savings, we’re here to help.
				</p>
			</main>

			<section className='home-main-links' aria-label='Main categories'>
				{linkBoxes.map((linkBox, index) => (
					<Link
						className='home-links'
						key={index}
						to={linkBox.to}
						aria-label={linkBox.ariaLabel}
					>
						<figure>
							<img
								src={linkBox.imgSrc}
								alt={linkBox.altText}
								width={linkBox.width}
								height={linkBox.height}
								loading={linkBox.priority ? "eager" : "lazy"}
								{...(linkBox.priority ? { fetchpriority: "high" } : {})}
							/>
							<figcaption className='home-figcaption'>
								{linkBox.captionText}
							</figcaption>
						</figure>
						<p className='keywords-display'>{linkBox.keywords}</p>
					</Link>
				))}
			</section>
		</div>
	);
};

export default HomePage;
