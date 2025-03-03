import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async"; // For SEO
import "./FinancialCalculators.css";
import "../AdComponent.css";
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
	// Push ads after a delay, ensuring the ad container has nonzero dimensions.
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
			<Helmet>
				<title>Financial Calculators - Dollars And Life</title>
				<meta
					name='description'
					content='Access a variety of financial calculators for retirement, mortgage, credit cards, loans, and more to help manage your finances effectively.'
				/>
			</Helmet>

			<h1>Financial Calculators</h1>

			<div className='top-banner-container'>
				<a
					href='https://www.amazon.com/amazonprime?primeCampaignId=studentWlpPrimeRedir&linkCode=ll2&tag=dollarsandl02-20&linkId=879184c8c8106f03c9fbbea8df411e86&language=en_US&ref_=as_li_ss_tl'
					target='_blank'
					rel='noopener noreferrer'
					className='TopBanner'
				>
					<img
						src='/images/shoppinganddeals/amazon-banner.webp'
						alt='Amazon Prime Banner'
						className='TopBannerImage'
					/>
					<button className='topbanner-button'>Free Trial</button>
				</a>
			</div>

			{calculators.map((CalculatorComponent, i) => (
				<React.Fragment key={i}>
					<div className='calculator-row'>{CalculatorComponent}</div>

					{/* Insert an ad only after every two calculators */}
					{i > 0 && i % 2 === 1 && (
						<div
							className='postings-container'
							style={{
								display: "flex",
								justifyContent: "center",
								width: "300px",
								height: "250px",
								margin: "20px 0",
							}}
						>
							<ins
								className='adsbygoogle'
								style={{
									display: "block",
									width: "300px",
									height: "250px",
									minWidth: "300px",
									minHeight: "250px",
								}}
								data-ad-client='ca-pub-2295073683044412'
								data-ad-slot='9380614635'
								data-ad-format='rectangle'
								data-full-width-responsive='false'
							/>
						</div>
					)}
				</React.Fragment>
			))}
		</div>
	);
};

export default FinancialCalculators;
