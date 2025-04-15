import React from "react";
import "./SentryPCLanding.css";

const SentryPCLanding = () => {
	return (
		<div className='sentrypc-container'>
			<section className='hero'>
				<h1>Employee Monitoring Made Easy</h1>
				<p>
					Track user activity, boost productivity, and protect your business —
					all from one cloud dashboard.
				</p>
				<a
					href='https://sentrypc.7eer.net/c/5513478/200614/3022'
					className='card-cta-button'
				>
					Get Started with SentryPC
				</a>
				<div className='trust-badges'>
					✅ Stealth Mode • ✅ Remote Access • ✅ Real-Time Alerts
				</div>
			</section>
			<section className='pricing-table'>
				<h2>Choose the Plan That Fits Your Business</h2>
				<div className='pricing-cards'>
					{[
						{
							name: "Basic Plan",
							price: "$69.95 / year",
							features: [
								"Manage 1 device",
								"Store up to 500 screenshots",
								"$29.95 each additional license",
							],
						},
						{
							name: "Business 50",
							price: "$1,495.00 / year",
							features: [
								"50 Licenses",
								"Manage up to 50 devices",
								"500 screenshots",
								"$29.90 per license",
							],
						},
						{
							name: "Business 100",
							price: "$2,495.00 / year",
							features: [
								"100 Licenses",
								"Manage up to 100 devices",
								"1,000 screenshots",
							],
						},
						{
							name: "Business 250",
							price: "$4,995.00 / year",
							features: [
								"250 Licenses",
								"Manage up to 250 devices",
								"1,000 screenshots",
								"$19.98 per license",
							],
						},
						{
							name: "Business 500",
							price: "$7,495.00 / year",
							features: [
								"500 Licenses",
								"Manage up to 500 devices",
								"2,000 screenshots",
								"$14.99 per license",
							],
						},
						{
							name: "Business 1,000",
							price: "$9,995.00 / year",
							features: [
								"1,000 Licenses",
								"Manage up to 1,000 devices",
								"2,000 screenshots",
								"$9.99 per license",
							],
						},
					].map((plan, index) => (
						<div className='plan-card' key={index}>
							<h3>{plan.name}</h3>
							<p className='price'>{plan.price}</p>
							<ul>
								{plan.features.map((feature, idx) => (
									<li key={idx}>{feature}</li>
								))}
							</ul>
							<a
								href='https://sentrypc.7eer.net/c/5513478/200614/3022'
								target='_blank'
								rel='noopener noreferrer'
								className='card-cta-button'
							>
								Buy This Plan
							</a>
						</div>
					))}
				</div>
			</section>

			<section className='intro'>
				<h2>What is SentryPC?</h2>
				<p>
					SentryPC is an all-in-one employee monitoring and content filtering
					solution trusted by small businesses, IT teams, and remote companies.
					Whether you’re managing five employees or fifty, SentryPC helps you
					track productivity, monitor behavior, and secure sensitive data — all
					from your online dashboard.
				</p>
			</section>

			<section className='features'>
				<h2>Why Businesses Choose SentryPC</h2>
				<ul>
					<li>Cloud access from any device</li>
					<li>Real-time activity viewing</li>
					<li>Centralized multi-device control</li>
					<li>Stealth operation (invisible monitoring)</li>
					<li>Content filtering & application blocking</li>
					<li>Screenshot recording with storage limits per plan</li>
					<li>Activity alerts & notification system</li>
					<li>Powerful visual reporting and analytics</li>
					<li>Downloadable usage archives</li>
					<li>Free updates included for all subscriptions</li>
				</ul>
			</section>

			<section className='ideal-for'>
				<h2>Built for Teams That Work Smarter</h2>
				<ul>
					<li>Remote companies</li>
					<li>Small business owners</li>
					<li>IT managers and HR teams</li>
					<li>Call centers & support teams</li>
					<li>Schools and education admins</li>
				</ul>
			</section>

			<section className='pricing'>
				<h2>Scalable Plans for Growing Teams</h2>
				<p>
					SentryPC offers affordable yearly plans that scale with your team
					size. For larger teams, the Business 50 plan includes up to 50 devices
					and central control for $1495/year.
				</p>
				<a
					href='https://sentrypc.7eer.net/c/5513478/200614/3022'
					className='card-cta-button'
				>
					View Plans and Get Started →
				</a>
			</section>

			<section className='faq'>
				<h2>Frequently Asked Questions</h2>
				<ul>
					<li>
						<strong>Is installation easy?</strong> Yes. Just install once and
						manage everything remotely.
					</li>
					<li>
						<strong>Is it legal to use?</strong> Yes, if used on computers you
						own or manage.
					</li>
					<li>
						<strong>Can users tell they’re being monitored?</strong> Only if you
						want them to.
					</li>
				</ul>
			</section>

			<section className='final-cta'>
				<h2>Monitor Smarter. Protect Your Business.</h2>
				<a
					href='https://sentrypc.7eer.net/c/5513478/200614/3022'
					className='card-cta-button'
				>
					Start with SentryPC Today
				</a>
			</section>
		</div>
	);
};

export default SentryPCLanding;
