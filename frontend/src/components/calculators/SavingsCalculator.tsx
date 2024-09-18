import React, { useState } from "react";

export const SavingsCalculator: React.FC = () => {
	const [savingsPrincipal, setSavingsPrincipal] = useState<string>("");
	const [savingsRate, setSavingsRate] = useState<string>("");
	const [savingsYears, setSavingsYears] = useState<string>("");
	const [extraDeposit, setExtraDeposit] = useState<string>("");
	const [savingsResult, setSavingsResult] = useState<string>("");

	const handleSavingsCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const principal = parseFloat(savingsPrincipal || "0");
		const annualRate = parseFloat(savingsRate || "0") / 100;
		const years = parseFloat(savingsYears || "0");
		const extraDepositPerMonth = parseFloat(extraDeposit || "0");
		const months = years * 12;

		// Validate inputs
		if (principal < 0) {
			setSavingsResult("Please enter a positive principal amount.");
			return;
		}

		if (annualRate < 0) {
			setSavingsResult("Please enter a valid interest rate.");
			return;
		}

		if (years <= 0) {
			setSavingsResult("Please enter a time period greater than 0.");
			return;
		}

		if (extraDepositPerMonth < 0) {
			setSavingsResult("Please enter a positive extra deposit amount.");
			return;
		}

		// Calculate future value with extra monthly deposits
		const totalExtraDeposits = extraDepositPerMonth * months;
		const futureValueWithoutExtra = principal * Math.pow(1 + annualRate, years);
		const futureValueWithExtra =
			totalExtraDeposits * Math.pow(1 + annualRate / 12, months);
		const totalFutureValue = futureValueWithoutExtra + futureValueWithExtra;

		// Format the result with commas as needed
		const formattedTotalFutureValue = totalFutureValue.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

		// Update the result in a sentence format with a line break
		setSavingsResult(
			`Over ${years} years with a rate of ${parseFloat(savingsRate).toFixed(
				2,
			)}% \nYou Would Save $${formattedTotalFutureValue}.`,
		);
	};

	return (
		<div className='calculator'>
			<h2>Savings Calculator</h2>
			<form
				onSubmit={handleSavingsCalculation}
				aria-labelledby='savings-calculator'
			>
				<label htmlFor='principal-amount'>
					Principal Amount ($):
					<input
						id='principal-amount'
						type='number'
						value={savingsPrincipal}
						onChange={(e) => setSavingsPrincipal(e.target.value)}
						required
						aria-required='true'
						aria-label='Enter the initial amount of savings'
						placeholder='e.g., 10000'
					/>
				</label>
				<label htmlFor='interest-rate'>
					Interest Rate (%):
					<input
						id='interest-rate'
						type='number'
						value={savingsRate}
						onChange={(e) => setSavingsRate(e.target.value)}
						required
						aria-required='true'
						aria-label='Enter the annual interest rate'
						placeholder='e.g., 5'
					/>
				</label>
				<label htmlFor='savings-years'>
					Time (Years):
					<input
						id='savings-years'
						type='number'
						value={savingsYears}
						onChange={(e) => setSavingsYears(e.target.value)}
						required
						aria-required='true'
						aria-label='Enter the number of years for savings'
						placeholder='e.g., 10'
					/>
				</label>
				<label htmlFor='extra-deposit'>
					Extra Deposit/Month ($):
					<input
						id='extra-deposit'
						type='number'
						value={extraDeposit}
						onChange={(e) => setExtraDeposit(e.target.value)}
						aria-label='Enter extra monthly deposit amount'
						placeholder='e.g., 100'
					/>
				</label>
				<button type='submit' aria-label='Calculate savings amount'>
					Calculate
				</button>
				{/* Display the result using preformatted text to preserve line breaks */}
				<pre className='result-field' aria-live='polite'>
					{savingsResult}
				</pre>
			</form>
		</div>
	);
};
