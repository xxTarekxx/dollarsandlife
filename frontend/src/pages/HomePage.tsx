import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import "./HomePage.css";
import MovieList from "./MovieList";

// Keep your existing image imports
import ShoppingDealsImg from "../assets/icons/img-dealsandsavings.webp";
import ExtraIncomeImg from "../assets/icons/img-extraincome.webp";
import StartAblogimg from "../assets/icons/img-startablog.webp";

interface CoreTopicData {
	to: string;
	ariaLabel: string;
	imgSrc: string;
	altText: string;
	title: string;
	description: string;
	priority: boolean;
	keywords: string; // Keep for meta or internal use, not necessarily display
}

interface FAQItem {
	question: string;
	answer: string; // Can include HTML for links
}

const HomePage: React.FC = () => {
	const coreTopics: CoreTopicData[] = [
		{
			to: "/extra-income", // This link implies the /extra-income page covers both
			ariaLabel:
				"Explore strategies to increase your earnings and how smart budgeting makes your extra income work harder.",
			imgSrc: ExtraIncomeImg, // Assume this image can broadly represent making & managing money
			altText:
				"Illustrations of income-generating activities and smart financial planning symbols.",
			title: "Earn More, Budget Smarter", // Keeping the original title, description will connect budgeting
			description:
				"Discover actionable guides for flexible side hustles and remote job opportunities. Learn to pair these earning strategies with practical budgeting techniques to effectively manage your income, ensuring every extra dollar contributes to your financial goals. We cover how to make more and manage it wisely.",
			priority: false,
			keywords:
				"increase earnings, practical side hustles, remote work for beginners, simple personal budgeting, managing new income streams, make extra money go further, financial planning for income growth",
		},
		{
			to: "/shopping-deals",
			ariaLabel:
				"Learn how to save money with the best online and in-store shopping deals",
			imgSrc: ShoppingDealsImg,
			altText:
				"Graphic of shopping cart and discount icons representing money-saving tips",
			title: "Shop Smarter, Save More",
			description:
				"Maximize your spending power with proven strategies to uncover discounts, use digital coupons effectively, and avoid overpaying online. Learn how to time your purchases and stack savings like a pro.",
			priority: false,
			keywords:
				"save money shopping, best online deals, grocery savings, coupon tips, discount tricks",
		},
		{
			to: "/start-a-blog",
			ariaLabel:
				"Explore step-by-step blogging guides to start and grow a profitable blog",
			imgSrc: StartAblogimg,
			altText:
				"Visual of a laptop showing a blog dashboard, representing blogging for income",
			title: "Launch Your Dream Blog",
			description:
				"Start a blog with purpose — from niche selection and WordPress setup to writing content that connects and monetizing through ads, affiliates, or products. Our blogging roadmap simplifies the entire process for beginners.",
			priority: true,
			keywords:
				"how to start a blog, beginner blogging guide, monetize a blog, niche blogging, blogging for profit",
		},
	];

	const faqs: FAQItem[] = [
		{
			question: "How can I start saving money if I live paycheck to paycheck?",
			answer:
				"It starts with understanding your spending. Track your expenses for a month, then identify non-essential areas where you can cut back, even small amounts. Creating a simple budget and setting realistic savings goals can make a big difference. Explore our <a href='/extra-income/budget'>beginner's guide to budgeting</a> for actionable steps.",
		},
		{
			question:
				"What are some legitimate ways to make extra money online for beginners?",
			answer:
				"There are many options! Freelancing (writing, graphic design, virtual assistance), online surveys, selling crafts on Etsy, or even starting a small niche blog are popular choices. Our <a href='/extra-income'>extra income section</a> has detailed guides on getting started with minimal investment.",
		},
		{
			question: "Is starting a blog still a good way to make money in 2024?",
			answer:
				"Absolutely! While the blogging landscape is competitive, there's always room for authentic voices and valuable content. Success depends on choosing the right niche, consistent effort, and smart monetization strategies. Check out our <a href='/start-a-blog'>guide to starting a blog</a> to see if it’s right for you.",
		},
		{
			question: "How can DollarsAndLife.com help me achieve financial freedom?",
			answer:
				"We provide practical, easy-to-understand guides, tools, and resources on core personal finance topics. Our goal is to empower you with the knowledge to manage your money effectively, increase your income, and make informed financial decisions on your journey to financial independence.",
		},
	];

	const ogImageContent = "https://www.dollarsandlife.com/og-image-homepage.jpg"; // Replace with your actual OG image URL
	const siteUrl = "https://www.dollarsandlife.com/"; // Ensure consistency with trailing slash
	const siteName = "DollarsAndLife.com";
	const shortSiteName = "Dollars & Life";
	const mainTitle = `${shortSiteName} | Master Your Money: Budgeting, Earning, Saving & Blogging`;
	const mainDescription = `Your ultimate guide to personal finance. Learn smart budgeting, how to earn extra income, savvy shopping deals, and starting a profitable blog with DollarsAndLife.com.`;

	return (
		<div className='homepage-container'>
			<Helmet>
				<title>{mainTitle}</title>
				<meta name='description' content={mainDescription} />
				<link rel='canonical' href={siteUrl} />

				{/* Open Graph / Facebook */}
				<meta property='og:type' content='website' />
				<meta property='og:url' content={siteUrl} />
				<meta
					property='og:title'
					content={`${shortSiteName} | Smart Personal Finance & Online Income Strategies`}
				/>
				<meta property='og:description' content={mainDescription} />
				<meta property='og:image' content={ogImageContent} />
				<meta property='og:site_name' content={siteName} />

				{/* Twitter */}
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:url' content={siteUrl} />
				<meta
					name='twitter:title'
					content={`${shortSiteName} | Actionable Finance Tips for a Better Life`}
				/>
				<meta name='twitter:description' content={mainDescription} />
				<meta name='twitter:image' content={ogImageContent} />

				{/* Preload priority images */}
				{coreTopics
					.filter((topic) => topic.priority)
					.map((topic, i) => (
						<link
							key={`preload-link-${i}`}
							rel='preload'
							as='image'
							href={topic.imgSrc}
							type='image/webp'
						/>
					))}

				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebSite",
						url: siteUrl,
						name: siteName,
						potentialAction: {
							"@type": "SearchAction",
							target: `${siteUrl}search?q={search_term_string}`,
							"query-input": "required name=search_term_string",
						},
						publisher: {
							"@type": "Organization",
							name: siteName,
							logo: {
								"@type": "ImageObject",
								url: "https://www.dollarsandlife.com/logo-512x512.png", // Replace with your actual logo URL
							},
						},
					})}
				</script>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						url: siteUrl,
						name: mainTitle,
						description: mainDescription,
						isPartOf: {
							"@type": "WebSite",
							url: siteUrl,
							name: siteName,
						},
					})}
				</script>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "FAQPage",
						mainEntity: faqs.map((faq) => ({
							"@type": "Question",
							name: faq.question,
							acceptedAnswer: {
								"@type": "Answer",
								text: faq.answer.replace(
									/<a href='(.*?)'>(.*?)<\/a>/g,
									"$2 (link to $1)",
								),
							},
						})),
					})}
				</script>
			</Helmet>

			{/* --- Hero Section --- */}
			<section className='hero-section' aria-labelledby='hero-title'>
				<div className='hero-content'>
					<h1 id='hero-title'>
						Master Your Money,{" "}
						<span className='highlight'>Unlock Your Life</span>.
					</h1>
					<p className='hero-subtitle'>
						Welcome to DollarsAndLife.com – your friendly hub for practical
						financial strategies for everyday people. Discover how to budget
						effectively, boost your earnings, shop smarter, and even launch your
						own successful blog.
					</p>
					{/* Using standard <a> tag for hash scrolling */}
					<a href='#core-topics-destination' className='cta-button hero-cta'>
						Explore All Guides
					</a>
				</div>
			</section>

			{/* --- Introduction to Core Topics --- */}
			<section
				className='core-topics-intro'
				aria-labelledby='core-topics-title'
			>
				<h2 id='core-topics-title'>
					Your Journey to Financial Wellness Starts Here
				</h2>
				<p className='section-subtitle'>
					Navigating personal finance can feel overwhelming, but it doesn't have
					to be. We break down complex topics into simple, actionable steps.
					Whether you want to earn more, save better, or build an online
					presence, we've got you covered.
				</p>
			</section>

			{/* --- Core Topic Links --- */}
			<section
				id='core-topics-destination' // This ID must match the href in the <a> tag above
				className='core-topics-grid'
				aria-label='Main financial categories'
			>
				{coreTopics.map((topic) => (
					<Link
						className='topic-card'
						key={topic.title}
						to={topic.to}
						aria-label={topic.ariaLabel}
					>
						<figure className='topic-card-figure'>
							<img
								src={topic.imgSrc}
								alt={topic.altText}
								width={200}
								height={200}
								loading={topic.priority ? "eager" : "lazy"}
								// THE ONLY CHANGE IS ADDING @ts-ignore on the line above fetchpriority
								// @ts-ignore
								fetchpriority={topic.priority ? "high" : "auto"}
							/>
						</figure>
						<div className='topic-card-content'>
							<h3 className='topic-card-title'>{topic.title}</h3>
							<p className='topic-card-description'>{topic.description}</p>
							<span className='topic-card-link'>Learn More →</span>
						</div>
					</Link>
				))}
			</section>

			{/* --- Why Trust DollarsAndLife.com (EEAT) --- */}
			{/* --- Why Trust DollarsAndLife.com (EEAT) --- */}
			<section className='why-trust-us' aria-labelledby='why-trust-title'>
				<div className='why-trust-content'>
					<h2 id='why-trust-title'>
						Why Trust <span className='highlight'>DollarsAndLife.com</span>?
					</h2>
					<p>
						We're committed to providing clear, reliable, and actionable
						personal finance advice. Founded by{" "}
						<strong>
							<a href='https://www.linkedin.com/in/tarek-ismael-96777578/'>
								Tarek I.
							</a>
						</strong>
						, a self-taught developer and personal finance writer based in
						Texas, passionate about making money management accessible to all,
						our content is built on thorough research, real-world experience,
						and a genuine desire to help you succeed.
					</p>
					<ul>
						<li>
							<strong>Expert Insights:</strong> Articles crafted by experienced
							money bloggers and digital entrepreneurs who’ve tested every
							strategy firsthand.
						</li>
						<li>
							<strong>Practical & Actionable:</strong> We focus on tips you can
							implement immediately.
						</li>
						<li>
							<strong>Beginner-Friendly:</strong> Complex topics explained
							simply, no jargon.
						</li>
						<li>
							<strong>Community Focused:</strong> Every guide is written with
							you in mind — no fluff, just practical advice that works in the
							real world.
						</li>
					</ul>
					<Link to='/about-us' className='cta-button-secondary'>
						Learn More About Us
					</Link>
				</div>
			</section>

			{/* --- What You'll Discover (Content Teasers) --- */}
			<section className='discover-section' aria-labelledby='discover-title'>
				<h2 id='discover-title'>
					What You'll <span className='highlight'>Discover Inside</span>
				</h2>
				<div className='discover-grid'>
					<div className='discover-item'>
						<h4>In-Depth Budgeting Guides</h4>
						<p>
							From creating your first budget to advanced saving strategies.
							Conquer debt and build wealth.
						</p>
						<Link to='/extra-income/budget' className='text-link'>
							Explore Budgeting →
						</Link>
					</div>
					<div className='discover-item'>
						<h4>Creative Income Boosters</h4>
						<p>
							Find legitimate side hustles, online job opportunities, and
							passive income ideas to grow your earnings.
						</p>
						<Link to='/extra-income' className='text-link'>
							Explore Extra Income →
						</Link>
					</div>
					<div className='discover-item'>
						<h4>Smart Shopping Secrets</h4>
						<p>
							Learn to find the best deals, use coupons wisely, and avoid
							marketing traps to save big.
						</p>
						<Link to='/shopping-deals' className='text-link'>
							Explore Shopping Deals →
						</Link>
					</div>
					<div className='discover-item'>
						<h4>Blogging for Success</h4>
						<p>
							Step-by-step tutorials on starting, growing, and monetizing a blog
							in any niche.
						</p>
						<Link to='/start-a-blog' className='text-link'>
							Explore Blogging Tips →
						</Link>
					</div>
				</div>
			</section>

			{/* --- FAQ Section --- */}
			<section className='faq-section' aria-labelledby='faq-title'>
				<h2 id='faq-title'>
					Frequently Asked <span className='highlight'>Questions</span>
				</h2>
				<div className='faq-list'>
					{faqs.map((faq, index) => (
						<details key={index} className='faq-item'>
							<summary className='faq-question'>{faq.question}</summary>
							<div
								className='faq-answer'
								dangerouslySetInnerHTML={{ __html: faq.answer }}
							/>
						</details>
					))}
				</div>
			</section>

			{/* --- Final Call to Action --- */}
			<section className='final-cta-section' aria-labelledby='final-cta-title'>
				<h2 id='final-cta-title'>Ready to Transform Your Finances?</h2>
				<p>
					Take the first step towards a brighter financial future. Explore our
					guides, tools, and resources today.
				</p>
				<a href='#core-topics-destination' className='cta-button'>
					Start Your Journey Now
				</a>
			</section>
			<MovieList />
		</div>
	);
};

export default HomePage;
