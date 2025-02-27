import React from "react";
import { Helmet } from "react-helmet-async"; // For SEO
import AdComponent from "../AdComponent";
import { AutoLoanCalculator } from "./AutoLoanCalculator";
import { CreditCardCalculator } from "./CreditCardCalculator";
import "./FinancialCalculators.css";
import { LoanPaymentCalculator } from "./LoanPaymentCalculator";
import { MortgageCalculator } from "./MortgageCalculator";
import { RetirementCalculator } from "./RetirementCalculator";
import { SavingsCalculator } from "./SavingsCalculator";
import { TaxCalculator } from "./TaxCalculator";

const FinancialCalculators: React.FC = () => {
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
			{/* SEO and Meta tags with Helmet */}
			<Helmet>
				<title>Financial Calculators - Dollars And Life</title>
				<meta
					name='description'
					content='Access a variety of financial calculators for retirement, mortgage, credit cards, loans, and more to help manage your finances effectively.'
				/>
			</Helmet>

			{/* Main Heading (h1) */}
			<h1>Financial Calculators</h1>

			{/* Top Banner Advertisement */}
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

			{/* Map over calculators and display */}
			{calculators.map((CalculatorComponent, i) => (
				<React.Fragment key={i}>
					<div className='calculator-row'>{CalculatorComponent}</div>

					{/* Insert a large ad after every two calculators */}
					{i > 0 && i % 2 === 1 && (
						<div className='postings-row-container'>
							<AdComponent width={660} height={440} />
						</div>
					)}

					{/* Insert a mobile-friendly ad after each calculator */}
					{i % 1 === 0 && (
						<div className='mobile-postings-container'>
							<AdComponent width={320} height={320} />
						</div>
					)}
				</React.Fragment>
			))}
		</div>
	);
};

export default FinancialCalculators;
