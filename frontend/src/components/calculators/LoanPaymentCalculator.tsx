import React, { useState } from "react";

export const LoanPaymentCalculator: React.FC = () => {
	const [loanPrincipal, setLoanPrincipal] = useState<string>("");
	const [loanInterestRate, setLoanInterestRate] = useState<string>("");
	const [loanTerm, setLoanTerm] = useState<string>("");
	const [extraPayment, setExtraPayment] = useState<string>("");
	const [loanResult, setLoanResult] = useState<string>("");

	const handleLoanCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const principal = parseFloat(loanPrincipal || "0");
		const annualRate = parseFloat(loanInterestRate || "0") / 100;
		const monthlyRate = annualRate / 12;
		const years = parseFloat(loanTerm || "0");
		const months = years * 12;
		const extraPaymentPerMonth = parseFloat(extraPayment || "0");

		// Validate inputs
		if (principal <= 0) {
			setLoanResult("Please enter a loan principal greater than 0.");
			return;
		}

		if (annualRate < 0) {
			setLoanResult("Please enter a valid interest rate.");
			return;
		}

		if (years <= 0) {
			setLoanResult("Please enter a loan term greater than 0.");
			return;
		}

		if (extraPaymentPerMonth < 0) {
			setLoanResult("Please enter a positive extra payment amount.");
			return;
		}

		// Calculate standard monthly payment
		const standardMonthlyPayment =
			(principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

		// Format the standard monthly payment with commas
		const formattedStandardPayment = standardMonthlyPayment.toLocaleString(
			"en-US",
			{
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			},
		);

		// Calculate number of months to pay off with extra payments
		let remainingBalance = principal;
		let adjustedMonths = 0;

		while (remainingBalance > 0) {
			const interestForMonth = remainingBalance * monthlyRate;
			const totalPayment = standardMonthlyPayment + extraPaymentPerMonth;

			if (totalPayment <= interestForMonth) {
				setLoanResult(
					"Your extra payment is not sufficient to reduce the principal.",
				);
				return;
			}

			remainingBalance = remainingBalance + interestForMonth - totalPayment;
			adjustedMonths++;
		}

		// Convert adjusted months to years and months
		const adjustedYears = Math.floor(adjustedMonths / 12);
		const remainingMonths = adjustedMonths % 12;

		// Update the result in a sentence format with line breaks
		let result = `Over ${years} years with a rate of ${parseFloat(
			loanInterestRate,
		).toFixed(2)}% \n Your Payment is $${formattedStandardPayment}/Month.\n`;

		// Add the extra payment result if applicable
		if (extraPaymentPerMonth > 0) {
			result += `\nIf You make an Extra Payment of $${extraPaymentPerMonth.toLocaleString(
				"en-US",
				{
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				},
			)}/Month \n you would pay off the loan in ${adjustedYears} years and ${remainingMonths} months.`;
		}

		setLoanResult(result);
	};

	return (
		<div className='calculator'>
			<h2>Loan Payment Calculator</h2>
			<form
				onSubmit={handleLoanCalculation}
				aria-labelledby='loan-payment-calculator'
			>
				<label htmlFor='loan-principal'>
					Loan Principal ($):
					<input
						id='loan-principal'
						type='number'
						value={loanPrincipal}
						onChange={(e) => setLoanPrincipal(e.target.value)}
						required
						aria-required='true'
						aria-label='Enter the loan principal amount'
						placeholder='e.g., 50000'
					/>
				</label>
				<label htmlFor='interest-rate'>
					Interest Rate (%):
					<input
						id='interest-rate'
						type='number'
						value={loanInterestRate}
						onChange={(e) => setLoanInterestRate(e.target.value)}
						required
						aria-required='true'
						aria-label='Enter the annual interest rate'
						placeholder='e.g., 4.5'
					/>
				</label>
				<label htmlFor='loan-term'>
					Term (Years):
					<input
						id='loan-term'
						type='number'
						value={loanTerm}
						onChange={(e) => setLoanTerm(e.target.value)}
						required
						aria-required='true'
						aria-label='Enter the loan term in years'
						placeholder='e.g., 10'
					/>
				</label>
				<label htmlFor='extra-payment'>
					Extra Payment/Month ($):
					<input
						id='extra-payment'
						type='number'
						value={extraPayment}
						onChange={(e) => setExtraPayment(e.target.value)}
						aria-label='Enter extra payment amount per month'
						placeholder='e.g., 100'
					/>
				</label>
				<button type='submit' aria-label='Calculate loan payment'>
					Calculate
				</button>
				{/* Display the result using preformatted text to preserve line breaks */}
				<pre className='result-field' aria-live='polite'>
					{loanResult}
				</pre>
			</form>
		</div>
	);
};
