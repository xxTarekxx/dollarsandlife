import React, { useState } from "react";

export const MortgageCalculator: React.FC = () => {
	const [mortgageAmount, setMortgageAmount] = useState<string>("");
	const [mortgageInterestRate, setMortgageInterestRate] = useState<string>("");
	const [mortgageTermYears, setMortgageTermYears] = useState<string>("");
	const [mortgageResult, setMortgageResult] = useState<string>("");

	const handleMortgageCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const principal = parseFloat(mortgageAmount || "0");
		const monthlyRate = parseFloat(mortgageInterestRate || "0") / 100 / 12;
		const numberOfPayments = parseFloat(mortgageTermYears || "0") * 12;

		const monthlyPayment =
			(principal * monthlyRate) /
			(1 - Math.pow(1 + monthlyRate, -numberOfPayments));

		// Format the result with commas as needed
		const formattedMonthlyPayment = monthlyPayment.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

		// Update the result in a sentence format with a line break
		setMortgageResult(
			`Your Monthly Payment over ${mortgageTermYears} years with a rate of ${parseFloat(
				mortgageInterestRate,
			).toFixed(2)}% \nis $${formattedMonthlyPayment}/Month.`,
		);
	};

	return (
		<div className='calculator'>
			<h2>Mortgage Calculator</h2>
			<form
				onSubmit={handleMortgageCalculation}
				aria-labelledby='mortgage-calculator'
			>
				<label htmlFor='loan-amount'>
					Loan Amount ($):
					<input
						id='loan-amount'
						type='number'
						value={mortgageAmount}
						onChange={(e) => setMortgageAmount(e.target.value)}
						required
						aria-required='true'
						aria-label='Enter the mortgage loan amount'
						placeholder='e.g., 300000'
					/>
				</label>
				<label htmlFor='interest-rate'>
					Interest Rate (%):
					<input
						id='interest-rate'
						type='number'
						value={mortgageInterestRate}
						onChange={(e) => setMortgageInterestRate(e.target.value)}
						required
						aria-required='true'
						aria-label='Enter the annual interest rate'
						placeholder='e.g., 3.5'
					/>
				</label>
				<label htmlFor='loan-term'>
					Term (Years):
					<input
						id='loan-term'
						type='number'
						value={mortgageTermYears}
						onChange={(e) => setMortgageTermYears(e.target.value)}
						required
						aria-required='true'
						aria-label='Enter the loan term in years'
						placeholder='e.g., 30'
					/>
				</label>
				<button type='submit' aria-label='Calculate mortgage payment'>
					Calculate
				</button>
				{/* Display the result using preformatted text to preserve line breaks */}
				<pre className='result-field' aria-live='polite'>
					{mortgageResult}
				</pre>
			</form>
		</div>
	);
};
