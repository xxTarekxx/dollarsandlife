import BudgetPage from "@pages/extra-income/budget";
import { fetchInternal } from "@/lib/fetchInternal";

async function fetchData() {
	try {
		const res = await fetchInternal("/budget-data");
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
