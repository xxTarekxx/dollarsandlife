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
		{
			component: <NicheProfitCalculator />,
			name: "Niche Profit",
			icon: "💼",
		},
		{
			component: <RetirementCalculator />,
			name: "Retirement",
			icon: "🌴",
		},
		{
			component: <MortgageCalculator />,
			name: "Mortgage",
			icon: "🏠",
		},
		{
			component: <CreditCardCalculator />,
			name: "Credit Card",
			icon: "💳",
		},
		{
			component: <AutoLoanCalculator />,
			name: "Auto Loan",
			icon: "🚗",
		},
		{
			component: <SavingsCalculator />,
			name: "Savings",
			icon: "💰",
		},
		{
			component: <LoanPaymentCalculator />,
			name: "Loan Payment",
			icon: "📊",
		},
		{
			component: <TaxCalculator />,
			name: "Tax",
			icon: "🧾",
		},
	];

	return (
		<div className='financial-calculators-container'>
			<Helmet>
				<title>Modern Financial Calculators | Dollars & Life</title>
				<meta
					name='description'
					content='Beautiful, modern financial calculators for retirement planning, mortgages, loans, and more. Visualize your financial future.'
				/>
				<link
					rel='canonical'
					href='https://www.dollarsandlife.com/financial-calculators'
				/>
			</Helmet>

			<h1>Plan your financial future with our interactive tools</h1>

			<div className='content-wrapper'>
				{calculators.map(({ component, name, icon }, index) => (
					<div
						key={index}
						className='calculator'
						data-calculator={name.toLowerCase()}
					>
						<div className='calculator-header'>
							<h2>
								<span className='calculator-icon'>{icon}</span>
								{name}
							</h2>
						</div>
						{component}
					</div>
				))}
			</div>
		</div>
	);
});

export default FinancialCalculators;
