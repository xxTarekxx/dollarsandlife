import React, { useState, useCallback, useMemo } from "react";

export const SavingsCalculator: React.FC = () => {
	const [savingsPrincipal, setSavingsPrincipal] = useState("");
	const [savingsRate, setSavingsRate] = useState("");
	const [savingsYears, setSavingsYears] = useState("");
	const [extraDeposit, setExtraDeposit] = useState("");
	const [savingsResult, setSavingsResult] = useState("");

	const handleSavingsCalculation = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			const principal = parseFloat(savingsPrincipal);
			const annualRate = parseFloat(savingsRate) / 100;
			const years = parseFloat(savingsYears);
			const extraDepositPerMonth = parseFloat(extraDeposit) || 0;
			const months = years * 12;

			// Validate inputs
			if (!principal || principal < 0) {
				setSavingsResult("Please enter a valid principal amount.");
				return;
			}

			if (!annualRate || annualRate < 0) {
				setSavingsResult("Please enter a valid interest rate.");
				return;
			}

			if (!years || years <= 0) {
				setSavingsResult("Please enter a valid time period greater than 0.");
				return;
			}

			if (extraDepositPerMonth < 0) {
				setSavingsResult("Extra deposit must be a positive number.");
				return;
			}

			// Calculate future value with extra monthly deposits
			const totalExtraDeposits = extraDepositPerMonth * months;
			const futureValueWithoutExtra =
				principal * Math.pow(1 + annualRate, years);
			const futureValueWithExtra =
				(totalExtraDeposits * Math.pow(1 + annualRate / 12, months)) /
				(annualRate / 12);
			const totalFutureValue = futureValueWithoutExtra + futureValueWithExtra;

			const formattedTotalFutureValue = totalFutureValue.toLocaleString(
				"en-US",
				{
					minimumFractionDigits: 2,
					maximumFractionDigits: 2,
				},
			);

			setSavingsResult(
				`Over ${years} years with a rate of ${parseFloat(savingsRate).toFixed(
					2,
				)}%, 
			You Would Save $${formattedTotalFutureValue}.`,
			);
		},
		[savingsPrincipal, savingsRate, savingsYears, extraDeposit],
	);

	// Memoized result display
	const displayResult = useMemo(
		() =>
			savingsResult ? (
				<pre className='result-field'>{savingsResult}</pre>
			) : null,
		[savingsResult],
	);

	return (
		<div className='calculator'>
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
						aria-describedby='principal-amount-desc'
						placeholder='e.g., 10000'
					/>
					<span id='principal-amount-desc' className='visually-hidden'>
						Enter the initial amount you are saving.
					</span>
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
						aria-describedby='interest-rate-desc'
						placeholder='e.g., 5'
					/>
					<span id='interest-rate-desc' className='visually-hidden'>
						Enter the annual interest rate as a percentage.
					</span>
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
						aria-describedby='savings-years-desc'
						placeholder='e.g., 10'
					/>
					<span id='savings-years-desc' className='visually-hidden'>
						Enter the number of years you plan to save.
					</span>
				</label>

				<label htmlFor='extra-deposit'>
					Extra Deposit/Month ($):
					<input
						id='extra-deposit'
						type='number'
						value={extraDeposit}
						onChange={(e) => setExtraDeposit(e.target.value)}
						aria-describedby='extra-deposit-desc'
						placeholder='e.g., 100'
					/>
					<span id='extra-deposit-desc' className='visually-hidden'>
						Optional: Enter an additional monthly deposit.
					</span>
				</label>

				<button type='submit' aria-label='Calculate savings amount'>
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
