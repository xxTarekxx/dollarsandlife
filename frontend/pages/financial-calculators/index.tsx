import Head from "next/head";
import FinancialCalculators from "../../src/components/calculators/FinancialCalculators";

const FinancialCalculatorsPage = () => {
	return (
		<>
			<Head>
				<title>Financial Calculators | Free Money Tools by Dollars &amp; Life</title>
				<meta
					name='description'
					content='Use our free financial calculators for budgeting, savings, loan repayment, and more. Practical money tools built to help you take control of your finances.'
				/>
				<link rel='canonical' href='https://www.dollarsandlife.com/financial-calculators' />
				<meta property='og:title' content='Financial Calculators | Free Money Tools by Dollars & Life' />
				<meta
					property='og:description'
					content='Use our free financial calculators for budgeting, savings, loan repayment, and more. Practical money tools built to help you take control of your finances.'
				/>
				<meta property='og:url' content='https://www.dollarsandlife.com/financial-calculators' />
				<meta property='og:type' content='website' />
				<meta property='og:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
				<meta name='twitter:card' content='summary_large_image' />
				<meta name='twitter:title' content='Financial Calculators | Free Money Tools by Dollars & Life' />
				<meta
					name='twitter:description'
					content='Use our free financial calculators for budgeting, savings, loan repayment, and more. Practical money tools built to help you take control of your finances.'
				/>
				<meta name='twitter:image' content='https://www.dollarsandlife.com/og-image-homepage.jpg' />
				<script
					type='application/ld+json'
					dangerouslySetInnerHTML={{
						__html: JSON.stringify({
							"@context": "https://schema.org",
							"@type": "WebApplication",
							name: "Financial Calculators | Dollars & Life",
							description: "Free financial calculators for budgeting, savings, loan repayment, and more.",
							url: "https://www.dollarsandlife.com/financial-calculators",
							applicationCategory: "FinanceApplication",
							operatingSystem: "Web",
							publisher: {
								"@type": "Organization",
								name: "Dollars And Life",
								logo: {
									"@type": "ImageObject",
									url: "https://www.dollarsandlife.com/images/website-logo.webp",
								},
							},
						}),
					}}
				/>
			</Head>
			<FinancialCalculators />
		</>
	);
};

export default FinancialCalculatorsPage;
