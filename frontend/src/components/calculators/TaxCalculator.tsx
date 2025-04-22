import React, { useEffect, useState, useCallback, useMemo } from "react";

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
	const [selectedState, setSelectedState] = useState("");
	const [householdSize, setHouseholdSize] = useState("");
	const [income, setIncome] = useState("");
	const [federalTaxResult, setFederalTaxResult] = useState("");
	const [stateTaxResult, setStateTaxResult] = useState("");
	const [taxData, setTaxData] = useState<TaxData | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	// Fetch tax data on mount
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

	// Tax calculation function
	const calculateTax = useCallback((brackets: TaxBracket[], income: number) => {
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
	}, []);

	// Handle tax calculation
	const handleCalculateTax = useCallback(
		(e: React.FormEvent) => {
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
			const federalTax = federalBrackets
				? calculateTax(federalBrackets, numericIncome)
				: null;
			setFederalTaxResult(
				federalTax !== null
					? `Federal Tax: $${federalTax.toFixed(2)}`
					: "Federal tax data is not available.",
			);

			// Calculate state tax
			const stateBrackets = taxData[selectedState]?.brackets;
			const stateTax = stateBrackets
				? calculateTax(stateBrackets, numericIncome)
				: null;
			setStateTaxResult(
				stateTax !== null
					? `State Tax for ${selectedState}: $${stateTax.toFixed(2)}`
					: `No state tax data available for ${selectedState}.`,
			);
		},
		[selectedState, income, householdSize, taxData, calculateTax],
	);

	// Memoized result display
	const displayResult = useMemo(
		() => (
			<div style={{ minHeight: "2em" }} aria-live='polite'>
				<pre className='result-field'>
					{federalTaxResult}
					<br />
					{stateTaxResult}
				</pre>
			</div>
		),
		[federalTaxResult, stateTaxResult],
	);

	return (
		<div
			className='calculator'
			role='form'
			aria-labelledby='state-tax-calculator'
		>
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
						onChange={(e) => setSelectedState(e.target.value)}
						aria-required='true'
						aria-describedby='state-select-desc'
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
					<span id='state-select-desc' className='visually-hidden'>
						Select the state for tax calculation.
					</span>
				</label>

				<label htmlFor='household-size'>
					Household Size:
					<input
						id='household-size'
						type='number'
						min='1'
						value={householdSize}
						onChange={(e) => setHouseholdSize(e.target.value)}
						required
						aria-required='true'
						aria-describedby='household-size-desc'
						placeholder='e.g., 3'
					/>
					<span id='household-size-desc' className='visually-hidden'>
						Enter the number of people in your household.
					</span>
				</label>

				<label htmlFor='annual-income'>
					Annual Income ($):
					<input
						id='annual-income'
						type='number'
						value={income}
						onChange={(e) => setIncome(e.target.value)}
						required
						aria-required='true'
						aria-describedby='annual-income-desc'
						placeholder='e.g., 50000'
					/>
					<span id='annual-income-desc' className='visually-hidden'>
						Enter your total annual income before taxes.
					</span>
				</label>

				<button
					type='submit'
					aria-label='Calculate state and federal tax'
					disabled={!taxData}
				>
					Calculate
				</button>

				{displayResult}

				<p className='disclaimer' aria-live='polite'>
					Please note: State and Federal tax brackets may change over time and
					may not always be up to date.
				</p>
			</form>
		</div>
	);
};
