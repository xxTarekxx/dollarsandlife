import React, { useState, useCallback, useMemo } from "react";

export const MortgageCalculator: React.FC = () => {
	const [mortgageAmount, setMortgageAmount] = useState("");
	const [mortgageInterestRate, setMortgageInterestRate] = useState("");
	const [mortgageTermYears, setMortgageTermYears] = useState("");
	const [mortgageResult, setMortgageResult] = useState("");

	const handleMortgageCalculation = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			const principal = parseFloat(mortgageAmount);
			const monthlyRate = parseFloat(mortgageInterestRate) / 100 / 12;
			const numberOfPayments = parseFloat(mortgageTermYears) * 12;

			// Validate inputs
			if (!principal || principal <= 0) {
				setMortgageResult("Please enter a valid loan amount greater than 0.");
				return;
			}

			if (!monthlyRate || monthlyRate < 0) {
				setMortgageResult("Please enter a valid interest rate.");
				return;
			}

			if (!numberOfPayments || numberOfPayments <= 0) {
				setMortgageResult("Please enter a valid loan term greater than 0.");
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

			setMortgageResult(
				`Your Monthly Payment over ${mortgageTermYears} years with a rate of ${parseFloat(
					mortgageInterestRate,
				).toFixed(2)}% is $${formattedMonthlyPayment}/Month.`,
			);
		},
		[mortgageAmount, mortgageInterestRate, mortgageTermYears],
	);

	// Memoized result display
	const displayResult = useMemo(
		() =>
			mortgageResult ? (
				<pre className='result-field'>{mortgageResult}</pre>
			) : null,
		[mortgageResult],
	);

	return (
		<div className='calculator'>
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
						aria-describedby='loan-amount-desc'
						placeholder='e.g., 300000'
					/>
					<span id='loan-amount-desc' className='visually-hidden'>
						Enter the total mortgage loan amount.
					</span>
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
						value={mortgageTermYears}
						onChange={(e) => setMortgageTermYears(e.target.value)}
						required
						aria-required='true'
						aria-describedby='loan-term-desc'
						placeholder='e.g., 30'
					/>
					<span id='loan-term-desc' className='visually-hidden'>
						Enter the loan term in years.
					</span>
				</label>

				<button type='submit' aria-label='Calculate mortgage payment'>
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
