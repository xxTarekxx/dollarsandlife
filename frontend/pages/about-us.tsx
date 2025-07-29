// about-us.tsx

"use client";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import styles from "./about-us.module.css";

// Importing logos from /assets
import expressLogo from "../src/assets/images/expressjs.webp";
import firebaseLogo from "../src/assets/images/firebaselogo.png";
import mongoLogo from "../src/assets/images/mongodb.webp";
import nextjsLogo from "../src/assets/images/nextjs-logo.svg";
import nodeLogo from "../src/assets/images/nodejslogo.webp";
import profileImage from "../src/assets/images/profile-image.webp";
import reactLogo from "../src/assets/images/reactlogo.webp";

const AboutUs: React.FC = () => {
	return (
		<div className={styles.pageWrapper}>
			<Head>
				<title>The Build | About Dollars & Life</title>
				<meta
					name='description'
					content='The story behind Dollars & Life: A custom-built platform by developer Tarek I. to decode personal finance through technology and real-world experience.'
				/>
				<link rel='canonical' href='https://www.dollarsandlife.com/about-us' />
				<meta property='og:title' content='The Build | About Dollars & Life' />
				<meta
					property='og:description'
					content='Learn how a developer obsession with real-world financial problems led to a custom-built platform for everyone.'
				/>
				<meta property='og:type' content='website' />
				<meta property='og:url' content='https://www.dollarsandlife.com/about-us' />
			</Head>

			<header className={styles.hero}>
				<h1 className={styles.heroTitle}>
					An Operating System <br /> for Your <span className={styles.highlight}>Financial Life</span>
				</h1>
				<p className={styles.heroSubtitle}>
					Built from scratch by a developer frustrated with generic advice. This is the story of how code is being used to solve real financial problems.
				</p>
			</header>

			<div className={styles.container}>
				<div className={styles.mainGrid}>
					{/* --- Main Narrative Column --- */}
					<main className={styles.narrativeColumn}>
						<div className={styles.timeline}>
							<div className={styles.timelineItem}>
								<h3>The Problem</h3>
								<span className={styles.meta}>Phase 1: The Frustration</span>
								<p>
									The world of personal finance is full of noise: abstract theories, get-rich-quick schemes, and tools that don't fit real life. I was tired of it. As a developer, I knew there had to be a better way—a system based on data, logic, and practical application.
								</p>
							</div>

							<div className={styles.timelineItem}>
								<h3>The Build</h3>
								<span className={styles.meta}>Phase 2: The Development</span>
								<p>
									For two years, I coded, tested, and iterated on financial tools and strategies. This wasn't a side project; it was a mission to create a platform from the ground up that was fast, secure, and genuinely useful. Every line of code was written to solve a problem I had personally faced.
								</p>
							</div>

							<div className={styles.timelineItem}>
								<h3>The Philosophy</h3>
								<span className={styles.meta}>Phase 3: The Principles</span>
								<p>
									Through this process, a core philosophy emerged: financial empowerment comes from ownership. That means providing transparent, experience-driven advice and building open, powerful tools. No fluff, no gatekeeping—just a commitment to helping people architect their own financial systems.
								</p>
							</div>

							<div className={styles.timelineItem}>
								<h3>The Launch</h3>
								<span className={styles.meta}>Phase 4: The Platform</span>
								<p>
									Dollars & Life is the result. It's more than a blog; it's a constantly evolving platform where finance and technology intersect. It's for anyone who believes that with the right tools and knowledge, they can build a better financial future.
								</p>
							</div>
						</div>
					</main>

					{/* --- Sticky Sidebar Column --- */}
					<aside className={styles.sidebarColumn}>
						<div className={styles.sidebarCard}>
							<div className={styles.founderProfile}>
								<Image
									src={profileImage}
									alt='Tarek I. - Founder of Dollars & Life'
									className={styles.founderImage}
								/>
								<h4 className={styles.founderName}>Tarek I.</h4>
								<p className={styles.founderRole}>Founder & Full-Stack Developer</p>
								{/* --- LINK ADDED HERE --- */}
								<a
									href='https://www.linkedin.com/in/tarek-ismail-96777578/'
									target='_blank'
									rel='noopener noreferrer'
									className={styles.socialLink}
								>
									Connect on LinkedIn
								</a>
							</div>
						</div>

						<div className={styles.sidebarCard}>
							<h4>Core Principles</h4>
							<ul>
								<li><strong>Real Experience:</strong> No theoretical advice.</li>
								<li><strong>Tech-Driven:</strong> Custom tools, not templates.</li>
								<li><strong>Total Transparency:</strong> From finances to code.</li>
								<li><strong>Community-Focused:</strong> Grow together.</li>
							</ul>
						</div>
					</aside>
				</div>

				{/* --- Tech Stack Section --- */}
				<section className={styles.techSection}>
					<h2 className={styles.techTitle}>The Tech Behind The Talk</h2>
					<div className={styles.techGrid}>
						<div className={styles.techCard}>
							<Image src={nextjsLogo} alt='Next.js Logo' />
							{/* Span restored for proper display */}
							<span>Next.js</span>
						</div>
						<div className={styles.techCard}>
							<Image src={reactLogo} alt='React Logo' />
							<span>React</span>
						</div>
						<div className={styles.techCard}>
							<Image src={nodeLogo} alt='Node.js Logo' />
							<span>Node.js</span>
						</div>
					</div>
					<div className={styles.techGrid}>
						<div className={styles.techCard}>
							<Image src={mongoLogo} alt='MongoDB Logo' />
							<span>MongoDB</span>
						</div>
						<div className={styles.techCard}>
							<Image src={firebaseLogo} alt='Firebase Logo' />
							<span>Firebase</span>
						</div>
						<div className={styles.techCard}>
							<Image src={expressLogo} alt='Express.js Logo' />
							<span>Express.js</span>
						</div>
					</div>
				</section>
			</div>

			<section className={styles.ctaSection}>
				<h2 className={styles.ctaTitle}>Join the Build</h2>
				<p className={styles.ctaText}>
					Your financial journey is unique. It's time you had the tools and community to match. Explore the platform and start building your future today.
				</p>
				<Link href='/financial-calculators' className={styles.ctaButton}>
					Explore the Tools
				</Link>
			</section>
		</div>
	);
};

export default AboutUs;