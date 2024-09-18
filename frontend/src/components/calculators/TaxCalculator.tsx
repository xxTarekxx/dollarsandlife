import React, { useState, useEffect } from "react";

export const TaxCalculator: React.FC = () => {
	const [selectedState, setSelectedState] = useState<string>(""); // Default state is blank
	const [householdSize, setHouseholdSize] = useState<string>(""); // Default household size is blank
	const [income, setIncome] = useState<string>(""); // Default income is blank
	const [federalTaxResult, setFederalTaxResult] = useState<string>(""); // To store federal tax result
	const [stateTaxResult, setStateTaxResult] = useState<string>(""); // To store state tax result
	const [taxData, setTaxData] = useState<{
		[key: string]: { brackets: { rate: number; upTo: number | string }[] };
	} | null>(null); // To store tax data
	const [loading, setLoading] = useState<boolean>(false); // Loading state for fetching data
	const [error, setError] = useState<string>(""); // Error state for any issues fetching data

	// Fetch tax data from JSON file in public/data directory
	useEffect(() => {
		const fetchTaxData = async () => {
			setLoading(true); // Start loading state
			try {
				const response = await fetch("/data/taxBrackets.json"); // Fetch request to the JSON file
				const data = await response.json(); // Parse the JSON response
				setTaxData(data); // Update the state with fetched data
				setLoading(false); // Stop loading state
			} catch (err) {
				setError("Failed to load tax data. Please try again later."); // Set error message
				setLoading(false); // Stop loading state
			}
		};

		fetchTaxData(); // Call the fetch function on component mount
	}, []);

	// Handler for state dropdown change
	const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedState(event.target.value); // Update selected state
	};

	// Handler for income input change
	const handleIncomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIncome(event.target.value); // Update income, handle invalid input
	};

	// Handler for household size input change
	const handleHouseholdSizeChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setHouseholdSize(event.target.value); // Update household size, handle invalid input
	};

	// Function to calculate tax based on brackets
	const calculateTax = (
		brackets: { rate: number; upTo: number | string }[],
		income: number,
	) => {
		let tax = 0;
		let remainingIncome = income;

		for (const { rate, upTo } of brackets) {
			const upperLimit = upTo === "Infinity" ? Infinity : Number(upTo); // Convert "Infinity" to a number
			const taxableAmount = Math.min(remainingIncome, upperLimit); // Determine the taxable amount
			tax += taxableAmount * rate; // Calculate tax for this bracket
			remainingIncome -= taxableAmount; // Update remaining income
			if (remainingIncome <= 0) break; // Exit if no remaining income
		}

		return tax;
	};

	// Handler for calculating tax
	const handleCalculateTax = (e: React.FormEvent) => {
		e.preventDefault(); // Prevent form submission

		// Validate user input
		if (!selectedState || !income || !householdSize) {
			setFederalTaxResult(
				"Please enter valid income, household size, and state.",
			); // Set error message
			setStateTaxResult(""); // Clear state tax result
			return;
		}

		const numericIncome = parseFloat(income);
		const numericHouseholdSize = parseInt(householdSize);

		if (
			isNaN(numericIncome) ||
			numericIncome <= 0 ||
			isNaN(numericHouseholdSize) ||
			numericHouseholdSize <= 0
		) {
			setFederalTaxResult(
				"Please enter a valid numeric income and household size.",
			);
			setStateTaxResult("");
			return;
		}

		if (!taxData) {
			setFederalTaxResult("Tax data is not available."); // Check if tax data is available
			setStateTaxResult("");
			return;
		}

		// Calculate federal tax
		const federalBrackets = taxData["federal"]?.brackets;
		if (federalBrackets) {
			const federalTax = calculateTax(federalBrackets, numericIncome);
			const formattedFederalTax = federalTax.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
			setFederalTaxResult(`Federal Tax: $${formattedFederalTax}`);
		} else {
			setFederalTaxResult("Federal tax data is not available.");
		}

		// Calculate state tax
		const stateBrackets = taxData[selectedState]?.brackets;
		if (stateBrackets) {
			const stateTax = calculateTax(stateBrackets, numericIncome);
			const formattedStateTax = stateTax.toLocaleString("en-US", {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
			setStateTaxResult(
				`State Tax for ${selectedState}: $${formattedStateTax}`,
			);
		} else {
			setStateTaxResult(`No state tax data available for ${selectedState}.`);
		}
	};

	return (
		<div
			className='calculator'
			role='form'
			aria-labelledby='state-tax-calculator'
		>
			<h2 id='state-tax-calculator'>State and Federal Tax Calculator</h2>
			{loading && <p aria-live='polite'>Loading tax data...</p>}{" "}
			{/* Show loading message */}
			{error && (
				<p style={{ color: "red" }} aria-live='assertive'>
					{error}
				</p>
			)}{" "}
			{/* Show error message */}
			<form onSubmit={handleCalculateTax}>
				{/* Dropdown for selecting state */}
				<label htmlFor='state-select'>
					Select State:
					<select
						id='state-select'
						value={selectedState}
						onChange={handleStateChange}
						aria-required='true'
						aria-label='Select your state'
						disabled={!taxData} // Disable if data not loaded
					>
						<option value=''>Select a State</option> {/* Placeholder option */}
						{taxData &&
							Object.keys(taxData)
								.filter((key) => key !== "federal")
								.map((state) => (
									<option key={state} value={state}>
										{state}
									</option>
								))}
					</select>
				</label>
				{/* Input for household size */}
				<label htmlFor='household-size'>
					Household Size:
					<input
						id='household-size'
						type='number'
						min='1'
						value={householdSize}
						onChange={handleHouseholdSizeChange}
						required
						aria-required='true'
						aria-label='Enter the number of people in your household'
						placeholder='e.g., 3'
					/>
				</label>
				{/* Input for annual income */}
				<label htmlFor='annual-income'>
					Annual Income ($):
					<input
						id='annual-income'
						type='number'
						value={income}
						onChange={handleIncomeChange}
						required
						aria-required='true'
						aria-label='Enter your total annual income'
						placeholder='e.g., 50000'
					/>
				</label>
				<button
					type='submit'
					aria-label='Calculate state and federal tax'
					disabled={!taxData}
				>
					Calculate
				</button>
				{/* Display the federal and state tax results */}
				<pre className='result-field' aria-live='polite'>
					{federalTaxResult}
					<br />
					{stateTaxResult}
				</pre>
				{/* Note about tax data accuracy */}
				<p className='disclaimer' aria-live='polite'>
					Please note: State tax or Federal Tax brackets may have changed, or
					not up to date and not accurate.
				</p>
			</form>
		</div>
	);
};
