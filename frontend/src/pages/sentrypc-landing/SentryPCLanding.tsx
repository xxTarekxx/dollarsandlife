import React from "react";
import "./SentryPCLanding.css";

interface Plan {
	name: string;
	price: string;
	features: string[];
	cta: string;
}

const SentryPCLanding: React.FC = () => {
	const pricingPlans: Plan[] = [
		{
			name: "Essential",
			price: "$69.95 / year",
			features: [
				"Monitor 1 workstation",
				"Up to 500 activity screenshots",
				"Add extra licenses easily",
			],
			cta: "Secure Your Essential Plan",
		},
		{
			name: "Business Standard",
			price: "$1,495.00 / year",
			features: [
				"50 User Licenses Included",
				"Manage up to 50 devices seamlessly",
				"500 Screenshots for review",
				"Cost-effective per user",
			],
			cta: "Get Business Standard",
		},
		{
			name: "Business Pro",
			price: "$2,495.00 / year",
			features: [
				"100 User Licenses",
				"Centralized control for 100 devices",
				"1,000 Screenshot History",
			],
			cta: "Scale with Business Pro",
		},
		{
			name: "Business Enterprise",
			price: "$4,995.00 / year",
			features: [
				"250 User Licenses",
				"Manage up to 250 devices efficiently",
				"Extensive 1,000 Screenshot Archive",
				"Volume licensing savings",
			],
			cta: "Optimize with Enterprise",
		},
		{
			name: "Business Premium",
			price: "$7,495.00 / year",
			features: [
				"500 User Licenses",
				"Comprehensive monitoring for 500 devices",
				"Large 2,000 Screenshot Capacity",
				"Significant per-user discount",
			],
			cta: "Unlock Premium Features",
		},
		{
			name: "Business Elite",
			price: "$9,995.00 / year",
			features: [
				"1,000 User Licenses",
				"Full-scale monitoring for 1,000 devices",
				"Maximum 2,000 Screenshot Retention",
				"Best value for large teams",
			],
			cta: "Choose Business Elite",
		},
	];

	return (
		<div className='sentrypc-container'>
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
				<a
					href='https://sentrypc.7eer.net/c/5513478/200614/3022'
					className='card-cta-button'
				>
					Start Your Free Trial of SentryPC
				</a>
				<div className='trust-badges'>
					<span>
						<span role='img' aria-label='eye'>
							👁️
						</span>{" "}
						Discreet Monitoring
					</span>
					<span>
						<span role='img' aria-label='remote'>
							🌐
						</span>{" "}
						Remote Secure Access
					</span>
					<span>
						<span role='img' aria-label='bell'>
							🔔
						</span>{" "}
						Instant Activity Alerts
					</span>
				</div>
			</section>
			<section className='pricing-table'>
				<h2>Flexible Plans Designed for Your Business Growth</h2>
				<div className='pricing-cards'>
					{pricingPlans.map((plan, index) => (
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
					<li>
						<span role='img' aria-label='cloud'>
							☁️
						</span>{" "}
						Access Your Dashboard From Anywhere, Anytime
					</li>
					<li>
						<span role='img' aria-label='real-time'>
							⏱️
						</span>{" "}
						Monitor Activity in Real-Time for Immediate Insights
					</li>
					<li>
						<span role='img' aria-label='devices'>
							💻
						</span>{" "}
						Centrally Manage Multiple Devices with Ease
					</li>
					<li>
						<span role='img' aria-label='hidden'>
							🤫
						</span>{" "}
						Operate Discreetly Without Disrupting Workflow
					</li>
					<li>
						<span role='img' aria-label='filter'>
							🛡️
						</span>{" "}
						Control Access with Content Filtering & App Blocking
					</li>
					<li>
						<span role='img' aria-label='screenshots'>
							📸
						</span>{" "}
						Capture and Store Screenshots for Detailed Review
					</li>
					<li>
						<span role='img' aria-label='alerts'>
							🚨
						</span>{" "}
						Receive Instant Alerts for Critical Activities
					</li>
					<li>
						<span role='img' aria-label='analytics'>
							📊
						</span>{" "}
						Leverage Powerful Visual Reports & Analytics for Data-Driven
						Decisions
					</li>
					<li>
						<span role='img' aria-label='download'>
							💾
						</span>{" "}
						Easily Download Usage Archives for Compliance
					</li>
					<li>
						<span role='img' aria-label='update'>
							🔄
						</span>{" "}
						Enjoy Free Updates to Keep Your Monitoring Ahead
					</li>
				</ul>
			</section>

			<section className='ideal-for'>
				<h2>Empowering Teams Across Various Industries</h2>
				<ul>
					<li>
						<span role='img' aria-label='remote'>
							🌐
						</span>{" "}
						Distributed Teams & Remote Workforces
					</li>
					<li>
						<span role='img' aria-label='business'>
							🏢
						</span>{" "}
						Small to Medium-Sized Businesses (SMBs)
					</li>
					<li>
						<span role='img' aria-label='it'>
							👨‍💻
						</span>{" "}
						IT Departments & Security Professionals
					</li>
					<li>
						<span role='img' aria-label='call-center'>
							📞
						</span>{" "}
						Call Centers & Customer Support Teams
					</li>
					<li>
						<span role='img' aria-label='education'>
							🎓
						</span>{" "}
						Educational Institutions & Administrators
					</li>
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
					href='https://sentrypc.7eer.net/c/5513478/200614/3022'
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
					href='https://sentrypc.7eer.net/c/5513478/200614/3022'
					className='card-cta-button'
				>
					Begin Your SentryPC Journey Today
				</a>
			</section>
		</div>
	);
};

export default SentryPCLanding;
