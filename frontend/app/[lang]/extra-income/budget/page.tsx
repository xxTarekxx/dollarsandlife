import BudgetPage from "@pages/extra-income/budget";

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

async function fetchData() {
	try {
		const res = await fetch(`${INTERNAL_API}/budget-data`, {
			next: { revalidate: 3600 },
		});
		if (!res.ok) return { initialBudgetPosts: [], error: `API error ${res.status}` };
		const data = await res.json();
		return { initialBudgetPosts: Array.isArray(data) ? data : [] };
	} catch {
		return { initialBudgetPosts: [], error: "Failed to load from server." };
	}
}

export default async function Page() {
	const { initialBudgetPosts, error } = await fetchData();
	return <BudgetPage initialBudgetPosts={initialBudgetPosts} error={error} />;
}
