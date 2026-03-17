import Head from "next/head";
import React, { memo } from "react";
import { AutoLoanCalculator } from "./AutoLoanCalculator";
import { CreditCardCalculator } from "./CreditCardCalculator";
import { LoanPaymentCalculator } from "./LoanPaymentCalculator";
import { MortgageCalculator } from "./MortgageCalculator";
import { NicheProfitCalculator } from "./NicheProfitCalculator";
import { RetirementCalculator } from "./RetirementCalculator";
import { SavingsCalculator } from "./SavingsCalculator";
import { TaxCalculator } from "./TaxCalculator";

const FinancialCalculators: React.FC = memo(() => {
	const calculators = [
		{ component: <NicheProfitCalculator />, name: "Niche Profit", icon: "💼" },
		{ component: <RetirementCalculator />, name: "Retirement", icon: "🌴" },
		{ component: <MortgageCalculator />, name: "Mortgage", icon: "🏠" },
		{ component: <CreditCardCalculator />, name: "Credit Card", icon: "💳" },
		{ component: <AutoLoanCalculator />, name: "Auto Loan", icon: "🚗" },
		{ component: <SavingsCalculator />, name: "Savings", icon: "💰" },
		{ component: <LoanPaymentCalculator />, name: "Loan Payment", icon: "📊" },
		{ component: <TaxCalculator />, name: "Tax", icon: "🧾" },
	];

	return (
		<div className="financial-calculators-container">
			<Head>
				<title>Modern Financial Calculators | Dollars & Life</title>
				<meta name="description" content="Free interactive financial calculators for retirement planning, mortgages, loans, savings, and more." />
				<link rel="canonical" href="https://www.dollarsandlife.com/financial-calculators" />
			</Head>

			<div className="section-hero">
				<p className="section-hero-eyebrow">Free Tools</p>
				<h1 className="section-hero-title">
					Financial <span>Calculators</span>
				</h1>
				<p className="section-hero-sub">
					Plan your savings, retirement, loans, and more with our free
					interactive money tools — no sign-up required.
				</p>
			</div>

			<div className="calc-grid">
				{calculators.map(({ component, name, icon }, index) => (
					<div key={index} className="calc-card" data-calculator={name.toLowerCase()}>
						<div className="calc-card-header">
							<div className="calc-icon-badge">{icon}</div>
							<h2>{name}</h2>
						</div>
						<div className="calc-card-body">
							{component}
						</div>
					</div>
				))}
			</div>
		</div>
	);
});

export default FinancialCalculators;
