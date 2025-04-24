import React from "react";
import { Helmet } from "react-helmet-async";
import "./category/extra-income/CommonStyles.css";
import "./AboutUs.css";

const AboutUs: React.FC = () => {
	return (
		<div className='page-container about-us'>
			<Helmet>
				<title>About Us | Dollars & Life</title>
				<meta
					name='description'
					content='Meet Tarek I., founder of Dollars & Life — a blog that shares side hustle ideas, financial tips, and dev insights to help you grow smarter with money.'
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
						I'm <strong>Tarek I.</strong> — the founder, writer, and developer
						behind <strong>Dollars & Life</strong>. I launched this blog about a
						year ago after nearly two years of building it from scratch. My
						goal? To create a space where real, practical financial advice meets
						real-world testing — no fluff, no filler.
					</p>
					<p>
						This isn’t a team of ghostwriters — every guide, tool, and post is
						the product of my own experience navigating gig work, budgeting
						systems, and entrepreneurial experiments.
					</p>
				</div>
			</section>

			<section className='about-body'>
				<h2>Why I Started This Blog</h2>
				<p>
					I’ve spent years trying, failing, and figuring out how to make extra
					income and stretch every dollar without sacrificing freedom. The
					problem? Most money advice online feels recycled or disconnected from
					how real people actually live.
				</p>
				<p>
					Dollars & Life was born out of that gap. I wanted to create a blog
					that mixes actionable side hustle ideas, beginner-friendly tools, and
					honest insight — all tested firsthand. I also wanted it to be built
					well — both on the surface and under the hood.
				</p>
			</section>

			<section className='about-mission-card'>
				<h3>What This Site Is Really About</h3>
				<p>
					My mission is simple: help everyday people take control of their
					income with strategies that work in real life. Whether you're driving
					deliveries, launching a blog, or just trying to stay afloat, this site
					is here to support you.
				</p>
			</section>

			<section className='about-tech-card'>
				<h3>How I Built This Site</h3>
				<p>
					Dollars & Life is the only site I’ve designed and developed from the
					ground up. Built with
					<strong> React 18</strong>, <strong>Webpack 5</strong>, and{" "}
					<strong>TypeScript</strong>, it uses a custom content model powered by
					structured JSON, SEO best practices, and a hand-rolled layout system
					optimized for performance.
				</p>
				<p>
					<strong>Key tools and packages I’ve used include:</strong>
					<br />- <strong>React Router v6</strong> for routing
					<br />- <strong>Helmet Async</strong> for SEO metadata
					<br />- <strong>EmailJS</strong> for contact handling
					<br />- <strong>FontAwesome</strong> for branding
					<br />- <strong>Styled-Components</strong> and raw CSS for styling
					<br />- <strong>
						Webpack Bundle Analyzer + Compression Plugin
					</strong>{" "}
					for optimization
				</p>
				<p>
					I also leaned heavily on <strong>ChatGPT</strong> and{" "}
					<strong>Gemini Studio</strong> for architectural planning,
					troubleshooting, and speed — combining human creativity with AI
					efficiency to get things done faster and smarter.
				</p>
			</section>

			<section className='about-connect'>
				<p>
					Want to connect or explore how I built this further? You can reach me
					on{" "}
					<a
						href='https://www.linkedin.com/in/tarek-ismael-96777578/'
						target='_blank'
						rel='noopener noreferrer'
					>
						LinkedIn
					</a>
					. I’m always open to collaboration, freelance dev work, or just
					sharing what I’ve learned.
				</p>
				<p>
					<strong>
						Thanks for being here — and welcome to Dollars & Life.
					</strong>
				</p>
			</section>
		</div>
	);
};

export default AboutUs;
