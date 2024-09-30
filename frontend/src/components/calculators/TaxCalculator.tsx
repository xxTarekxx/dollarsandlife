import React, { useEffect, useState } from "react";

// Define types for tax data and tax brackets
interface TaxBracket {
	rate: number;
	upTo: number | string;
}

interface TaxData {
	[key: string]: {
		brackets: TaxBracket[];
	};
}

export const TaxCalculator: React.FC = () => {
	const [selectedState, setSelectedState] = useState<string>("");
	const [householdSize, setHouseholdSize] = useState<string>("");
	const [income, setIncome] = useState<string>("");
	const [federalTaxResult, setFederalTaxResult] = useState<string>("");
	const [stateTaxResult, setStateTaxResult] = useState<string>("");
	const [taxData, setTaxData] = useState<TaxData | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	// Fetch tax data from JSON file
	useEffect(() => {
		const fetchTaxData = async () => {
			setLoading(true);
			try {
				const response = await fetch("/data/taxBrackets.json");
				if (!response.ok) throw new Error("Failed to fetch data");
				const data: TaxData = await response.json();
				setTaxData(data);
			} catch {
				setError("Failed to load tax data. Please try again later.");
			} finally {
				setLoading(false);
			}
		};

		fetchTaxData();
	}, []);

	// Handle state selection change
	const handleStateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
		setSelectedState(event.target.value);
	};

	// Handle income input change
	const handleIncomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setIncome(event.target.value);
	};

	// Handle household size input change
	const handleHouseholdSizeChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setHouseholdSize(event.target.value);
	};

	// Calculate tax based on income and tax brackets
	const calculateTax = (brackets: TaxBracket[], income: number) => {
		let tax = 0;
		let remainingIncome = income;

		for (const { rate, upTo } of brackets) {
			const upperLimit = upTo === "Infinity" ? Infinity : Number(upTo);
			const taxableAmount = Math.min(remainingIncome, upperLimit);
			tax += taxableAmount * rate;
			remainingIncome -= taxableAmount;
			if (remainingIncome <= 0) break;
		}

		return tax;
	};

	// Handle form submission and tax calculation
	const handleCalculateTax = (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedState || !income || !householdSize) {
			setFederalTaxResult(
				"Please enter valid income, household size, and state.",
			);
			setStateTaxResult("");
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
			setFederalTaxResult("Tax data is not available.");
			setStateTaxResult("");
			return;
		}

		// Calculate federal tax
		const federalBrackets = taxData["federal"]?.brackets;
		if (federalBrackets) {
			const federalTax = calculateTax(federalBrackets, numericIncome);
			setFederalTaxResult(`Federal Tax: $${federalTax.toFixed(2)}`);
		} else {
			setFederalTaxResult("Federal tax data is not available.");
		}

		// Calculate state tax
		const stateBrackets = taxData[selectedState]?.brackets;
		if (stateBrackets) {
			const stateTax = calculateTax(stateBrackets, numericIncome);
			setStateTaxResult(
				`State Tax for ${selectedState}: $${stateTax.toFixed(2)}`,
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
			{loading && <p aria-live='polite'>Loading tax data...</p>}
			{error && (
				<p style={{ color: "red" }} aria-live='assertive'>
					{error}
				</p>
			)}

			<form onSubmit={handleCalculateTax}>
				<label htmlFor='state-select'>
					Select State:
					<select
						id='state-select'
						value={selectedState}
						onChange={handleStateChange}
						aria-required='true'
						aria-label='Select your state'
						disabled={!taxData}
					>
						<option value=''>Select a State</option>
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

				<pre className='result-field' aria-live='polite'>
					{federalTaxResult}
					<br />
					{stateTaxResult}
				</pre>

				<p className='disclaimer' aria-live='polite'>
					Please note: State tax or Federal Tax brackets may have changed, or
					may not be up to date and accurate.
				</p>
			</form>
		</div>
	);
};
