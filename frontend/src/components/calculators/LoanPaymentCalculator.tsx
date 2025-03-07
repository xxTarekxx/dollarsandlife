import React, { useState, useCallback, useMemo } from "react";

export const LoanPaymentCalculator: React.FC = () => {
	const [loanPrincipal, setLoanPrincipal] = useState("");
	const [loanInterestRate, setLoanInterestRate] = useState("");
	const [loanTerm, setLoanTerm] = useState("");
	const [extraPayment, setExtraPayment] = useState("");
	const [loanResult, setLoanResult] = useState("");

	const handleLoanCalculation = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			const principal = parseFloat(loanPrincipal);
			const annualRate = parseFloat(loanInterestRate) / 100;
			const monthlyRate = annualRate / 12;
			const years = parseFloat(loanTerm);
			const months = years * 12;
			const extraPaymentPerMonth = parseFloat(extraPayment) || 0;

			// Validate inputs
			if (!principal || principal <= 0) {
				setLoanResult("Please enter a valid loan principal greater than 0.");
				return;
			}

			if (!annualRate || annualRate < 0) {
				setLoanResult("Please enter a valid interest rate.");
				return;
			}

			if (!years || years <= 0) {
				setLoanResult("Please enter a valid loan term greater than 0.");
				return;
			}

			if (extraPaymentPerMonth < 0) {
				setLoanResult("Extra payment must be a positive number.");
				return;
			}

			// Calculate standard monthly payment
			const standardMonthlyPayment =
				(principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months));

			const formattedStandardPayment = standardMonthlyPayment.toLocaleString(
				"en-US",
				{
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				},
			);

			// Calculate loan payoff time with extra payments
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

			const adjustedYears = Math.floor(adjustedMonths / 12);
			const remainingMonths = adjustedMonths % 12;

			// Construct result message
			let result = `Over ${years} years with a rate of ${parseFloat(
				loanInterestRate,
			).toFixed(2)}%, your payment is $${formattedStandardPayment}/Month.`;

			if (extraPaymentPerMonth > 0) {
				result += `\nIf you make an extra payment of $${extraPaymentPerMonth.toLocaleString(
					"en-US",
					{
						minimumFractionDigits: 2,
						maximumFractionDigits: 2,
					},
				)}/Month, you would pay off the loan in ${adjustedYears} years and ${remainingMonths} months.`;
			}

			setLoanResult(result);
		},
		[loanPrincipal, loanInterestRate, loanTerm, extraPayment],
	);

	// Memoized result display
	const displayResult = useMemo(
		() =>
			loanResult ? <pre className='result-field'>{loanResult}</pre> : null,
		[loanResult],
	);

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
						aria-describedby='loan-principal-desc'
						placeholder='e.g., 50000'
					/>
					<span id='loan-principal-desc' className='visually-hidden'>
						Enter the total amount borrowed.
					</span>
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
						aria-describedby='interest-rate-desc'
						placeholder='e.g., 4.5'
					/>
					<span id='interest-rate-desc' className='visually-hidden'>
						Enter the annual interest rate as a percentage.
					</span>
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
						aria-describedby='loan-term-desc'
						placeholder='e.g., 10'
					/>
					<span id='loan-term-desc' className='visually-hidden'>
						Enter the loan repayment period in years.
					</span>
				</label>

				<label htmlFor='extra-payment'>
					Extra Payment/Month ($):
					<input
						id='extra-payment'
						type='number'
						value={extraPayment}
						onChange={(e) => setExtraPayment(e.target.value)}
						aria-describedby='extra-payment-desc'
						placeholder='e.g., 100'
					/>
					<span id='extra-payment-desc' className='visually-hidden'>
						Optional: Enter an additional payment amount per month.
					</span>
				</label>

				<button type='submit' aria-label='Calculate loan payment'>
					Calculate
				</button>

				{/* Fixed height to prevent layout shift */}
				<div style={{ minHeight: "2em" }} aria-live='polite'>
					{displayResult}
				</div>
			</form>
		</div>
	);
};
