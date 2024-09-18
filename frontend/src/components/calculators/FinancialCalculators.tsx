import React from "react";
import { RetirementCalculator } from "./RetirementCalculator";
import { MortgageCalculator } from "./MortgageCalculator";
import { CreditCardCalculator } from "./CreditCardCalculator";
import { AutoLoanCalculator } from "./AutoLoanCalculator";
import { SavingsCalculator } from "./SavingsCalculator";
import { LoanPaymentCalculator } from "./LoanPaymentCalculator";
import { TaxCalculator } from "./TaxCalculator";
import AdComponent from "../AdComponent";
import "./FinancialCalculators.css";

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
			<div className='top-banner-container'>
				<a
					href='https://www.amazon.com/amazonprime?primeCampaignId=studentWlpPrimeRedir&linkCode=ll2&tag=dollarsandl0c-20&linkId=879184c8c8106f03c9fbbea8df411e86&language=en_US&ref_=as_li_ss_tl'
					target='_blank'
					rel='noopener noreferrer'
					className='TopBanner'
				>
					<img
						src='/images/shoppinganddeals/amazon-banner.webp'
						alt='Amazon Prime Banner'
						className='TopBannerImage'
					/>
					<button className='topbanner-button'>
						Click Here To Get Your Free Trial
					</button>{" "}
					{/* Updated button name and text */}
				</a>
			</div>
			{calculators.map((CalculatorComponent, i) => (
				<React.Fragment key={i}>
					<div className='calculator-row'>{CalculatorComponent}</div>
					{i > 0 && i % 2 === 1 && (
						<div className='ad-row-container'>
							<AdComponent width={660} height={440} />
						</div>
					)}
					{i % 1 === 0 && (
						<div className='mobile-ad-container'>
							<AdComponent width={320} height={320} />
						</div>
					)}
				</React.Fragment>
			))}
		</div>
	);
};

export default FinancialCalculators;
