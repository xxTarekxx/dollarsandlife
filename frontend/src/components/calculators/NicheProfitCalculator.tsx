import React, { useState, useCallback, useMemo } from "react";
import "./FinancialCalculators.css";

export const NicheProfitCalculator: React.FC = () => {
	const [revenue, setRevenue] = useState("");
	const [productCost, setProductCost] = useState("");
	const [shippingCost, setShippingCost] = useState("");
	const [packagingCost, setPackagingCost] = useState("");
	const [platformFees, setPlatformFees] = useState("");
	const [adsSpend, setAdsSpend] = useState("");
	const [softwareCosts, setSoftwareCosts] = useState("");
	const [contractorPayments, setContractorPayments] = useState("");
	const [miscExpenses, setMiscExpenses] = useState("");
	const [output, setOutput] = useState("");

	const handleCalculate = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();

			const rev = parseFloat(revenue);
			const costs = [
				parseFloat(productCost),
				parseFloat(shippingCost),
				parseFloat(packagingCost),
				parseFloat(platformFees),
				parseFloat(adsSpend),
				parseFloat(softwareCosts),
				parseFloat(contractorPayments),
				parseFloat(miscExpenses),
			];

			if (isNaN(rev) || rev < 0 || costs.some((c) => isNaN(c) || c < 0)) {
				setOutput("Please enter valid non-negative numbers for all fields.");
				return;
			}

			const totalExpenses = costs.reduce((acc, curr) => acc + curr, 0);
			const netProfit = rev - totalExpenses;
			const profitMargin = rev > 0 ? (netProfit / rev) * 100 : 0;

			const formattedProfit = netProfit.toLocaleString("en-US", {
				style: "currency",
				currency: "USD",
			});
			const formattedMargin = profitMargin.toFixed(2);

			setOutput(
				`Your net profit is ${formattedProfit} with a profit margin of ${formattedMargin}%.`,
			);
		},
		[
			revenue,
			productCost,
			shippingCost,
			packagingCost,
			platformFees,
			adsSpend,
			softwareCosts,
			contractorPayments,
			miscExpenses,
		],
	);

	const resultDisplay = useMemo(
		() =>
			output && (
				<div className='result-field' aria-live='polite'>
					{output}
				</div>
			),
		[output],
	);

	return (
		<div className='calculator'>
			<h2>Niche Profit Calculator</h2>
			<form onSubmit={handleCalculate} aria-labelledby='niche-profit-heading'>
				<label htmlFor='revenue'>
					Total Revenue ($):
					<input
						id='revenue'
						type='number'
						value={revenue}
						onChange={(e) => setRevenue(e.target.value)}
						placeholder='e.g., 15000'
						required
					/>
				</label>

				<label htmlFor='productCost'>
					Product Cost (COGS) ($):
					<input
						id='productCost'
						type='number'
						value={productCost}
						onChange={(e) => setProductCost(e.target.value)}
						placeholder='e.g., 4000'
						required
					/>
				</label>

				<label htmlFor='shippingCost'>
					Shipping Costs ($):
					<input
						id='shippingCost'
						type='number'
						value={shippingCost}
						onChange={(e) => setShippingCost(e.target.value)}
						placeholder='e.g., 800'
						required
					/>
				</label>

				<label htmlFor='packagingCost'>
					Packaging Costs ($):
					<input
						id='packagingCost'
						type='number'
						value={packagingCost}
						onChange={(e) => setPackagingCost(e.target.value)}
						placeholder='e.g., 300'
						required
					/>
				</label>

				<label htmlFor='platformFees'>
					Platform/Marketplace Fees ($):
					<input
						id='platformFees'
						type='number'
						value={platformFees}
						onChange={(e) => setPlatformFees(e.target.value)}
						placeholder='e.g., 1000'
						required
					/>
				</label>

				<label htmlFor='adsSpend'>
					Ad Spend / Marketing ($):
					<input
						id='adsSpend'
						type='number'
						value={adsSpend}
						onChange={(e) => setAdsSpend(e.target.value)}
						placeholder='e.g., 2000'
						required
					/>
				</label>

				<label htmlFor='softwareCosts'>
					Software / Subscriptions ($):
					<input
						id='softwareCosts'
						type='number'
						value={softwareCosts}
						onChange={(e) => setSoftwareCosts(e.target.value)}
						placeholder='e.g., 150'
						required
					/>
				</label>

				<label htmlFor='contractorPayments'>
					Freelancer/Contractor Payments ($):
					<input
						id='contractorPayments'
						type='number'
						value={contractorPayments}
						onChange={(e) => setContractorPayments(e.target.value)}
						placeholder='e.g., 1000'
						required
					/>
				</label>

				<label htmlFor='miscExpenses'>
					Miscellaneous Expenses ($):
					<input
						id='miscExpenses'
						type='number'
						value={miscExpenses}
						onChange={(e) => setMiscExpenses(e.target.value)}
						placeholder='e.g., 250'
						required
					/>
				</label>

				<button type='submit' aria-label='Calculate niche profit'>
					Calculate
				</button>
				<div style={{ minHeight: "2em" }}>{resultDisplay}</div>
			</form>
		</div>
	);
};

export default NicheProfitCalculator;
