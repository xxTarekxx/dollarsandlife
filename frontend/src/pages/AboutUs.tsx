import React from "react";
import { Helmet } from "react-helmet-async";
import "./category/extra-income/CommonStyles.css";
import "./AboutUs.css";

// Importing logos from /assets
import mongoLogo from "../../src/assets/mongodb.webp";
import expressLogo from "../../src/assets/expressjs.webp";
import reactLogo from "../../src/assets/reactlogo.webp";
import nodeLogo from "../../src/assets/nodejslogo.webp";
import firebaseLogo from "../../src/assets/firebaselogo.png"; // Make sure this exists

const AboutUs: React.FC = () => {
	return (
		<div className='page-container about-us'>
			<Helmet>
				<title>About Us | Dollars & Life</title>
				<meta
					name='description'
					content='Meet Tarek I., founder of Dollars & Life — where side hustles meet real dev work, financial tools, and no-nonsense money advice.'
				/>
				<link rel='canonical' href='https://www.dollarsandlife.com/about-us' />
			</Helmet>

			<h1 className='title-heading'>About Dollars & Life</h1>

			<section className='about-intro'>
				<img
					src='/images/profile-image.webp'
					alt='Tarek I. - Founder of Dollars & Life'
					className='about-profile-image'
				/>
				<div className='about-intro-text'>
					<p>
						Hi, I’m <strong>Tarek I.</strong> — the founder, writer, and
						full-stack developer behind <strong>Dollars & Life</strong>. This
						blog began after nearly two years of hands-on building and testing,
						not just in code but through real-world financial trials.
					</p>
					<p>
						Whether it’s budgeting, side hustles, or building digital income
						streams, every post here is rooted in experience — no fluff, no
						outsourcing. Just real experiments and what actually works.
					</p>
				</div>
			</section>

			<section className='about-body'>
				<h2>Why I Started This Blog</h2>
				<p>
					Most personal finance advice feels recycled or disconnected from how
					real people hustle to make ends meet. I created Dollars & Life to fill
					that gap — a place where financial guidance meets technical skill and
					everyday practicality.
				</p>
				<p>
					It’s not just a blog — it’s a toolkit for those navigating gig work,
					starting side businesses, or trying to stretch every dollar while
					staying in control.
				</p>
			</section>

			<section className='about-mission-card'>
				<h3>What This Site Is Really About</h3>
				<p>
					My mission is simple: to help people take control of their income with
					strategies that work in real life — no jargon, no gatekeeping. Whether
					you're driving deliveries, learning to code, or launching something of
					your own, this site is here to support that journey.
				</p>
			</section>

			<section className='about-tech-card'>
				<h3>How I Built This Site</h3>
				<p>
					Dollars & Life is a fully custom project built from the ground up
					using the <strong>MERN stack</strong> — <strong>MongoDB</strong>,{" "}
					<strong>Express.js</strong>, <strong>React 18</strong>, and{" "}
					<strong>Node.js</strong>. MongoDB powers all dynamic content — from
					blog posts to user data — through a lightweight API I built with
					Express.
				</p>
				<div className='tech-icons'>
					<img src={mongoLogo} alt='MongoDB Logo' />
					<img src={expressLogo} alt='Express.js Logo' />
					<img src={reactLogo} alt='React Logo' />
					<img src={nodeLogo} alt='Node.js Logo' />
				</div>
				<p>
					<span className='firebase-note'>
						Coming soon: Dollars & Life will integrate{" "}
						<strong>Firebase Authentication</strong> for secure login, along
						with <strong>Firebase Storage</strong> to support a full-featured{" "}
						forum system. You'll be able to connect, ask questions, and share
						insights directly with other readers.
					</span>
				</p>
				<div className='firebase-tech-icons'>
					<img src={firebaseLogo} alt='Firebase Logo' />
				</div>
				<p>
					The frontend is built with <strong>React 18</strong> and{" "}
					<strong>TypeScript</strong>, with client-side routing handled by{" "}
					<strong>React Router v6</strong>. I used <strong>Helmet Async</strong>{" "}
					for SEO metadata, and <strong>Styled-Components</strong> alongside raw
					CSS to build out a clean, responsive layout.
				</p>
				<p>
					To enhance performance, the stack includes <strong>Webpack 5</strong>{" "}
					with compression and bundle analysis tools. I also integrated{" "}
					<strong>EmailJS</strong> for contact handling and used{" "}
					<strong>FontAwesome</strong> for clean iconography.
				</p>
				<p>
					Throughout development, I leaned on tools like{" "}
					<strong>ChatGPT</strong> and <strong>Gemini Studio</strong> for
					brainstorming, debugging, and feature planning — combining human
					creativity with AI speed.
				</p>
			</section>

			<section className='about-connect'>
				<p>
					Want to chat or dive deeper into the build?{" "}
					<a
						href='https://www.linkedin.com/in/tarek-ismael-96777578/'
						target='_blank'
						rel='noopener noreferrer'
					>
						Connect with me on LinkedIn
					</a>
					. I’m always open to collaborations, freelance dev work, or just
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
