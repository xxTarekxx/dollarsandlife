import React, { useState } from "react";
import "./FinancialCalculators.css";
import AdComponent from "./AdComponent";

const FinancialCalculators: React.FC = () => {
	// State for various calculators
	const [retirementSavings, setRetirementSavings] = useState<number>(0);
	const [annualContribution, setAnnualContribution] = useState<number>(0);
	const [yearsToRetirement, setYearsToRetirement] = useState<number>(0);
	const [retirementRateOfReturn, setRetirementRateOfReturn] =
		useState<number>(0);
	const [retirementResult, setRetirementResult] = useState<string>("");

	const [mortgageAmount, setMortgageAmount] = useState<number>(0);
	const [mortgageInterestRate, setMortgageInterestRate] = useState<number>(0);
	const [mortgageTermYears, setMortgageTermYears] = useState<number>(0);
	const [mortgageResult, setMortgageResult] = useState<string>("");

	const [creditCardBalance, setCreditCardBalance] = useState<number>(0);
	const [creditCardInterestRate, setCreditCardInterestRate] =
		useState<number>(0);
	const [monthlyPayment, setMonthlyPayment] = useState<number>(0);
	const [creditCardResult, setCreditCardResult] = useState<string>("");

	const [autoLoanAmount, setAutoLoanAmount] = useState<number>(0);
	const [autoLoanRate, setAutoLoanRate] = useState<number>(0);
	const [autoLoanTerm, setAutoLoanTerm] = useState<number>(0);
	const [autoLoanResult, setAutoLoanResult] = useState<string>("");

	const [savingsPrincipal, setSavingsPrincipal] = useState<number>(0);
	const [savingsRate, setSavingsRate] = useState<number>(0);
	const [savingsYears, setSavingsYears] = useState<number>(0);
	const [savingsResult, setSavingsResult] = useState<string>("");

	const [investmentPrincipal, setInvestmentPrincipal] = useState<number>(0);
	const [investmentRate, setInvestmentRate] = useState<number>(0);
	const [investmentYears, setInvestmentYears] = useState<number>(0);
	const [investmentResult, setInvestmentResult] = useState<string>("");

	const [loanAmount, setLoanAmount] = useState<number>(0);
	const [loanInterestRate, setLoanInterestRate] = useState<number>(0);
	const [loanTerm, setLoanTerm] = useState<number>(0);
	const [loanResult, setLoanResult] = useState<string>("");

	const [taxableIncome, setTaxableIncome] = useState<number>(0);
	const [taxRate, setTaxRate] = useState<number>(0);
	const [taxResult, setTaxResult] = useState<string>("");

	const [infiniteBankingAmount, setInfiniteBankingAmount] = useState<number>(0);
	const [infiniteBankingRate, setInfiniteBankingRate] = useState<number>(0);
	const [infiniteBankingYears, setInfiniteBankingYears] = useState<number>(0);
	const [infiniteBankingResult, setInfiniteBankingResult] =
		useState<string>("");

	// Calculation functions for each calculator
	const handleRetirementCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const futureValue =
			retirementSavings *
				Math.pow(1 + retirementRateOfReturn / 100, yearsToRetirement) +
			annualContribution *
				((Math.pow(1 + retirementRateOfReturn / 100, yearsToRetirement) - 1) /
					(retirementRateOfReturn / 100));
		setRetirementResult(`Total Retirement Savings: $${futureValue.toFixed(2)}`);
	};

	const handleMortgageCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const monthlyRate = mortgageInterestRate / 100 / 12;
		const numberOfPayments = mortgageTermYears * 12;
		const monthlyPayment =
			(mortgageAmount * monthlyRate) /
			(1 - Math.pow(1 + monthlyRate, -numberOfPayments));
		setMortgageResult(
			`Monthly Mortgage Payment: $${monthlyPayment.toFixed(2)}`,
		);
	};

	const handleCreditCardCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const monthsToPayoff =
			Math.log(
				monthlyPayment /
					(monthlyPayment -
						creditCardBalance * (creditCardInterestRate / 100 / 12)),
			) / Math.log(1 + creditCardInterestRate / 100 / 12);
		setCreditCardResult(
			`Months to Pay Off Debt: ${monthsToPayoff.toFixed(1)} months`,
		);
	};

	const handleAutoLoanCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const monthlyRate = autoLoanRate / 100 / 12;
		const numberOfPayments = autoLoanTerm * 12;
		const monthlyPayment =
			(autoLoanAmount * monthlyRate) /
			(1 - Math.pow(1 + monthlyRate, -numberOfPayments));
		setAutoLoanResult(
			`Monthly Auto Loan Payment: $${monthlyPayment.toFixed(2)}`,
		);
	};

	const handleSavingsCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const futureValue =
			savingsPrincipal * Math.pow(1 + savingsRate / 100, savingsYears);
		setSavingsResult(`Future Value of Savings: $${futureValue.toFixed(2)}`);
	};

	const handleInvestmentCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const futureValue =
			investmentPrincipal * Math.pow(1 + investmentRate / 100, investmentYears);
		setInvestmentResult(
			`Future Value of Investment: $${futureValue.toFixed(2)}`,
		);
	};

	const handleLoanCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const monthlyRate = loanInterestRate / 100 / 12;
		const numberOfPayments = loanTerm * 12;
		const monthlyPayment =
			(loanAmount * monthlyRate) /
			(1 - Math.pow(1 + monthlyRate, -numberOfPayments));
		setLoanResult(`Monthly Loan Payment: $${monthlyPayment.toFixed(2)}`);
	};

	const handleTaxCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const taxOwed = taxableIncome * (taxRate / 100);
		setTaxResult(`Total Tax Owed: $${taxOwed.toFixed(2)}`);
	};

	const handleInfiniteBankingCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const futureValue =
			infiniteBankingAmount *
			Math.pow(1 + infiniteBankingRate / 100, infiniteBankingYears);
		setInfiniteBankingResult(
			`Future Value for Infinite Banking: $${futureValue.toFixed(2)}`,
		);
	};

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
			<div className='calculator-row'>
				{/* Retirement Calculator */}
				<div className='calculator'>
					<h2>Retirement Calculator</h2>
					<form onSubmit={handleRetirementCalculation}>
						<label>
							Current Savings ($):
							<input
								type='number'
								min=''
								step='0.01'
								value={retirementSavings}
								onChange={(e) => setRetirementSavings(Number(e.target.value))}
							/>
						</label>
						<label>
							Annual Contribution ($):
							<input
								type='number'
								min='0'
								step='0.01'
								value={annualContribution}
								onChange={(e) => setAnnualContribution(Number(e.target.value))}
							/>
						</label>
						<label>
							Years to Retirement:
							<input
								type='number'
								min='0'
								step='1'
								value={yearsToRetirement}
								onChange={(e) => setYearsToRetirement(Number(e.target.value))}
							/>
						</label>
						<label>
							Expected Rate of Return (%):
							<input
								type='number'
								min='0'
								step='0.01'
								value={retirementRateOfReturn}
								onChange={(e) =>
									setRetirementRateOfReturn(Number(e.target.value))
								}
							/>
						</label>
						<button type='submit'>Calculate</button>
						<div className='result-field'>{retirementResult}</div>
					</form>
				</div>
				<div className='ad-container'>
					<AdComponent width={300} height={600} />
				</div>
				{/* Mortgage Calculator */}
				<div className='calculator'>
					<h2>Mortgage Calculator</h2>
					<form onSubmit={handleMortgageCalculation}>
						<label>
							Loan Amount ($):
							<input
								type='number'
								min='0'
								step='0.01'
								value={mortgageAmount}
								onChange={(e) => setMortgageAmount(Number(e.target.value))}
							/>
						</label>
						<label>
							Interest Rate (%):
							<input
								type='number'
								min='0'
								step='0.01'
								value={mortgageInterestRate}
								onChange={(e) =>
									setMortgageInterestRate(Number(e.target.value))
								}
							/>
						</label>
						<label>
							Term (Years):
							<input
								type='number'
								min='0'
								step='1'
								value={mortgageTermYears}
								onChange={(e) => setMortgageTermYears(Number(e.target.value))}
							/>
						</label>
						<button type='submit'>Calculate</button>
						<div className='result-field'>{mortgageResult}</div>
					</form>
				</div>
			</div>

			<div className='ad-container'>
				<AdComponent width={728} height={90} />
			</div>

			<div className='calculator-row'>
				{/* Credit Card & Debt Payoff Calculator */}
				<div className='calculator'>
					<h2>Credit Card & Debt Payoff Calculator</h2>
					<form onSubmit={handleCreditCardCalculation}>
						<label>
							Outstanding Balance ($):
							<input
								type='number'
								min='0'
								step='0.01'
								value={creditCardBalance}
								onChange={(e) => setCreditCardBalance(Number(e.target.value))}
							/>
						</label>
						<label>
							Interest Rate (%):
							<input
								type='number'
								min='0'
								step='0.01'
								value={creditCardInterestRate}
								onChange={(e) =>
									setCreditCardInterestRate(Number(e.target.value))
								}
							/>
						</label>
						<label>
							Monthly Payment ($):
							<input
								type='number'
								min='0'
								step='0.01'
								value={monthlyPayment}
								onChange={(e) => setMonthlyPayment(Number(e.target.value))}
							/>
						</label>
						<button type='submit'>Calculate</button>
						<div className='result-field'>{creditCardResult}</div>
					</form>
				</div>
				<div className='ad-container'>
					<AdComponent width={400} height={400} />
				</div>
				{/* Auto Loan Calculator */}
				<div className='calculator'>
					<h2>Auto Loan Calculator</h2>
					<form onSubmit={handleAutoLoanCalculation}>
						<label>
							Loan Amount ($):
							<input
								type='number'
								min='0'
								step='0.01'
								value={autoLoanAmount}
								onChange={(e) => setAutoLoanAmount(Number(e.target.value))}
							/>
						</label>
						<label>
							Interest Rate (%):
							<input
								type='number'
								min='0'
								step='0.01'
								value={autoLoanRate}
								onChange={(e) => setAutoLoanRate(Number(e.target.value))}
							/>
						</label>
						<label>
							Term (Years):
							<input
								type='number'
								min='0'
								step='1'
								value={autoLoanTerm}
								onChange={(e) => setAutoLoanTerm(Number(e.target.value))}
							/>
						</label>
						<button type='submit'>Calculate</button>
						<div className='result-field'>{autoLoanResult}</div>
					</form>
				</div>
			</div>

			<div className='ad-container'>
				<AdComponent width={728} height={90} />
			</div>

			<div className='calculator-row'>
				{/* Savings Calculator */}
				<div className='calculator'>
					<h2>Savings Calculator</h2>
					<form onSubmit={handleSavingsCalculation}>
						<label>
							Principal Amount ($):
							<input
								type='number'
								min='0'
								step='0.01'
								value={savingsPrincipal}
								onChange={(e) => setSavingsPrincipal(Number(e.target.value))}
							/>
						</label>
						<label>
							Interest Rate (%):
							<input
								type='number'
								min='0'
								step='0.01'
								value={savingsRate}
								onChange={(e) => setSavingsRate(Number(e.target.value))}
							/>
						</label>
						<label>
							Time (Years):
							<input
								type='number'
								min='0'
								step='1'
								value={savingsYears}
								onChange={(e) => setSavingsYears(Number(e.target.value))}
							/>
						</label>
						<button type='submit'>Calculate</button>
						<div className='result-field'>{savingsResult}</div>
					</form>
				</div>
				<div className='ad-container'>
					<AdComponent width={400} height={400} />
				</div>
				{/* Investment Calculator */}
				<div className='calculator'>
					<h2>Investment Calculator</h2>
					<form onSubmit={handleInvestmentCalculation}>
						<label>
							Principal Amount ($):
							<input
								type='number'
								min='0'
								step='0.01'
								value={investmentPrincipal}
								onChange={(e) => setInvestmentPrincipal(Number(e.target.value))}
							/>
						</label>
						<label>
							Interest Rate (%):
							<input
								type='number'
								min='0'
								step='0.01'
								value={investmentRate}
								onChange={(e) => setInvestmentRate(Number(e.target.value))}
							/>
						</label>
						<label>
							Time (Years):
							<input
								type='number'
								min='0'
								step='1'
								value={investmentYears}
								onChange={(e) => setInvestmentYears(Number(e.target.value))}
							/>
						</label>
						<button type='submit'>Calculate</button>
						<div className='result-field'>{investmentResult}</div>
					</form>
				</div>
			</div>

			<div className='ad-container'>
				<AdComponent width={300} height={600} />
			</div>

			<div className='calculator-row'>
				{/* Loan Payment Calculator */}
				<div className='calculator'>
					<h2>Loan Payment Calculator</h2>
					<form onSubmit={handleLoanCalculation}>
						<label>
							Loan Amount ($):
							<input
								type='number'
								min='0'
								step='0.01'
								value={loanAmount}
								onChange={(e) => setLoanAmount(Number(e.target.value))}
							/>
						</label>
						<label>
							Interest Rate (%):
							<input
								type='number'
								min='0'
								step='0.01'
								value={loanInterestRate}
								onChange={(e) => setLoanInterestRate(Number(e.target.value))}
							/>
						</label>
						<label>
							Term (Years):
							<input
								type='number'
								min='0'
								step='1'
								value={loanTerm}
								onChange={(e) => setLoanTerm(Number(e.target.value))}
							/>
						</label>
						<button type='submit'>Calculate</button>
						<div className='result-field'>{loanResult}</div>
					</form>
				</div>
				<div className='ad-container'>
					<AdComponent width={728} height={90} />
				</div>
				{/* Tax Calculator */}
				<div className='calculator'>
					<h2>Tax Calculator</h2>
					<form onSubmit={handleTaxCalculation}>
						<label>
							Taxable Income ($):
							<input
								type='number'
								min='0'
								step='0.01'
								value={taxableIncome}
								onChange={(e) => setTaxableIncome(Number(e.target.value))}
							/>
						</label>
						<label>
							Tax Rate (%):
							<input
								type='number'
								min='0'
								step='0.01'
								value={taxRate}
								onChange={(e) => setTaxRate(Number(e.target.value))}
							/>
						</label>
						<button type='submit'>Calculate</button>
						<div className='result-field'>{taxResult}</div>
					</form>
				</div>
			</div>

			<div className='ad-container'>
				<AdComponent width={730} height={600} />
			</div>

			<div className='calculator-row'>
				{/* Infinite Banking Concept Calculator */}
				<div className='calculator'>
					<h2>Infinite Banking Concept Calculator</h2>
					<form onSubmit={handleInfiniteBankingCalculation}>
						<label>
							Amount ($):
							<input
								type='number'
								min='0'
								step='0.01'
								value={infiniteBankingAmount}
								onChange={(e) =>
									setInfiniteBankingAmount(Number(e.target.value))
								}
							/>
						</label>
						<label>
							Interest Rate (%):
							<input
								type='number'
								min='0'
								step='0.01'
								value={infiniteBankingRate}
								onChange={(e) => setInfiniteBankingRate(Number(e.target.value))}
							/>
						</label>
						<label>
							Time (Years):
							<input
								type='number'
								min='0'
								step='1'
								value={infiniteBankingYears}
								onChange={(e) =>
									setInfiniteBankingYears(Number(e.target.value))
								}
							/>
						</label>
						<button type='submit'>Calculate</button>
						<div className='result-field'>{infiniteBankingResult}</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default FinancialCalculators;
