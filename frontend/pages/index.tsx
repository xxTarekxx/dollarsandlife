"use client";
import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";

// Keep your existing image imports
import ShoppingDealsImg from "../src/assets/images/icons/img-dealsandsavings.webp";
import ExtraIncomeImg from "../src/assets/images/icons/img-extraincome.webp";
import StartAblogimg from "../src/assets/images/icons/img-startablog.webp";

interface CoreTopicData {
	href: string;
	ariaLabel: string;
	imgSrc: string;
	altText: string;
	title: string;
	description: string;
	priority: boolean;
	keywords: string;
}

interface FAQItem {
	question: string;
	answer: string; // Can include HTML for links
}

const HomePage: React.FC = () => {
	const [showContent, setShowContent] = useState(false);





	useEffect(() => {
		// Only run on client side
		if (typeof window === 'undefined') return;

		// Show content immediately
		setShowContent(true);

		// Show footer
		const footer = document.querySelector('footer');
		if (footer) {
			footer.style.display = 'block';
		}
	}, []);

	// Cleanup effect for component unmount
	useEffect(() => {
		// Only run on client side
		if (typeof window === 'undefined') return;

		return () => {
			const footer = document.querySelector('footer');
			if (footer) {
				footer.style.display = 'block';
			}
		};
	}, []);

	// --- Page Specific Configuration ---
	const siteUrl = "https://www.dollarsandlife.com/"; // Ensure trailing slash
	const siteName = "DollarsAndLife.com";
	const shortSiteName = "Dollars & Life";
	const mainTitle = `${shortSiteName} | Master Your Money: Budgeting, Earning, Saving & Blogging`;
	const mainDescription = `Your ultimate guide to personal finance. Learn smart budgeting, how to earn extra income, savvy shopping deals, and starting a profitable blog with DollarsAndLife.com. Take control of your financial future today.`;
	const ogImageContent = `${siteUrl}og-image-homepage.jpg`; // Use absolute URL
	const logoUrl = `${siteUrl}logo-512x512.png`; // Use absolute URL
	const founderLinkedInUrl =
		"https://www.linkedin.com/in/tarek-ismael-96777578/";
	const founderName = "Tarek I.";

	// --- Content Definitions ---
	const coreTopics: CoreTopicData[] = [
		{
			href: "/extra-income",
			ariaLabel:
				"Explore strategies to increase your earnings and smart budgeting.",
			imgSrc: ExtraIncomeImg.src,
			altText:
				"Illustrations of income-generating activities and financial planning symbols.",
			title: "Earn More, Budget Smarter",
			description:
				"Discover actionable guides for flexible side hustles and remote job opportunities. Pair these with practical budgeting techniques to manage your income effectively and make every dollar count towards your financial goals.",
			priority: false, // Set true for one key LCP image if applicable
			keywords:
				"increase earnings, side hustles, remote work, personal budgeting, managing income, financial planning",
		},
		{
			href: "/shopping-deals",
			ariaLabel: "Learn how to save money with the best shopping deals.",
			imgSrc: ShoppingDealsImg.src,
			altText:
				"Graphic of shopping cart and discount icons representing money-saving tips.",
			title: "Shop Smarter, Save More",
			description:
				"Maximize your spending power with proven strategies to uncover discounts, use digital coupons effectively, and avoid overpaying. Learn to time purchases and stack savings like a pro.",
			priority: false,
			keywords:
				"save money shopping, online deals, grocery savings, coupon tips, discount tricks",
		},
		{
			href: "/start-a-blog",
			ariaLabel:
				"Explore step-by-step guides to start and grow a profitable blog.",
			imgSrc: StartAblogimg.src,
			altText:
				"Visual of a laptop showing a blog dashboard, representing blogging for income.",
			title: "Launch Your Dream Blog",
			description:
				"Start a blog with purpose—from niche selection and WordPress setup to writing content that connects and monetizing effectively. Our roadmap simplifies the entire process for aspiring bloggers.",
			priority: true, // Assuming this is a key visual
			keywords:
				"start a blog, blogging guide, monetize blog, niche blogging, blogging for profit",
		},
	];

	const faqs: FAQItem[] = [
		{
			question: "How can I start saving money if I live paycheck to paycheck?",
			answer:
				"Start by tracking your expenses to understand your spending. Then, identify non-essential areas for cutbacks, even small ones. Creating a simple budget and setting realistic goals is key. Explore our <a href='/extra-income/budget' title='Beginner budgeting guide'>beginner's guide to budgeting</a> for actionable steps.",
		},
		{
			question:
				"What are legitimate ways to make extra money online for beginners?",
			answer:
				"Many options exist! Freelancing (writing, design, virtual assistance), online surveys, selling crafts, or starting a niche blog are popular. Our <a href='/extra-income' title='Extra income strategies'>extra income section</a> has detailed guides for getting started with minimal investment.",
		},
		{
			question: "Is starting a blog still a good way to make money in 2024?",
			answer:
				"Absolutely! While competitive, there's always room for authentic voices and valuable content. Success hinges on choosing the right niche, consistent effort, and smart monetization. Check out our <a href='/start-a-blog' title='Guide to starting a blog'>guide to starting a blog</a> to see if it's right for you.",
		},
		{
			question: "How can DollarsAndLife.com help me achieve financial freedom?",
			answer:
				"We provide practical, easy-to-understand guides and resources on core personal finance topics. Our goal is to empower you with the knowledge to manage money effectively, increase income, and make informed decisions on your journey to financial independence.",
		},
	];

	// --- Structured Data (Schema.org) ---
	const websiteSchema = {
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
				url: logoUrl,
				width: 512, // Optional, but good
				height: 512, // Optional, but good
			},
			founder: {
				"@type": "Person",
				name: founderName,
				url: founderLinkedInUrl,
				// "sameAs": [ // Optional: other profiles like Twitter if available
				//  "https://twitter.com/yourfounderprofile"
				// ]
			},
		},
	};

	const webpageSchema = {
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
		// If Tarek is considered the primary author of the homepage content
		// author: {
		//   "@type": "Person",
		//   name: founderName,
		//   url: founderLinkedInUrl
		// },
		primaryImageOfPage: {
			// Good for Google Discover
			"@type": "ImageObject",
			url: ogImageContent,
		},
	};

	const faqSchema = {
		"@context": "https://schema.org",
		"@type": "FAQPage",
		mainEntity: faqs.map((faq) => ({
			"@type": "Question",
			name: faq.question,
			acceptedAnswer: {
				"@type": "Answer",
				text: faq.answer.replace(
					/<a href='(.*?)'.*?>(.*?)<\/a>/g,
					"$2 (link to $1)",
				), // Simpler regex for plain text
			},
		})),
	};

	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "Home",
				item: siteUrl,
			},
		],
	};

	/*
		Regarding content quantity for the homepage:
		Google values clarity, user experience, and effective guidance to key content over sheer word count.
		This homepage aims to clearly define the site's purpose, establish trust (E-E-A-T),
		and direct users to comprehensive pillar pages and articles.
		The current content volume is focused and strategic for these goals.
		Depth of information should reside in the linked internal pages.
	*/



	// Always render the main container structure for consistent hydration
	return (
		<div className='homepage-container animate-in'>
			<Head>
				<title>{mainTitle}</title>
				<meta name='description' content={mainDescription} />
				<link rel='canonical' href={siteUrl} />
				<meta
					name='keywords'
					content='personal finance, budgeting, earn extra income, shopping deals, start a blog, financial freedom, money management, Tarek I'
				/>
				<meta property='og:locale' content='en_US' />
				{/* Google Fonts - Moved from CSS for better performance */}
				<link rel='preconnect' href='https://fonts.googleapis.com' />
				<link
					rel='preconnect'
					href='https://fonts.gstatic.com'
					crossOrigin='anonymous'
				/>
				{/* Open Graph / Facebook */}
				<meta property='og:type' content='website' />
				<meta property='og:url' content={siteUrl} />
				<meta
					property='og:title'
					content={`${shortSiteName} | Smart Personal Finance & Online Income`}
				/>
				<meta property='og:description' content={mainDescription} />
				<meta property='og:image' content={ogImageContent} />
				<meta property='og:image:width' content='1200' />
				<meta property='og:image:height' content='630' />
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
						/>
					))}
				{/* Structured Data Scripts */}
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(websiteSchema),
					}}
				/>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(webpageSchema),
					}}
				/>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(faqSchema),
					}}
				/>
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(breadcrumbSchema),
					}}
				/>
			</Head>

			{/* Show content only when loading is complete */}
			{showContent && (
				<>
					{/* --- Hero Section --- */}
					<section className='hero-section animate-section' aria-labelledby='hero-title'>
						<div className='hero-content'>
							<h1 id='hero-title'>
								Master Your Money,{" "}
								<span className='highlight'>Unlock Your Life</span>.
							</h1>
							<p className='hero-subtitle'>
								Welcome to {siteName} – your friendly hub for practical financial
								strategies designed for everyday people. Discover how to budget
								effectively, boost your earnings, shop smarter, and even launch your
								own successful blog.
							</p>
							<a href='#core-topics-destination' className='cta-button hero-cta'>
								Explore Key Guides
							</a>
						</div>
					</section>

					{/* --- Introduction to Core Topics --- */}
					<section
						className='core-topics-intro animate-section'
						aria-labelledby='core-topics-main-title'
					>
						<h2 id='core-topics-main-title' className='section-title'>
							Your Journey to Financial Wellness Starts{" "}
							<span className='highlight'>Here</span>
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
						id='core-topics-destination'
						className='core-topics-grid animate-section'
						aria-label='Main financial categories'
					>
						{coreTopics.map((topic, index) => (
							<Link
								className={`topic-card animate-card`}
								key={topic.title}
								href={topic.href}
								aria-label={topic.ariaLabel}
								title={`Learn more about ${topic.title}`}
								style={{ animationDelay: `${index * 0.1}s` }}
							>
								<figure className='topic-card-figure'>
									<img
										src={topic.imgSrc}
										alt={topic.altText}
										width={200}
										height={200}
										loading={topic.priority ? "eager" : "lazy"}
										// @ts-expect-error - fetchpriority is a newer attribute
										fetchpriority={topic.priority ? "high" : "auto"}
										decoding='async'
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
					<section
						className='community-forum-section animate-section'
						aria-labelledby='community-forum-title-id'
					>
						<h2 id='community-forum-title-id' className='section-title'>
							Got Questions? <span className='highlight'>Join Our Community!</span>
						</h2>
						<p className='section-subtitle'>
							Our active forum is the perfect place to ask your specific personal
							finance questions, share experiences, and learn from fellow members.
							Get answers, offer advice, and connect with like-minded individuals on
							their financial journey.
						</p>
						<Link
							href='/forum'
							className='cta-button'
							title='Visit the DollarsAndLife Community Forum'
						>
							Visit the Forum & Ask
						</Link>
					</section>

					{/* --- Why Trust DollarsAndLife.com (EEAT) --- */}
					<section className='why-trust-us animate-section' aria-labelledby='why-trust-title-id'>
						<div className='why-trust-content'>
							<h2 id='why-trust-title-id' className='section-title'>
								Why Trust <span className='highlight'>{shortSiteName}</span>?
							</h2>
							<p>
								We're committed to providing clear, reliable, and actionable
								personal finance advice. Founded by{" "}
								<strong>
									<a
										href={founderLinkedInUrl}
										target='_blank'
										rel='noopener noreferrer author'
										title={`Connect with ${founderName} on LinkedIn`}
									>
										{founderName}
									</a>
								</strong>
								, a self-taught developer and personal finance writer based in Texas
								with years of hands-on experience in digital entrepreneurship and a
								personal journey of mastering these financial principles.{" "}
								{shortSiteName} is passionate about making money management
								accessible to all. Our content is built on thorough research,
								real-world application, and a genuine desire to help you succeed.
							</p>
							<ul>
								<li>
									<strong>Expert Insights:</strong> Articles crafted from tested
									strategies and real-world experience in money management and
									online business.
								</li>
								<li>
									<strong>Practical & Actionable:</strong> We focus on tips you can
									implement immediately for tangible results.
								</li>
								<li>
									<strong>Beginner-Friendly:</strong> Complex topics explained
									simply, no jargon, just clear guidance.
								</li>
								<li>
									<strong>Community Focused:</strong> Every guide is written with
									your real-world challenges and goals in mind.
								</li>
							</ul>
							<Link
								href='/about-us'
								className='cta-button-secondary'
								title='Learn more about our mission and team'
							>
								Learn More About Us
							</Link>
						</div>
					</section>

					{/* --- What You'll Discover (Content Teasers) --- */}
					<section className='discover-section animate-section' aria-labelledby='discover-title-id'>
						<h2 id='discover-title-id' className='section-title'>
							What You'll <span className='highlight'>Discover Inside</span>
						</h2>
						<div className='discover-grid'>
							<div className='discover-item animate-item' style={{ animationDelay: '0.05s' }}>
								<h4>In-Depth Budgeting Guides</h4>
								<p>
									From creating your first budget to advanced saving strategies.
									Conquer debt and build lasting wealth.
								</p>
								<Link
									href='/extra-income/budget'
									className='text-link'
									title='Explore budgeting guides'
								>
									Explore Budgeting →
								</Link>
							</div>
							<div className='discover-item animate-item' style={{ animationDelay: '0.1s' }}>
								<h4>Creative Income Boosters</h4>
								<p>
									Find legitimate side hustles, online job opportunities, and
									passive income ideas to grow your earnings.
								</p>
								<Link
									href='/extra-income'
									className='text-link'
									title='Explore extra income opportunities'
								>
									Explore Extra Income →
								</Link>
							</div>
							<div className='discover-item animate-item' style={{ animationDelay: '0.15s' }}>
								<h4>Smart Shopping Secrets</h4>
								<p>
									Learn to find the best deals, use coupons wisely, and avoid
									marketing traps to save big on every purchase.
								</p>
								<Link
									href='/shopping-deals'
									className='text-link'
									title='Explore shopping deals and tips'
								>
									Explore Shopping Deals →
								</Link>
							</div>
							<div className='discover-item animate-item' style={{ animationDelay: '0.2s' }}>
								<h4>Blogging for Success</h4>
								<p>
									Step-by-step tutorials on starting, growing, and monetizing a blog
									effectively in any niche.
								</p>
								<Link
									href='/start-a-blog'
									className='text-link'
									title='Explore blogging guides and tutorials'
								>
									Explore Blogging Tips →
								</Link>
							</div>
						</div>
					</section>

					{/* --- FAQ Section --- */}
					<section className='faq-section animate-section' aria-labelledby='faq-title-id'>
						<h2 id='faq-title-id' className='section-title'>
							Frequently Asked <span className='highlight'>Questions</span>
						</h2>
						<div className='faq-list'>
							{faqs.map((faq, index) => (
								<details key={index} className='faq-item animate-item' name='faq-item' style={{ animationDelay: `${index * 0.05}s` }}>
									{" "}
									{/* Added name for potential analytics */}
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
					<section
						className='final-cta-section animate-section'
						aria-labelledby='final-cta-title-id'
					>
						<h2 id='final-cta-title-id' className='section-title'>
							Ready to Transform Your Finances?
						</h2>
						<p>
							Take the first step towards a brighter financial future. Explore our
							guides, tools, and resources today, and start building the life you
							deserve.
						</p>
						<a href='#core-topics-destination' className='cta-button'>
							Start Your Journey Now
						</a>
					</section>
				</>
			)}
		</div>
	);


};

export default HomePage;
