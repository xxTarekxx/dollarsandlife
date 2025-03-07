import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async"; // For SEO
import "../AdComponent.css";
import "./FinancialCalculators.css";
import { AutoLoanCalculator } from "./AutoLoanCalculator";
import { CreditCardCalculator } from "./CreditCardCalculator";
import { LoanPaymentCalculator } from "./LoanPaymentCalculator";
import { MortgageCalculator } from "./MortgageCalculator";
import { RetirementCalculator } from "./RetirementCalculator";
import { SavingsCalculator } from "./SavingsCalculator";
import { TaxCalculator } from "./TaxCalculator";

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

const FinancialCalculators: React.FC = () => {
	// Delay AdSense script execution to ensure ads render properly
	useEffect(() => {
		setTimeout(() => {
			const adContainers = document.querySelectorAll(".postings-container");
			let adsPushed = false;
			adContainers.forEach((adContainer) => {
				const container = adContainer as HTMLElement;
				if (container.offsetWidth > 0 && container.offsetHeight > 0) {
					if (!adsPushed) {
						console.log("Pushing AdSense ads...");
						(window.adsbygoogle = window.adsbygoogle || []).push({});
						adsPushed = true;
					}
				}
			});
		}, 2000);
	}, []);

	const calculators = [
		<RetirementCalculator />,
		<MortgageCalculator />,
		<CreditCardCalculator />,
		<AutoLoanCalculator />,
		<SavingsCalculator />,
		<LoanPaymentCalculator />,
		<TaxCalculator />,
	];

	return (
		<div className='financial-calculators-container'>
			{/* SEO Metadata with Helmet */}
			<Helmet>
				<title>Financial Calculators - Plan & Manage Your Money</title>
				<meta
					name='description'
					content='Use our financial calculators for retirement, mortgages, loans, credit cards, and savings. Plan your financial future with accurate calculations.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/financial-calculators'
				/>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebPage",
						name: "Financial Calculators - Plan & Manage Your Money",
						url: "https://www.dollarsandlife.com/financial-calculators",
						description:
							"Use our financial calculators for retirement, mortgages, loans, credit cards, and savings. Plan your financial future with accurate calculations.",
						publisher: {
							"@type": "Organization",
							name: "Dollars & Life",
							logo: {
								"@type": "ImageObject",
								url: "/images/favicon/favicon.webp",
							},
						},
					})}
				</script>
			</Helmet>

			<h1>Financial Calculators</h1>

			{/* Top Banner Ad */}
			<div className='top-banner-container'>
				<a
					href='https://lycamobileusa.sjv.io/c/5513478/2107177/25589'
					target='_blank'
					rel='noopener noreferrer'
					className='TopBanner'
				>
					<img
						src='/images/shoppinganddeals/Lyca-Mobile-728x90.webp'
						alt='Lyca Mobile Banner - Affordable International Calling'
						className='TopBannerImage'
						loading='eager'
					/>
				</a>
			</div>

			{/* Financial Calculators List */}
			<div className='content-wrapper'>
				{calculators.map((CalculatorComponent, i) => (
					<React.Fragment key={i}>
						<div className='calculator-row'>{CalculatorComponent}</div>

						{/* Insert an AdSense ad after every two calculators */}
						{i > 0 && i % 2 === 1 && (
							<div className='postings-container'>
								<ins
									className='adsbygoogle'
									style={{
										display: "block",
										width: "300px",
										height: "250px",
									}}
									data-ad-client='ca-pub-1079721341426198'
									data-ad-slot='7197282987'
									data-ad-format='auto'
									data-full-width-responsive='true'
								></ins>
								<script
									dangerouslySetInnerHTML={{
										__html:
											"(adsbygoogle = window.adsbygoogle || []).push({});",
									}}
								/>
							</div>
						)}
					</React.Fragment>
				))}
			</div>
		</div>
	);
};

export default FinancialCalculators;
