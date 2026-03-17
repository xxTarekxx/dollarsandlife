"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";
import { prefixLang } from "@/lib/i18n/prefixLang";

import expressLogo from "../../../src/assets/images/expressjs.webp";
import firebaseLogo from "../../../src/assets/images/firebaselogo.png";
import mongoLogo from "../../../src/assets/images/mongodb.webp";
import nextjsLogo from "../../../src/assets/images/nextjs-logo.svg";
import nodeLogo from "../../../src/assets/images/nodejslogo.webp";
import profileImage from "../../../src/assets/images/profile-image.webp";
import reactLogo from "../../../src/assets/images/reactlogo.webp";

import styles from "../../../pages/about-us/about-us.module.css";

export default function AboutUsClient() {
	const params = useParams();
	const lang = (params?.lang as string) ?? "en";

	return (
		<div className={styles.pageWrapper}>
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
					<main className={styles.narrativeColumn}>
						<div className={styles.timeline}>
							<div className={styles.timelineItem}>
								<h3>The Problem</h3>
								<span className={styles.meta}>Phase 1: The Frustration</span>
								<p>The world of personal finance is full of noise: abstract theories, get-rich-quick schemes, and tools that don&apos;t fit real life. I was tired of it. As a developer, I knew there had to be a better way—a system based on data, logic, and practical application.</p>
							</div>
							<div className={styles.timelineItem}>
								<h3>The Build</h3>
								<span className={styles.meta}>Phase 2: The Development</span>
								<p>For two years, I coded, tested, and iterated on financial tools and strategies. This wasn&apos;t a side project; it was a mission to create a platform from the ground up that was fast, secure, and genuinely useful.</p>
							</div>
							<div className={styles.timelineItem}>
								<h3>The Philosophy</h3>
								<span className={styles.meta}>Phase 3: The Principles</span>
								<p>Through this process, a core philosophy emerged: financial empowerment comes from ownership. That means providing transparent, experience-driven advice and building open, powerful tools.</p>
							</div>
							<div className={styles.timelineItem}>
								<h3>The Launch</h3>
								<span className={styles.meta}>Phase 4: The Platform</span>
								<p>Dollars & Life is the result. It&apos;s more than a blog; it&apos;s a constantly evolving platform where finance and technology intersect.</p>
							</div>
						</div>
					</main>

					<aside className={styles.sidebarColumn}>
						<div className={styles.sidebarCard}>
							<div className={styles.founderProfile}>
								<Image src={profileImage} alt="Tarek I. - Founder of Dollars & Life" className={styles.founderImage} />
								<h4 className={styles.founderName}>Tarek I.</h4>
								<p className={styles.founderRole}>Founder & Full-Stack Developer</p>
								<a href="https://www.linkedin.com/in/tarek-ismail-96777578/" target="_blank" rel="noopener noreferrer" className={styles.socialLink}>Connect on LinkedIn</a>
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

				<section className={styles.techSection}>
					<h2 className={styles.techTitle}>The Tech Behind The Talk</h2>
					<div className={styles.techGrid}>
						<div className={styles.techCard}><Image src={nextjsLogo} alt="Next.js Logo" /></div>
						<div className={styles.techCard}><Image src={reactLogo} alt="React Logo" /></div>
						<div className={styles.techCard}><Image src={nodeLogo} alt="Node.js Logo" /></div>
					</div>
					<div className={styles.techGrid}>
						<div className={styles.techCard}><Image src={mongoLogo} alt="MongoDB Logo" /></div>
						<div className={styles.techCard}><Image src={firebaseLogo} alt="Firebase Logo" /></div>
						<div className={styles.techCard}><Image src={expressLogo} alt="Express.js Logo" /></div>
					</div>
				</section>
			</div>

			<section className={styles.ctaSection}>
				<h2 className={styles.ctaTitle}>Join the Build</h2>
				<p className={styles.ctaText}>Your financial journey is unique. It&apos;s time you had the tools and community to match. Explore the platform and start building your future today.</p>
				<Link href={prefixLang("/financial-calculators", lang)} className={styles.ctaButton}>Explore the Tools</Link>
			</section>
		</div>
	);
}
