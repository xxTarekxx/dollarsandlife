import React, { memo } from "react";
import { Helmet } from "react-helmet-async";
import "./FinancialCalculators.css";
import { AutoLoanCalculator } from "./AutoLoanCalculator";
import { CreditCardCalculator } from "./CreditCardCalculator";
import { LoanPaymentCalculator } from "./LoanPaymentCalculator";
import { MortgageCalculator } from "./MortgageCalculator";
import { RetirementCalculator } from "./RetirementCalculator";
import { SavingsCalculator } from "./SavingsCalculator";
import { TaxCalculator } from "./TaxCalculator";
import { NicheProfitCalculator } from "./NicheProfitCalculator";

const FinancialCalculators: React.FC = memo(() => {
	const calculators = [
		{ component: <NicheProfitCalculator />, name: "Niche Profit" },
		{ component: <RetirementCalculator />, name: "Retirement" },
		{ component: <MortgageCalculator />, name: "Mortgage" },
		{ component: <CreditCardCalculator />, name: "Credit Card" },
		{ component: <AutoLoanCalculator />, name: "Auto Loan" },
		{ component: <SavingsCalculator />, name: "Savings" },
		{ component: <LoanPaymentCalculator />, name: "Loan Payment" },
		{ component: <TaxCalculator />, name: "Tax" },
	];

	return (
		<div className='financial-calculators-container'>
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
			</Helmet>

			<h1>Financial Calculators</h1>

			<div className='top-banner-container'>
				<a
					href='https://lycamobileusa.sjv.io/c/5513478/2107177/25589'
					target='_blank'
					rel='noopener noreferrer'
					className='TopBanner'
				>
					<img
						src='/images/shoppinganddeals/Lyca-Mobile-728x90.webp'
						alt='Lyca Mobile Banner'
						className='TopBannerImage'
						loading='eager'
					/>
				</a>
			</div>

			<div className='content-wrapper'>
				{calculators.map(({ component }, index) => (
					<div key={index} className='calculator'>
						{component}
					</div>
				))}
			</div>
		</div>
	);
});

export default FinancialCalculators;
