"use client";
import Head from "next/head";
import Image from "next/image";
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
				<title>About Us | Dollars & Life</title>
				<meta
					name='description'
					content='Meet Tarek I., founder of Dollars & Life — where side hustles meet real dev work, financial tools, and no-nonsense money advice.'
				/>
				<link rel='canonical' href='https://www.dollarsandlife.com/about-us' />
			</Head>

			{/* Hero Section */}
			<section className={styles.heroSection}>
				<div className={styles.heroContainer}>
					<div className={styles.heroContent}>
						<div className={styles.heroText}>
							<div className={styles.heroBadge}>
								<span>✨ Built with Real Experience</span>
							</div>
							<h1 className={styles.heroTitle}>
								About <span className={styles.brandHighlight}>Dollars & Life</span>
							</h1>
							<p className={styles.heroSubtitle}>
								Real financial strategies from real experience. No fluff, no outsourcing.
								Just proven methods that actually work in the real world.
							</p>
							<div className={styles.heroStats}>
								<div className={styles.stat}>
									<span className={styles.statNumber}>2+</span>
									<span className={styles.statLabel}>Years Building</span>
								</div>
								<div className={styles.stat}>
									<span className={styles.statNumber}>100%</span>
									<span className={styles.statLabel}>Real Experience</span>
								</div>
								<div className={styles.stat}>
									<span className={styles.statNumber}>∞</span>
									<span className={styles.statLabel}>No Fluff</span>
								</div>
							</div>
						</div>
						<div className={styles.heroImage}>
							<Image
								src={profileImage}
								alt='Tarek I. - Founder of Dollars & Life'
								width={280}
								height={280}
								priority
								className={styles.profileImage}
							/>
							<div className={styles.imageBadge}>
								<span>🚀</span>
								<span>Full-Stack Dev</span>
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<main className={styles.mainContent}>
				{/* Founder Section */}
				<section className={styles.founderSection}>
					<div className={styles.sectionContainer}>
						<div className={styles.founderContent}>
							<div className={styles.founderCard}>
								<h2 className={styles.founderName}>Tarek I.</h2>
								<p className={styles.founderRole}>Founder & Full-Stack Developer</p>
								<div className={styles.founderBio}>
									<p>
										Hi, I'm Tarek — the founder, writer, and full-stack developer behind Dollars & Life.
										This blog began after nearly two years of hands-on building and testing, not just in code
										but through real-world financial trials.
									</p>
									<p>
										Whether it's budgeting, side hustles, or building digital income streams, every post here
										is rooted in experience — no fluff, no outsourcing. Just real experiments and what actually works.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Mission Section */}
				<section className={styles.missionSection}>
					<div className={styles.sectionContainer}>
						<div className={styles.missionCard}>
							<div className={styles.missionIcon}>🎯</div>
							<h2 className={styles.missionTitle}>Our Mission</h2>
							<p className={styles.missionText}>
								To help people take control of their income with strategies that work in real life —
								no jargon, no gatekeeping. Whether you're driving deliveries, learning to code, or launching
								something of your own, this site is here to support that journey.
							</p>
						</div>
					</div>
				</section>

				{/* Why Section */}
				<section className={styles.whySection}>
					<div className={styles.sectionContainer}>
						<div className={styles.sectionHeader}>
							<h2 className={styles.sectionTitle}>Why Dollars & Life?</h2>
							<div className={styles.sectionDivider}></div>
						</div>
						<div className={styles.whyContent}>
							<div className={styles.whyCard}>
								<div className={styles.whyIcon}>💡</div>
								<h3 className={styles.whyTitle}>Real Experience</h3>
								<p>
									Every strategy, tool, and tip comes from hands-on testing and real-world application.
									No theoretical advice — just what actually works.
								</p>
							</div>
							<div className={styles.whyCard}>
								<div className={styles.whyIcon}>🔧</div>
								<h3 className={styles.whyTitle}>Practical Tools</h3>
								<p>
									From budgeting calculators to side hustle guides, everything is designed to be immediately
									actionable and useful in your daily life.
								</p>
							</div>
							<div className={styles.whyCard}>
								<div className={styles.whyIcon}>🤝</div>
								<h3 className={styles.whyTitle}>Community Driven</h3>
								<p>
									Join our forum to connect with like-minded individuals, share experiences, and learn from
									others on similar financial journeys.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Tech Section */}
				<section className={styles.techSection}>
					<div className={styles.sectionContainer}>
						<div className={styles.sectionHeader}>
							<h2 className={styles.sectionTitle}>Built with Modern Tech</h2>
							<div className={styles.sectionDivider}></div>
						</div>
						<p className={styles.techIntro}>
							Dollars & Life is a fully custom project built from the ground up using cutting-edge technologies
							to ensure performance, security, and scalability.
						</p>
						<div className={styles.techGrid}>
							<div className={styles.techCategory}>
								<h3 className={styles.techCategoryTitle}>Frontend</h3>
								<div className={styles.techIcons}>
									<div className={styles.techIcon}>
										<Image src={nextjsLogo} alt='Next.js' width={132} height={45} />
										<span>Next.js</span>
									</div>
									<div className={styles.techIcon}>
										<Image src={reactLogo} alt='React' width={132} height={45} />
										<span>React 18</span>
									</div>
								</div>
							</div>
							<div className={styles.techCategory}>
								<h3 className={styles.techCategoryTitle}>Backend</h3>
								<div className={styles.techIcons}>
									<div className={styles.techIcon}>
										<Image src={nodeLogo} alt='Node.js' width={132} height={45} />
										<span>Node.js</span>
									</div>
									<div className={styles.techIcon}>
										<Image src={expressLogo} alt='Express.js' width={132} height={45} />
										<span>Express.js</span>
									</div>
								</div>
							</div>
							<div className={styles.techCategory}>
								<h3 className={styles.techCategoryTitle}>Database</h3>
								<div className={styles.techIcons}>
									<div className={styles.techIcon}>
										<Image src={mongoLogo} alt='MongoDB' width={132} height={45} />
										<span>MongoDB</span>
									</div>
									<div className={styles.techIcon}>
										<Image src={firebaseLogo} alt='Firebase' width={132} height={45} />
										<span>Firebase</span>
									</div>
								</div>
							</div>
						</div>
						<div className={styles.techDetails}>
							<p>
								The site uses a hybrid approach: <strong>MongoDB</strong> for flexible content management and
								<strong>Firebase</strong> for real-time user interactions and authentication. This combination
								provides the best of both worlds — powerful content management and secure, scalable user features.
							</p>
						</div>
					</div>
				</section>

				{/* Connect Section */}
				<section className={styles.connectSection}>
					<div className={styles.sectionContainer}>
						<div className={styles.connectCard}>
							<h2 className={styles.connectTitle}>Let's Connect</h2>
							<p className={styles.connectText}>
								Want to chat about development, collaborate on projects, or just share ideas?
								I'm always open to connecting with fellow developers and entrepreneurs.
							</p>
							<div className={styles.connectButtons}>
								<a
									href='https://www.linkedin.com/in/tarek-ismail-96777578/'
									target='_blank'
									rel='noopener noreferrer'
									className={styles.primaryButton}
								>
									Connect on LinkedIn
								</a>
								<a
									href='/forum'
									className={styles.secondaryButton}
								>
									Join Our Forum
								</a>
							</div>
						</div>
					</div>
				</section>

				{/* Footer Section */}
				<section className={styles.footerSection}>
					<div className={styles.sectionContainer}>
						<div className={styles.footerCard}>
							<div className={styles.footerIcon}>💼</div>
							<p className={styles.footerText}>
								<strong>Thanks for stopping by — and welcome to Dollars & Life.</strong>
							</p>
							<p className={styles.footerSubtext}>
								Ready to take control of your financial future? Start exploring our resources today.
							</p>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
};

export default AboutUs;
