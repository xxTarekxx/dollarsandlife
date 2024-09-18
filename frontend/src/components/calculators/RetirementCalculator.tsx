import React, { useState } from "react";

export const RetirementCalculator: React.FC = () => {
	const [retirementSavings, setRetirementSavings] = useState<string>("");
	const [annualContribution, setAnnualContribution] = useState<string>("");
	const [yearsToRetirement, setYearsToRetirement] = useState<string>("");
	const [retirementRateOfReturn, setRetirementRateOfReturn] =
		useState<string>("");
	const [retirementResult, setRetirementResult] = useState<string>("");

	const handleRetirementCalculation = (e: React.FormEvent) => {
		e.preventDefault();
		const initialSavings = parseFloat(retirementSavings || "0");
		const annualRate = parseFloat(retirementRateOfReturn || "0") / 100;
		const years = parseFloat(yearsToRetirement || "0");
		const contribution = parseFloat(annualContribution || "0");

		const futureValue =
			initialSavings * Math.pow(1 + annualRate, years) +
			contribution * ((Math.pow(1 + annualRate, years) - 1) / annualRate);

		// Format the result with commas as needed
		const formattedFutureValue = futureValue.toLocaleString("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});

		// Update the result in a sentence format with line breaks
		setRetirementResult(
			`Total Savings Over ${years} years with a rate of ${parseFloat(
				retirementRateOfReturn,
			).toFixed(2)}% \nis $${formattedFutureValue}`,
		);
	};

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
						aria-label='Enter the current savings amount'
						placeholder='e.g., 10000'
					/>
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
						aria-label='Enter the annual contribution amount'
						placeholder='e.g., 5000'
					/>
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
						aria-label='Enter the number of years until retirement'
						placeholder='e.g., 20'
					/>
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
						aria-label='Enter the expected rate of return'
						placeholder='e.g., 5'
					/>
				</label>
				<button type='submit' aria-label='Calculate retirement savings'>
					Calculate
				</button>
				{/* Display the result using preformatted text to preserve line breaks */}
				<pre className='result-field' aria-live='polite'>
					{retirementResult}
				</pre>
			</form>
		</div>
	);
};
