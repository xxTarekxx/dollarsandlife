"use client";
import Head from "next/head"; // Import Head for SEO
import React from "react";
import styles from "./terms-of-service.module.css";

const TermsOfService: React.FC = () => {
	return (
		<>
			{/* SEO: Head for metadata */}
			<Head>
				<title>Terms of Service - Dollars And Life</title>
				<meta
					name='description'
					content='Read the terms of service for Dollars And Life, including information on affiliate links, disclaimers, and legal agreements.'
				/>
				<meta
					property='og:title'
					content='Terms of Service - Dollars And Life'
				/>
				<meta
					property='og:description'
					content='Read the terms of service for Dollars And Life, including information on affiliate links, disclaimers, and legal agreements.'
				/>
				<meta
					property='og:url'
					content='https://www.dollarsandlife.com/terms-of-service'
				/>
				<meta property='og:type' content='article' />
				<meta name='robots' content='index, follow' />

				{/* Schema Markup for SEO */}
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebPage",
							name: "Terms of Service - Dollars And Life",
							description:
								"Read the terms of service for Dollars And Life, including information on affiliate links, disclaimers, and legal agreements.",
							publisher: {
								"@type": "Organization",
								name: "Dollars And Life",
								logo: {
									"@type": "ImageObject",
									url: "/images/website-logo.webp",
								},
							},
							url: "https://www.dollarsandlife.com/terms-of-service",
						}),
					}}
				/>
			</Head>

			{/* Main Content */}
			<main className={styles.termsOfServiceContent} role='main'>
				<h1>Terms of Service</h1>

				<section className='content-section'>
					<p>
						<strong>Dollars And Life</strong> is owned and operated by Texas
						Connect LLC ("we," "us," or "our"). By accessing or using our
						website, you agree to comply with and be bound by these Terms of
						Use.
					</p>

					<h2>Acceptance of Terms</h2>
					<p>
						By using{" "}
						<a href='https://www.dollarsandlife.com'>www.dollarsandlife.com</a>,
						you agree to these Terms of Use and our{" "}
						<a href='/privacy-policy'>Privacy Policy</a>. If you do not agree,
						please discontinue use.
					</p>

					<h2>Changes to Terms</h2>
					<p>
						We reserve the right to modify these Terms at any time. Changes will
						take effect immediately upon posting.
					</p>

					<h2>Use of the Site</h2>
					<p>
						Users must only use this site for lawful purposes and must not
						engage in activities that may cause harm to the website or other
						users.
					</p>

					<h2>FTC Disclosure and Affiliate Marketing</h2>
					<p>
						We may participate in affiliate marketing programs. Clicking on some
						links may earn us a commission at no extra cost to you.
					</p>

					<h2>Disclaimer</h2>
					<p>
						All information on this website is provided for informational
						purposes only. We do not guarantee accuracy or completeness.
					</p>

					<h2>Limitation of Liability</h2>
					<p>
						To the fullest extent permitted by law, Texas Connect LLC disclaims
						all warranties related to this site.
					</p>

					<h2>Indemnification</h2>
					<p>
						Users agree to indemnify Texas Connect LLC from all claims, damages,
						and expenses resulting from misuse of this site.
					</p>

					<h2>Governing Law</h2>
					<p>These Terms are governed by the laws of the State of Texas.</p>

					<h2>Contact Information</h2>
					<p>
						For questions, contact us at{" "}
						<a href='mailto:contact@dollarsandlife.com'>
							contact@dollarsandlife.com
						</a>{" "}
						or mail us at:
					</p>
					<p>
						Texas Connect LLC, 4364 Western Center Blvd, #2296, Fort Worth, TX
						76137
					</p>
				</section>
			</main>
		</>
	);
};

export default TermsOfService;
