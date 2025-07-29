"use client";
import Head from "next/head";
import Image from "next/image";
import React from "react";
import styles from "./about-us.module.css";

// Importing logos from /assets
import expressLogo from "../src/assets/images/expressjs.webp";
import firebaseLogo from "../src/assets/images/firebaselogo.png"; // Make sure this exists
import mongoLogo from "../src/assets/images/mongodb.webp";
import nextjsLogo from "../src/assets/images/nextjs-logo.svg";
import nodeLogo from "../src/assets/images/nodejslogo.webp";
import profileImage from "../src/assets/images/profile-image.webp";
import reactLogo from "../src/assets/images/reactlogo.webp";

const AboutUs: React.FC = () => {
	return (
		<div className={`page-container ${styles.aboutUs}`}>
			<Head>
				<title>About Us | Dollars & Life</title>
				<meta
					name='description'
					content='Meet Tarek I., founder of Dollars & Life — where side hustles meet real dev work, financial tools, and no-nonsense money advice.'
				/>
				<link rel='canonical' href='https://www.dollarsandlife.com/about-us' />
			</Head>

			<h1 className='title-heading'>About Dollars & Life</h1>

			<section className={styles.aboutIntro}>
				<Image
					src={profileImage}
					alt='Tarek I. - Founder of Dollars & Life'
					className={styles.aboutProfileImage}
					width={160}
					height={160}
					priority
				/>
				<div className={styles.aboutIntroText}>
					<p>
						Hi, I'm <strong>Tarek I.</strong> — the founder, writer, and
						full-stack developer behind <strong>Dollars & Life</strong>. This
						blog began after nearly two years of hands-on building and testing,
						not just in code but through real-world financial trials.
					</p>
					<p>
						Whether it's budgeting, side hustles, or building digital income
						streams, every post here is rooted in experience — no fluff, no
						outsourcing. Just real experiments and what actually works.
					</p>
				</div>
			</section>

			<section className={styles.aboutBody}>
				<h2>Why I Started This Blog</h2>
				<p>
					Most personal finance advice feels recycled or disconnected from how
					real people hustle to make ends meet. I created Dollars & Life to fill
					that gap — a place where financial guidance meets technical skill and
					everyday practicality.
				</p>
				<p>
					It's not just a blog — it's a toolkit for those navigating gig work,
					starting side businesses, or trying to stretch every dollar while
					staying in control.
				</p>
			</section>

			<section className={styles.aboutMissionCard}>
				<h2>What This Site Is Really About</h2>
				<p>
					My mission is simple: to help people take control of their income with
					strategies that work in real life — no jargon, no gatekeeping. Whether
					you're driving deliveries, learning to code, or launching something of
					your own, this site is here to support that journey.
				</p>
			</section>

			<section className={styles.aboutTechCard}>
				<h2>How I Built This Site</h2>
				<p>
					Dollars & Life is a fully custom project built from the ground up using the <strong>MERN stack</strong> — <strong>MongoDB</strong>, <strong>Express.js</strong>, <strong>React 18</strong>, and <strong>Node.js</strong>. For this site, I used <strong>Next.js</strong> on top of React for its powerful features and ease of implementing server-side rendering (SSR), which helps with SEO and performance.<br /><br />
					<strong>MongoDB</strong> powers all dynamic content for blog posts and articles, while <strong>Firebase</strong> is used for forum user data, authentication, and storage. This hybrid approach lets me leverage the strengths of both platforms: MongoDB for flexible content management and Firebase for real-time, secure user interactions in the community forum.
				</p>
				<div className={styles.techIcons}>
					<Image src={nextjsLogo} alt='Next.js Logo' />
					<Image src={reactLogo} alt='React Logo' />

					<Image src={mongoLogo} alt='MongoDB Logo' />
					<Image
						src={expressLogo}
						alt='Express.js Logo'
					/>
					<Image
						src={firebaseLogo}
						alt='Firebase Logo'

					/>
					<Image src={nodeLogo} alt='Node.js Logo' />

				</div>
				<p>
					The site now includes a live, full-featured{' '}
					<a
						href='https://www.dollarsandlife.com/forum'
						target='_blank'
						rel='noopener noreferrer'
					>
						community forum
					</a>{' '}
					secured by <strong>Firebase Authentication</strong> and powered by{' '}
					<strong>Firebase Storage</strong>. You can sign in securely with your Email, Google or Microsoft, ask questions, and connect directly with other readers.
				</p>
				<p>
					The frontend is built with <strong>React 18</strong> and <strong>TypeScript</strong>, with client-side routing handled by <strong>React Router v6</strong>. I used <strong>Helmet Async</strong> for SEO metadata, and <strong>Styled-Components</strong> alongside raw CSS to build out a clean, responsive layout.
				</p>
				<p>
					To enhance performance, the stack includes <strong>Webpack 5</strong> with compression and bundle analysis tools. I also integrated <strong>EmailJS</strong> for contact handling and used <strong>FontAwesome</strong> for clean iconography.
				</p>
				<p>
					Throughout development, I leaned on tools like <strong>ChatGPT</strong> and <strong>Gemini Studio</strong> for brainstorming, debugging, and feature planning — combining human creativity with AI speed.
				</p>
			</section>

			<section className={styles.aboutConnect}>
				<p>
					Want to chat or dive deeper into the build?{" "}
					<a
						href='https://www.linkedin.com/in/tarek-ismail-96777578/'
						target='_blank'
						rel='noopener noreferrer'
					>
						Connect with me on LinkedIn
					</a>
					. I'm always open to collaborations, freelance dev work, or just
					sharing ideas.
				</p>
				<p>
					<strong>
						Thanks for stopping by — and welcome to Dollars & Life.
					</strong>
				</p>
			</section>
		</div>
	);
};

export default AboutUs;
