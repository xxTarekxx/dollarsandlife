"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { prefixLang } from "@/lib/i18n/prefixLang";

import ShoppingDealsImg from "../../src/assets/images/icons/img-dealsandsavings.webp";
import ExtraIncomeImg from "../../src/assets/images/icons/img-extraincome.webp";
import StartAblogimg from "../../src/assets/images/icons/img-startablog.webp";

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
	answer: string;
}

export default function HomePageClient() {
	const params = useParams();
	const lang = (params?.lang as string) ?? "en";
	const [showContent, setShowContent] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined") return;
		setShowContent(true);
		const footer = document.querySelector("footer");
		if (footer) footer.style.display = "block";
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		return () => {
			const footer = document.querySelector("footer");
			if (footer) footer.style.display = "block";
		};
	}, []);

	const coreTopics: CoreTopicData[] = [
		{ href: prefixLang("/extra-income", lang), ariaLabel: "Explore strategies to increase your earnings and smart budgeting.", imgSrc: ExtraIncomeImg.src, altText: "Illustrations of income-generating activities and financial planning symbols.", title: "Earn More, Budget Smarter", description: "Discover actionable guides for flexible side hustles and remote job opportunities. Pair these with practical budgeting techniques to manage your income effectively and make every dollar count towards your financial goals.", priority: false, keywords: "increase earnings, side hustles, remote work, personal budgeting, managing income, financial planning" },
		{ href: prefixLang("/shopping-deals", lang), ariaLabel: "Learn how to save money with the best shopping deals.", imgSrc: ShoppingDealsImg.src, altText: "Graphic of shopping cart and discount icons representing money-saving tips.", title: "Shop Smarter, Save More", description: "Maximize your spending power with proven strategies to uncover discounts, use digital coupons effectively, and avoid overpaying. Learn to time purchases and stack savings like a pro.", priority: false, keywords: "save money shopping, online deals, grocery savings, coupon tips, discount tricks" },
		{ href: prefixLang("/start-a-blog", lang), ariaLabel: "Explore step-by-step guides to start and grow a profitable blog.", imgSrc: StartAblogimg.src, altText: "Visual of a laptop showing a blog dashboard, representing blogging for income.", title: "Launch Your Dream Blog", description: "Start a blog with purpose—from niche selection and WordPress setup to writing content that connects and monetizing effectively. Our roadmap simplifies the entire process for aspiring bloggers.", priority: true, keywords: "start a blog, blogging guide, monetize blog, niche blogging, blogging for profit" },
	];

	const faqs: FAQItem[] = [
		{ question: "How can I start saving money if I live paycheck to paycheck?", answer: `Start by tracking your expenses to understand your spending. Then, identify non-essential areas for cutbacks, even small ones. Creating a simple budget and setting realistic goals is key. Explore our <a href='${prefixLang("/extra-income/budget", lang)}' title='Beginner budgeting guide'>beginner's guide to budgeting</a> for actionable steps.` },
		{ question: "What are legitimate ways to make extra money online for beginners?", answer: `Many options exist! Freelancing (writing, design, virtual assistance), online surveys, selling crafts, or starting a niche blog are popular. Our <a href='${prefixLang("/extra-income", lang)}' title='Extra income strategies'>extra income section</a> has detailed guides for getting started with minimal investment.` },
		{ question: "Is starting a blog still a good way to make money in 2024?", answer: `Absolutely! While competitive, there's always room for authentic voices and valuable content. Success hinges on choosing the right niche, consistent effort, and smart monetization. Check out our <a href='${prefixLang("/start-a-blog", lang)}' title='Guide to starting a blog'>guide to starting a blog</a> to see if it's right for you.` },
		{ question: "How can DollarsAndLife.com help you achieve financial freedom?", answer: "We provide practical, easy-to-understand guides and resources on core personal finance topics. Our goal is to empower you with the knowledge to manage money effectively, increase income, and make informed decisions on your journey to financial independence." },
	];

	const siteName = "DollarsAndLife.com";
	const shortSiteName = "Dollars & Life";

	return (
		<div className="homepage-container animate-in">
			{showContent && (
				<>
					<section className="hero-section animate-section" aria-labelledby="hero-title">
						<div className="hero-content">
							<h1 id="hero-title">Master Your Money, <span className="highlight">Unlock Your Life</span>.</h1>
							<p className="hero-subtitle">Welcome to {siteName} – your friendly hub for practical financial strategies designed for everyday people. Discover how to budget effectively, boost your earnings, shop smarter, and even launch your own successful blog.</p>
							<a href="#core-topics-destination" className="cta-button hero-cta">Explore Key Guides</a>
						</div>
					</section>
					<section className="core-topics-intro animate-section" aria-labelledby="core-topics-main-title">
						<h2 id="core-topics-main-title" className="section-title">Your Journey to Financial Wellness Starts <span className="highlight">Here</span></h2>
						<p className="section-subtitle">Navigating personal finance can feel overwhelming, but it doesn't have to be. We break down complex topics into simple, actionable steps.</p>
					</section>
					<section id="core-topics-destination" className="core-topics-grid animate-section" aria-label="Main financial categories">
						{coreTopics.map((topic, index) => (
							<Link key={topic.title} className="topic-card animate-card" href={topic.href} aria-label={topic.ariaLabel} title={`Learn more about ${topic.title}`} style={{ animationDelay: `${index * 0.1}s` }}>
								<figure className="topic-card-figure">
									<img src={topic.imgSrc} alt={topic.altText} width={200} height={200} loading={topic.priority ? "eager" : "lazy"} fetchPriority={topic.priority ? "high" : "auto"} decoding="async" />
								</figure>
								<div className="topic-card-content">
									<h3 className="topic-card-title">{topic.title}</h3>
									<p className="topic-card-description">{topic.description}</p>
									<span className="topic-card-link">Learn More →</span>
								</div>
							</Link>
						))}
					</section>
					<section className="community-forum-section animate-section" aria-labelledby="community-forum-title-id">
						<h2 id="community-forum-title-id" className="section-title">Got Questions? <span className="highlight">Join Our Community!</span></h2>
						<p className="section-subtitle">Our active forum is the perfect place to ask your specific personal finance questions, share experiences, and learn from fellow members.</p>
						<Link href={prefixLang("/forum", lang)} className="cta-button" title="Visit the DollarsAndLife Community Forum">Visit the Forum & Ask</Link>
					</section>
					<section className="why-trust-us animate-section" aria-labelledby="why-trust-title-id">
						<div className="why-trust-content">
							<h2 id="why-trust-title-id" className="section-title">Why Trust <span className="highlight">{shortSiteName}</span>?</h2>
							<p>We're committed to providing clear, reliable, and actionable personal finance advice. Founded by <strong><a href="https://www.linkedin.com/in/tarek-ismail-96777578/" target="_blank" rel="noopener noreferrer author">Tarek I.</a></strong>, a self-taught developer and personal finance writer based in Texas with years of hands-on experience.</p>
							<Link href={prefixLang("/about-us", lang)} className="cta-button-secondary" title="Learn more about our mission and team">Learn More About Us</Link>
						</div>
					</section>
					<section className="discover-section animate-section" aria-labelledby="discover-title-id">
						<h2 id="discover-title-id" className="section-title">What You'll <span className="highlight">Discover Inside</span></h2>
						<div className="discover-grid">
							<div className="discover-item animate-item" style={{ animationDelay: "0.05s" }}>
								<h4>In-Depth Budgeting Guides</h4>
								<p>From creating your first budget to advanced saving strategies.</p>
								<Link href={prefixLang("/extra-income/budget", lang)} className="text-link" title="Explore budgeting guides">Explore Budgeting →</Link>
							</div>
							<div className="discover-item animate-item" style={{ animationDelay: "0.1s" }}>
								<h4>Creative Income Boosters</h4>
								<p>Find legitimate side hustles, online job opportunities, and passive income ideas.</p>
								<Link href={prefixLang("/extra-income", lang)} className="text-link" title="Explore extra income opportunities">Explore Extra Income →</Link>
							</div>
							<div className="discover-item animate-item" style={{ animationDelay: "0.15s" }}>
								<h4>Smart Shopping Secrets</h4>
								<p>Learn to find the best deals, use coupons wisely, and avoid marketing traps.</p>
								<Link href={prefixLang("/shopping-deals", lang)} className="text-link" title="Explore shopping deals and tips">Explore Shopping Deals →</Link>
							</div>
							<div className="discover-item animate-item" style={{ animationDelay: "0.2s" }}>
								<h4>Blogging for Success</h4>
								<p>Step-by-step tutorials on starting, growing, and monetizing a blog effectively.</p>
								<Link href={prefixLang("/start-a-blog", lang)} className="text-link" title="Explore blogging guides and tutorials">Explore Blogging Tips →</Link>
							</div>
						</div>
					</section>
					<section className="faq-section animate-section" aria-labelledby="faq-title-id">
						<h2 id="faq-title-id" className="section-title">Frequently Asked <span className="highlight">Questions</span></h2>
						<div className="faq-list">
							{faqs.map((faq, index) => (
								<details key={index} className="faq-item animate-item" name="faq-item" style={{ animationDelay: `${index * 0.05}s` }}>
									<summary className="faq-question">{faq.question}</summary>
									<div className="faq-answer" dangerouslySetInnerHTML={{ __html: faq.answer }} />
								</details>
							))}
						</div>
					</section>
					<section className="final-cta-section animate-section" aria-labelledby="final-cta-title-id">
						<h2 id="final-cta-title-id" className="section-title">Ready to Transform Your Finances?</h2>
						<p>Take the first step towards a brighter financial future. Explore our guides, tools, and resources today.</p>
						<a href="#core-topics-destination" className="cta-button">Start Your Journey Now</a>
					</section>
				</>
			)}
		</div>
	);
}
