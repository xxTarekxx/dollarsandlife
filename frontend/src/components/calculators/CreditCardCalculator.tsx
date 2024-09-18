import React, { useState } from "react";

export const CreditCardCalculator: React.FC = () => {
	const [creditCardBalance, setCreditCardBalance] = useState<string>("");
	const [creditCardInterestRate, setCreditCardInterestRate] =
		useState<string>("");
	const [monthlyPayment, setMonthlyPayment] = useState<string>("");
	const [creditCardResult, setCreditCardResult] = useState<string>("");

	const handleCreditCardCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const balance = parseFloat(creditCardBalance || "0");
		const annualRate = parseFloat(creditCardInterestRate || "0") / 100;
		const monthlyRate = annualRate / 12;
		const payment = parseFloat(monthlyPayment || "0");

		if (balance <= 0) {
			setCreditCardResult("Please enter a balance greater than 0.");
			return;
		}

		if (annualRate < 0) {
			setCreditCardResult("Please enter a valid interest rate.");
			return;
		}

		if (payment <= 0) {
			setCreditCardResult("Please enter a monthly payment greater than 0.");
			return;
		}

		if (payment <= balance * monthlyRate) {
			setCreditCardResult(
				"Your monthly payment is too low to cover the interest. The balance will never be paid off.",
			);
			return;
		}

		const monthsToPayoff =
			-Math.log(1 - (balance * monthlyRate) / payment) /
			Math.log(1 + monthlyRate);

		if (isNaN(monthsToPayoff) || !isFinite(monthsToPayoff)) {
			setCreditCardResult("Unable to calculate. Please check your inputs.");
			return;
		}

		const formattedMonthsToPayoff = Math.ceil(monthsToPayoff);

		setCreditCardResult(
			`${formattedMonthsToPayoff} months to pay off the balance.`,
		);
	};

	return (
		<div className='calculator'>
			<h2>Credit Card & Debt Payoff Calculator</h2>
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
						aria-label='Enter the outstanding balance'
						placeholder='e.g., 5000'
					/>
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
						aria-label='Enter the annual interest rate'
						placeholder='e.g., 15'
					/>
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
						aria-label='Enter the monthly payment amount'
						placeholder='e.g., 200'
					/>
				</label>
				<button type='submit' aria-label='Calculate credit card payoff time'>
					Calculate
				</button>
				<pre className='result-field' aria-live='polite'>
					{creditCardResult}
				</pre>
			</form>
		</div>
	);
};
