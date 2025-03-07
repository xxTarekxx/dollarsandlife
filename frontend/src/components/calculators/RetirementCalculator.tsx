import React, { useState, useCallback, useMemo } from "react";

export const RetirementCalculator: React.FC = () => {
	const [retirementSavings, setRetirementSavings] = useState("");
	const [annualContribution, setAnnualContribution] = useState("");
	const [yearsToRetirement, setYearsToRetirement] = useState("");
	const [retirementRateOfReturn, setRetirementRateOfReturn] = useState("");
	const [retirementResult, setRetirementResult] = useState("");

	const handleRetirementCalculation = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			const initialSavings = parseFloat(retirementSavings);
			const annualRate = parseFloat(retirementRateOfReturn) / 100;
			const years = parseFloat(yearsToRetirement);
			const contribution = parseFloat(annualContribution);

			// Validate inputs
			if (!initialSavings || initialSavings < 0) {
				setRetirementResult("Please enter a valid current savings amount.");
				return;
			}

			if (!annualRate || annualRate < 0) {
				setRetirementResult("Please enter a valid rate of return.");
				return;
			}

			if (!years || years <= 0) {
				setRetirementResult(
					"Please enter a valid number of years until retirement.",
				);
				return;
			}

			if (!contribution || contribution < 0) {
				setRetirementResult("Please enter a valid annual contribution amount.");
				return;
			}

			// Calculate future value
			const futureValue =
				initialSavings * Math.pow(1 + annualRate, years) +
				(contribution * (Math.pow(1 + annualRate, years) - 1)) / annualRate;

			const formattedFutureValue = futureValue.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});

			setRetirementResult(
				`Total Savings Over ${years} years with a rate of ${parseFloat(
					retirementRateOfReturn,
				).toFixed(2)}% will be $${formattedFutureValue}.`,
			);
		},
		[
			retirementSavings,
			annualContribution,
			yearsToRetirement,
			retirementRateOfReturn,
		],
	);

	// Memoized result display
	const displayResult = useMemo(
		() =>
			retirementResult ? (
				<pre className='result-field'>{retirementResult}</pre>
			) : null,
		[retirementResult],
	);

	return (
		<div className='calculator'>
			<h2>Retirement Calculator</h2>
			<form
				onSubmit={handleRetirementCalculation}
				aria-labelledby='retirement-calculator'
			>
				<label htmlFor='retirement-savings'>
					Current Savings ($):
					<input
						id='retirement-savings'
						type='number'
						value={retirementSavings}
						onChange={(e) => setRetirementSavings(e.target.value)}
						required
						aria-required='true'
						aria-describedby='retirement-savings-desc'
						placeholder='e.g., 10000'
					/>
					<span id='retirement-savings-desc' className='visually-hidden'>
						Enter the current amount you have saved for retirement.
					</span>
				</label>

				<label htmlFor='annual-contribution'>
					Annual Contribution ($):
					<input
						id='annual-contribution'
						type='number'
						value={annualContribution}
						onChange={(e) => setAnnualContribution(e.target.value)}
						required
						aria-required='true'
						aria-describedby='annual-contribution-desc'
						placeholder='e.g., 5000'
					/>
					<span id='annual-contribution-desc' className='visually-hidden'>
						Enter the amount you contribute annually to your retirement savings.
					</span>
				</label>

				<label htmlFor='years-to-retirement'>
					Years to Retirement:
					<input
						id='years-to-retirement'
						type='number'
						value={yearsToRetirement}
						onChange={(e) => setYearsToRetirement(e.target.value)}
						required
						aria-required='true'
						aria-describedby='years-to-retirement-desc'
						placeholder='e.g., 20'
					/>
					<span id='years-to-retirement-desc' className='visually-hidden'>
						Enter the number of years until you plan to retire.
					</span>
				</label>

				<label htmlFor='rate-of-return'>
					Expected Rate of Return (%):
					<input
						id='rate-of-return'
						type='number'
						value={retirementRateOfReturn}
						onChange={(e) => setRetirementRateOfReturn(e.target.value)}
						required
						aria-required='true'
						aria-describedby='rate-of-return-desc'
						placeholder='e.g., 5'
					/>
					<span id='rate-of-return-desc' className='visually-hidden'>
						Enter the expected annual rate of return on your investments.
					</span>
				</label>

				<button type='submit' aria-label='Calculate retirement savings'>
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
