"use client";
import Head from "next/head";
import React from "react";
import styles from "./privacy-policy.module.css";

const PrivacyPolicy: React.FC = () => {
	return (
		<>
			<Head>
				<title>Privacy Policy - Dollars And Life</title>
				<meta
					name='description'
					content='Read our Privacy Policy, including information on data collection, usage, advertisements, and user rights.'
				/>
				<meta property='og:title' content='Privacy Policy - Dollars And Life' />
				<meta
					property='og:description'
					content='Read our Privacy Policy, including information on data collection, usage, advertisements, and user rights.'
				/>
				<meta
					property='og:url'
					content='https://www.dollarsandlife.com/privacy-policy'
				/>
				<meta property='og:type' content='article' />
				<meta name='robots' content='index, follow' />

				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "Article",
							headline: "Privacy Policy - Dollars And Life",
							description:
								"Read our Privacy Policy, including information on data collection, usage, advertisements, and user rights.",
							publisher: {
								"@type": "Organization",
								name: "Dollars And Life",
								logo: {
									"@type": "ImageObject",
									url: "/images/website-logo.webp",
								},
							},
							url: "https://www.dollarsandlife.com/privacy-policy",
						}),
					}}
				/>

				<meta name='robots' content='index, follow' />
			</Head>

			<main className={styles.privacyPolicyContent} role='main'>
				<h1>Privacy Policy</h1>

				<section className='content-section'>
					<p>
						<strong>Dollars And Life</strong> ("we," "us," "our") is committed
						to protecting your privacy. By using{" "}
						<a href='https://www.dollarsandlife.com'>www.dollarsandlife.com</a>,
						you agree to the terms outlined in this Privacy Policy.
					</p>

					<h2>Information We Collect</h2>
					<p>
						We may collect personal information and usage data through cookies,
						Google Analytics, and AdSense to enhance user experience and
						advertising.
					</p>

					<h2>How We Use Your Information</h2>
					<p>
						Your information helps us improve website functionality, provide
						targeted ads, and analyze user interactions.
					</p>

					<h2>Advertising and Cookies</h2>
					<p>
						We use cookies and similar technologies. To opt-out of personalized
						advertising, please visit{" "}
						<a
							href='https://adssettings.google.com'
							target='_blank'
							rel='noopener noreferrer'
						>
							Google Ads Settings
						</a>
						.
					</p>

					<h2>User Rights</h2>
					<p>
						Depending on your jurisdiction, you have rights under GDPR, CCPA, or
						similar privacy regulations to access or delete your information.
					</p>

					<h2>Changes to This Policy</h2>
					<p>
						We may update this Privacy Policy periodically. Please check this
						page regularly to stay informed.
					</p>

					<h2>Contact Us</h2>
					<p>
						For privacy-related inquiries, email us at{" "}
						<a href='mailto:contact@dollarsandlife.com'>
							contact@dollarsandlife.com
						</a>{" "}
						or mail us at Texas Connect LLC.
					</p>
				</section>
			</main>
		</>
	);
};

export default PrivacyPolicy;
