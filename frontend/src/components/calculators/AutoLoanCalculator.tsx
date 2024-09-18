import React, { useState } from "react";

export const AutoLoanCalculator: React.FC = () => {
	const [autoLoanAmount, setAutoLoanAmount] = useState<string>("");
	const [autoLoanRate, setAutoLoanRate] = useState<string>("");
	const [autoLoanTerm, setAutoLoanTerm] = useState<string>("");
	const [autoLoanResult, setAutoLoanResult] = useState<string>("");

	const handleAutoLoanCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const principal = parseFloat(autoLoanAmount || "0");
		const monthlyRate = parseFloat(autoLoanRate || "0") / 100 / 12;
		const numberOfPayments = parseFloat(autoLoanTerm || "0") * 12;

		// Validate inputs
		if (principal <= 0) {
			setAutoLoanResult("Please enter a loan amount greater than 0.");
			return;
		}

		if (monthlyRate < 0) {
			setAutoLoanResult("Please enter a valid interest rate.");
			return;
		}

		if (numberOfPayments <= 0) {
			setAutoLoanResult("Please enter a loan term greater than 0.");
			return;
		}

		// Calculate monthly payment
		const monthlyPayment =
			(principal * monthlyRate) /
			(1 - Math.pow(1 + monthlyRate, -numberOfPayments));

		// Format the result with commas as needed
		const formattedMonthlyPayment = monthlyPayment.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

		// Update the result in a sentence format with a line break
		setAutoLoanResult(
			`Your Payment over ${autoLoanTerm} years with a rate of ${parseFloat(
				autoLoanRate,
			).toFixed(2)}% \nis $${formattedMonthlyPayment}/Month.`,
		);
	};

	return (
		<div className='calculator'>
			<h2>Auto Loan Calculator</h2>
			<form
				onSubmit={handleAutoLoanCalculation}
				aria-labelledby='auto-loan-calculator'
			>
				<label htmlFor='loan-amount'>
					Loan Amount ($):
					<input
						id='loan-amount'
						type='number'
						value={autoLoanAmount}
						onChange={(e) => setAutoLoanAmount(e.target.value)}
						required
						aria-required='true'
						aria-label='Enter the loan amount'
						placeholder='e.g., 25000'
					/>
				</label>
				<label htmlFor='interest-rate'>
					Interest Rate (%):
					<input
						id='interest-rate'
						type='number'
						value={autoLoanRate}
						onChange={(e) => setAutoLoanRate(e.target.value)}
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
						value={autoLoanTerm}
						onChange={(e) => setAutoLoanTerm(e.target.value)}
						required
						aria-required='true'
						aria-label='Enter the loan term in years'
						placeholder='e.g., 5'
					/>
				</label>
				<button type='submit' aria-label='Calculate auto loan payment'>
					Calculate
				</button>
				{/* Display the result using preformatted text to preserve line breaks */}
				<pre className='result-field' aria-live='polite'>
					{autoLoanResult}
				</pre>
			</form>
		</div>
	);
};
