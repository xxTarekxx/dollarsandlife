import React from "react";
import "./SentryPCLanding.css"; // Ensure CSS is imported
import { Helmet } from "react-helmet-async";
import SentryLogo from "../../../public/images/sentrypc/sentrypc-logo.webp"; // Adjust path if needed

interface Plan {
	name: string;
	price: string;
	features: string[];
	cta: string;
	isBestSeller?: boolean; // Kept in interface, but not used for className anymore
}

const SentryPCLanding: React.FC = () => {
	const trackingLink =
		"https://sentrypc.7eer.net/c/5513478/200614/3022?subid=googleads";

	const pricingPlans: Plan[] = [
		{
			name: "Essential",
			price: "$69.95 / year",
			features: [
				"Monitor 1 workstation",
				"Up to 500 activity screenshots",
				"Add extra licenses easily",
				"$29.95 each additional license",
			],
			cta: "Secure Your Essential Plan",
		},
		{
			name: "Business 50",
			price: "$1,495.00 / year",
			features: [
				"50 User Licenses Included",
				"Manage up to 50 devices seamlessly",
				"500 Screenshots for review",
				"Cost-effective per user",
				"$29.90 per license",
			],
			cta: "Get Business 50",
			isBestSeller: true, // Data remains, but not used for styling
		},
		{
			name: "Business 100",
			price: "$2,495.00 / year",
			features: [
				"100 User Licenses",
				"Centralized control for 100 devices",
				"1,000 Screenshot History",
				"$24.95 per license",
			],
			cta: "Scale with Business 100",
		},
		{
			name: "Business 250",
			price: "$4,995.00 / year",
			features: [
				"250 User Licenses",
				"Manage up to 250 devices efficiently",
				"Extensive 1,000 Screenshot Archive",
				"Volume licensing savings",
				"$19.98 per license",
			],
			cta: "Optimize with Business 250",
		},
		{
			name: "Business 500",
			price: "$7,495.00 / year",
			features: [
				"500 User Licenses",
				"Comprehensive monitoring for 500 devices",
				"Large 2,000 Screenshot Capacity",
				"Significant per-user discount",
				"$14.99 per license",
			],
			cta: "Grow With Business 500",
		},
		{
			name: "Business 1000",
			price: "$9,995.00 / year",
			features: [
				"1,000 User Licenses",
				"Full-scale monitoring for 1,000 devices",
				"Maximum 2,000 Screenshot Retention",
				"Best value for large teams",
				"$9.99 per license",
			],
			cta: "Choose Business 1000",
		},
	];

	return (
		<div className='sentrypc-container'>
			<Helmet>
				<title>SentryPC Employee Monitoring Software</title>
				<meta name='robots' content='noindex' />
			</Helmet>

			{/* --- START: UNCHANGED SECTION --- */}
			<section className='hero'>
				<h1>
					Unlock Peak Productivity & Security with Effortless Employee
					Monitoring
				</h1>
				<p>
					Gain clear visibility into team activity, identify areas for
					improvement, and safeguard your business from internal threats—all
					within a unified, intuitive cloud platform.
				</p>
				<div className='trust-badges'>
					<span>👁️ Discreet Monitoring</span>
					<span>🌐 Remote Secure Access</span>
					<span>🔔 Instant Activity Alerts</span>
				</div>
			</section>
			{/* --- END: UNCHANGED SECTION --- */}

			{/* --- START: MODIFIED PRICING SECTION --- */}
			<section className='pricing-table'>
				{/* Logo wrapper is part of the original structure */}
				<section className='sentrypc-logo-wrapper'>
					<img
						src={SentryLogo}
						alt='SentryPC Logo'
						className='sentrypc-logo-img'
					/>
				</section>
				<h2>Flexible Plans Designed for Your Business Growth</h2>
				<div className='pricing-cards'>
					{pricingPlans.map((plan, index) => (
						// *** REPLACED OLD .plan-card STRUCTURE WITH NEW .card STRUCTURE ***
						<div key={index} className='card'>
							<div className='card__border'></div>
							<div className='card_title__container'>
								<h3 className='card_title'>{plan.name}</h3>
								{/* Use card_paragraph for price, consistent with new design */}
								<p className='card_paragraph'>{plan.price}</p>
							</div>
							<hr className='line' />
							<ul className='card__list'>
								{plan.features.map((feature, featureIndex) => (
									<li key={featureIndex} className='card__list_item'>
										<div className='check'>
											<svg
												className='check_svg'
												viewBox='0 0 16 16'
												fill='currentColor'
												xmlns='http://www.w3.org/2000/svg'
											>
												<path
													fillRule='evenodd'
													clipRule='evenodd'
													d='M13.4142 4.58579C13.8047 4.97631 13.8047 5.60948 13.4142 6L7.41421 12C7.02369 12.3905 6.39052 12.3905 6 12L2.58579 8.58579C2.19526 8.19526 2.19526 7.56209 2.58579 7.17157C2.97631 6.78105 3.60948 6.78105 4 7.17157L6.70711 9.87868L12 4.58579C12.3905 4.19526 13.0237 4.19526 13.4142 4.58579Z'
												/>
											</svg>
										</div>
										<span className='list_text'>{feature}</span>
									</li>
								))}
							</ul>
							{/* Use new button class and correct link */}
							<a
								href={trackingLink}
								target='_blank'
								rel='noopener noreferrer'
								className='button'
							>
								{plan.cta}
							</a>
						</div>
						// *** END OF REPLACEMENT ***
					))}
				</div>
			</section>
			{/* --- END: MODIFIED PRICING SECTION --- */}

			{/* --- START: UNCHANGED SECTIONS --- */}
			<section className='intro'>
				<h2>
					SentryPC: Your All-in-One Solution for Enhanced Team Performance &
					Security Oversight
				</h2>
				<p>
					Trusted by businesses of all sizes, SentryPC provides the insights you
					need to foster a productive work environment, identify potential
					risks, and protect your valuable company data. From small teams to
					large enterprises, gain the power to monitor, manage, and secure your
					digital workspace effectively.
				</p>
			</section>

			<section className='features'>
				<h2>Key Benefits of Choosing SentryPC</h2>
				<ul>
					<li>☁️ Access Your Dashboard From Anywhere, Anytime</li>
					<li>⏱️ Monitor Activity in Real-Time for Immediate Insights</li>
					<li>💻 Centrally Manage Multiple Devices with Ease</li>
					<li>🤫 Operate Discreetly Without Disrupting Workflow</li>
					<li>🛡️ Control Access with Content Filtering & App Blocking</li>
					<li>📸 Capture and Store Screenshots for Detailed Review</li>
					<li>🚨 Receive Instant Alerts for Critical Activities</li>
					<li>📊 Leverage Powerful Visual Reports & Analytics</li>
					<li>💾 Easily Download Usage Archives for Compliance</li>
					<li>🔄 Enjoy Free Updates to Keep Your Monitoring Ahead</li>
				</ul>
			</section>

			<section className='compare'>
				<h2>Why SentryPC is a Smarter Alternative to Teramind & Controlio</h2>
				<p>
					Looking for powerful employee monitoring software without the steep
					price tag or complexity? <strong>SentryPC</strong> delivers all the
					core features of top tools like <strong>Teramind</strong> and{" "}
					<strong>Controlio</strong>—such as activity tracking, screen capture,
					and app blocking—at a fraction of the cost.
				</p>
				<ul>
					<li>Flat-rate pricing with no hidden fees or per-user add-ons</li>
					<li>
						Quick setup and a cloud-based dashboard you can access from anywhere
					</li>
					<li>
						Lower annual cost compared to feature-equivalent Teramind or
						Controlio plans
					</li>
				</ul>
				<p>
					Whether you're switching from another platform or starting fresh,
					SentryPC offers the flexibility and affordability your team
					needs—without sacrificing functionality.
				</p>
			</section>

			<section className='ideal-for'>
				<h2>Empowering Teams Across Various Industries</h2>
				<ul>
					<li>🌐 Distributed Teams & Remote Workforces</li>
					<li>🏢 Small to Medium-Sized Businesses (SMBs)</li>
					<li>👨‍💻 IT Departments & Security Professionals</li>
					<li>📞 Call Centers & Customer Support Teams</li>
					<li>🎓 Educational Institutions & Administrators</li>
				</ul>
			</section>

			<section className='pricing'>
				<h2>Scalable Solutions to Match Your Evolving Needs</h2>
				<p>
					SentryPC offers cost-effective annual plans that grow with your
					organization. Whether you're just starting or managing a large team,
					find the perfect plan to gain comprehensive employee monitoring
					capabilities.
				</p>
				<a
					href={trackingLink}
					target='_blank'
					rel='noopener noreferrer'
					className='card-cta-button' // This button remains styled by .card-cta-button
				>
					Explore Plans & Start Monitoring Today →
				</a>
			</section>

			<section className='faq'>
				<h2>Frequently Asked Questions</h2>
				<ul>
					<li>
						<strong>Is SentryPC easy to set up?</strong> Absolutely! A quick,
						one-time installation gets you started, with all management done
						remotely.
					</li>
					<li>
						<strong>Is employee monitoring legally sound?</strong> Yes, as long
						as it's implemented on company-owned or managed devices with proper
						policies in place.
					</li>
					<li>
						<strong>Can employees detect SentryPC?</strong> You have the
						flexibility to run SentryPC in a discreet mode, ensuring seamless
						operation.
					</li>
				</ul>
			</section>

			<section className='final-cta'>
				<h2>Take Control of Your Team's Productivity and Security Now</h2>
				<a
					href={trackingLink}
					target='_blank'
					rel='noopener noreferrer'
					className='card-cta-button' // This button remains styled by .card-cta-button
				>
					Begin Your SentryPC Journey Today
				</a>
			</section>

			<section className='affiliate-disclaimer'>
				<p className='disclaimer-text'>
					<strong>Disclosure:</strong> We are an affiliate partner of SentryPC.
					If you make a purchase through the links on this page, we may earn a
					commission—at no extra cost to you. This helps us keep our content
					free and unbiased.
				</p>
			</section>
			{/* --- END: UNCHANGED SECTIONS --- */}
		</div>
	);
};

export default SentryPCLanding;
