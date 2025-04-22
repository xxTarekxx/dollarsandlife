import React, { useState, useCallback, useMemo } from "react";

export const CreditCardCalculator: React.FC = () => {
	const [creditCardBalance, setCreditCardBalance] = useState("");
	const [creditCardInterestRate, setCreditCardInterestRate] = useState("");
	const [monthlyPayment, setMonthlyPayment] = useState("");
	const [creditCardResult, setCreditCardResult] = useState("");

	const handleCreditCardCalculation = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			const balance = parseFloat(creditCardBalance);
			const annualRate = parseFloat(creditCardInterestRate) / 100;
			const monthlyRate = annualRate / 12;
			const payment = parseFloat(monthlyPayment);

			// Input validation
			if (!balance || balance <= 0) {
				setCreditCardResult("Please enter a valid balance greater than 0.");
				return;
			}

			if (!annualRate || annualRate < 0) {
				setCreditCardResult("Please enter a valid interest rate.");
				return;
			}

			if (!payment || payment <= 0) {
				setCreditCardResult(
					"Please enter a valid monthly payment greater than 0.",
				);
				return;
			}

			if (payment <= balance * monthlyRate) {
				setCreditCardResult(
					"Your monthly payment is too low to cover the interest. The balance will never be paid off.",
				);
				return;
			}

			// Calculate months to payoff
			const monthsToPayoff =
				-Math.log(1 - (balance * monthlyRate) / payment) /
				Math.log(1 + monthlyRate);

			if (isNaN(monthsToPayoff) || !isFinite(monthsToPayoff)) {
				setCreditCardResult("Unable to calculate. Please check your inputs.");
				return;
			}

			setCreditCardResult(
				`${Math.ceil(monthsToPayoff)} months to pay off the balance.`,
			);
		},
		[creditCardBalance, creditCardInterestRate, monthlyPayment],
	);

	// Memoizing the result display
	const displayResult = useMemo(
		() =>
			creditCardResult ? (
				<pre className='result-field'>{creditCardResult}</pre>
			) : null,
		[creditCardResult],
	);

	return (
		<div className='calculator'>
			<form
				onSubmit={handleCreditCardCalculation}
				aria-labelledby='credit-card-calculator'
			>
				<label htmlFor='credit-balance'>
					Outstanding Balance ($):
					<input
						id='credit-balance'
						type='number'
						value={creditCardBalance}
						onChange={(e) => setCreditCardBalance(e.target.value)}
						required
						aria-required='true'
						aria-describedby='credit-balance-desc'
						placeholder='e.g., 5000'
					/>
					<span id='credit-balance-desc' className='visually-hidden'>
						Enter the current outstanding balance on your credit card.
					</span>
				</label>

				<label htmlFor='interest-rate'>
					Interest Rate (%):
					<input
						id='interest-rate'
						type='number'
						value={creditCardInterestRate}
						onChange={(e) => setCreditCardInterestRate(e.target.value)}
						required
						aria-required='true'
						aria-describedby='interest-rate-desc'
						placeholder='e.g., 15'
					/>
					<span id='interest-rate-desc' className='visually-hidden'>
						Enter the annual percentage rate (APR) on your credit card.
					</span>
				</label>

				<label htmlFor='monthly-payment'>
					Monthly Payment ($):
					<input
						id='monthly-payment'
						type='number'
						value={monthlyPayment}
						onChange={(e) => setMonthlyPayment(e.target.value)}
						required
						aria-required='true'
						aria-describedby='monthly-payment-desc'
						placeholder='e.g., 200'
					/>
					<span id='monthly-payment-desc' className='visually-hidden'>
						Enter the amount you plan to pay each month.
					</span>
				</label>

				<button type='submit' aria-label='Calculate credit card payoff time'>
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
