"use client";
import Head from "next/head";
import React, { useMemo } from "react";
import { usePageCanonical } from "@/hooks/usePageCanonical";
import { useLangFromPath } from "@/hooks/usePageCanonical";
import { PRIVACY_PAGE_CONTENT, resolveLegalLang } from "@/lib/i18n/legal-page-content";
import styles from "./privacy-policy.module.css";

const PrivacyPolicy: React.FC = () => {
	const canonical = usePageCanonical();
	const langFromPath = useLangFromPath();
	const lang = resolveLegalLang(langFromPath);
	const copy = PRIVACY_PAGE_CONTENT[lang];
	const schemaJson = useMemo(
		() =>
			JSON.stringify({
				"@context": "https://schema.org",
				"@type": "WebPage",
				name: copy.seoTitle,
				description: copy.seoDescription,
				publisher: {
					"@type": "Organization",
					name: "Dollars & Life",
					logo: {
						"@type": "ImageObject",
						url: "https://www.dollarsandlife.com/images/website-logo.webp",
					},
				},
				url: canonical,
			}),
		[canonical, copy.seoDescription, copy.seoTitle],
	);

	return (
		<>
			<Head>
				<title>{copy.seoTitle}</title>
				<meta name='description' content={copy.seoDescription} />
				<link rel='canonical' href={canonical} />
				<meta property='og:title' content={copy.seoTitle} />
				<meta property='og:description' content={copy.seoDescription} />
				<meta property='og:url' content={canonical} />
				<meta property='og:type' content='article' />
				<meta property='og:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:title' content={copy.seoTitle} />
				<meta name='twitter:description' content={copy.seoDescription} />
				<meta name='twitter:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
				<meta name='robots' content='index, follow' />

				<script type='application/ld+json' dangerouslySetInnerHTML={{ __html: schemaJson }} />
			</Head>

			<main className={styles.privacyPolicyContent} role='main'>
				<h1>{copy.title}</h1>

				<section className='content-section'>
					<p>
						{copy.intro}
					</p>

					{copy.sections.map((section) => (
						<React.Fragment key={section.heading}>
							<h2>{section.heading}</h2>
							<p>{section.text}</p>
						</React.Fragment>
					))}

					<h2>Contact</h2>
					<p>
						{copy.contact}
					</p>
				</section>
			</main>
		</>
	);
};

export default PrivacyPolicy;
