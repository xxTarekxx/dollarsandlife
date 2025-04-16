import React from "react";
import "./SentryPCLanding.css";
import { Helmet } from "react-helmet-async";

interface Plan {
	name: string;
	price: string;
	features: string[];
	cta: string;
	isBestSeller?: boolean;
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
			cta: "Get Business Standard",
			isBestSeller: true,
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
			cta: "Scale with Business Pro",
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
			cta: "Optimize with Enterprise",
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
			cta: "Unlock Premium Features",
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
			cta: "Choose Business Elite",
		},
	];

	return (
		<div className='sentrypc-container'>
			<Helmet>
				<title>SentryPC Employee Monitoring Software</title>
				<meta name='robots' content='noindex' />
			</Helmet>

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

			<section className='pricing-table'>
				<h2>Flexible Plans Designed for Your Business Growth</h2>
				<div className='pricing-cards'>
					{pricingPlans.map((plan, index) => (
						<div
							className={`plan-card ${plan.isBestSeller ? "best-seller" : ""}`}
							key={index}
						>
							{plan.isBestSeller && (
								<span className='best-seller-badge'>Best Seller</span>
							)}
							<h3>{plan.name}</h3>
							<p className='price'>{plan.price}</p>
							<ul>
								{plan.features.map((feature, idx) => (
									<li key={idx}>{feature}</li>
								))}
							</ul>
							<a
								href={trackingLink}
								target='_blank'
								rel='noopener noreferrer'
								className='card-cta-button'
							>
								{plan.cta}
							</a>
						</div>
					))}
				</div>
			</section>

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
					className='card-cta-button'
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
					className='card-cta-button'
				>
					Begin Your SentryPC Journey Today
				</a>
			</section>
		</div>
	);
};

export default SentryPCLanding;
