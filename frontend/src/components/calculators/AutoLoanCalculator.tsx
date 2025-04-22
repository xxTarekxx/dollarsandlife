import React, { useState, useCallback, useMemo } from "react";

export const AutoLoanCalculator: React.FC = () => {
	const [autoLoanAmount, setAutoLoanAmount] = useState("");
	const [autoLoanRate, setAutoLoanRate] = useState("");
	const [autoLoanTerm, setAutoLoanTerm] = useState("");
	const [autoLoanResult, setAutoLoanResult] = useState("");

	const handleAutoLoanCalculation = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			const principal = parseFloat(autoLoanAmount);
			const monthlyRate = parseFloat(autoLoanRate) / 100 / 12;
			const numberOfPayments = parseFloat(autoLoanTerm) * 12;

			// Validate inputs
			if (!principal || principal <= 0) {
				setAutoLoanResult("Please enter a valid loan amount greater than 0.");
				return;
			}

			if (!monthlyRate || monthlyRate < 0) {
				setAutoLoanResult("Please enter a valid interest rate.");
				return;
			}

			if (!numberOfPayments || numberOfPayments <= 0) {
				setAutoLoanResult("Please enter a valid loan term greater than 0.");
				return;
			}

			// Calculate monthly payment
			const monthlyPayment =
				(principal * monthlyRate) /
				(1 - Math.pow(1 + monthlyRate, -numberOfPayments));

			// Format the result
			const formattedMonthlyPayment = monthlyPayment.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});

			setAutoLoanResult(
				`Your Payment over ${autoLoanTerm} years with a rate of ${parseFloat(
					autoLoanRate,
				).toFixed(2)}% is $${formattedMonthlyPayment}/Month.`,
			);
		},
		[autoLoanAmount, autoLoanRate, autoLoanTerm],
	);

	// Memoizing the result output
	const displayResult = useMemo(
		() =>
			autoLoanResult ? (
				<pre className='result-field'>{autoLoanResult}</pre>
			) : null,
		[autoLoanResult],
	);

	return (
		<div className='calculator'>
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
						aria-describedby='loan-amount-desc'
						placeholder='e.g., 25000'
					/>
					<span id='loan-amount-desc' className='visually-hidden'>
						Enter the total amount you want to borrow.
					</span>
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
						aria-describedby='interest-rate-desc'
						placeholder='e.g., 3.5'
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
						value={autoLoanTerm}
						onChange={(e) => setAutoLoanTerm(e.target.value)}
						required
						aria-required='true'
						aria-describedby='loan-term-desc'
						placeholder='e.g., 5'
					/>
					<span id='loan-term-desc' className='visually-hidden'>
						Enter the loan repayment period in years.
					</span>
				</label>

				<button type='submit' aria-label='Calculate auto loan payment'>
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
