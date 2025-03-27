import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import "../AdComponent.css";
import "./FinancialCalculators.css";
import { AutoLoanCalculator } from "./AutoLoanCalculator";
import { CreditCardCalculator } from "./CreditCardCalculator";
import { LoanPaymentCalculator } from "./LoanPaymentCalculator";
import { MortgageCalculator } from "./MortgageCalculator";
import { RetirementCalculator } from "./RetirementCalculator";
import { SavingsCalculator } from "./SavingsCalculator";
import { TaxCalculator } from "./TaxCalculator";
import { NicheProfitCalculator } from "./NicheProfitCalculator";

declare global {
	interface Window {
		adsbygoogle: any;
	}
}

const FinancialCalculators: React.FC = () => {
	//  Push AdSense ads after adsbygoogle.js is loaded
	useEffect(() => {
		if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
			try {
				window.adsbygoogle.push({});
			} catch (e) {
				console.error("Adsense Error:", e);
			}
		}
	}, []);

	const calculators = [
		<NicheProfitCalculator />,
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
								/>
							</div>
						)}
					</React.Fragment>
				))}
			</div>

			{/* Bottom Banner Ad */}
			<div className='postings-container'>
				<ins
					className='adsbygoogle-banner'
					style={{
						display: "block",
						width: "728px",
						height: "90px",
					}}
					data-ad-client='ca-pub-1079721341426198'
					data-ad-slot='6375155907'
					data-ad-format='horizontal'
					data-full-width-responsive='true'
				/>
			</div>
		</div>
	);
};

export default FinancialCalculators;
