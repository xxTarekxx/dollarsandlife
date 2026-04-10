import BudgetPage from "@pages/extra-income/budget";
import { fetchInternal } from "@/lib/fetchInternal";

async function fetchData(lang: string) {
	try {
		const res = await fetchInternal(`/budget-data?lang=${encodeURIComponent(lang)}`);
		if (!res.ok) return { initialBudgetPosts: [], error: `API error ${res.status}` };
		const data = await res.json();
		return { initialBudgetPosts: Array.isArray(data) ? data : [] };
	} catch {
		return { initialBudgetPosts: [], error: "Failed to load from server." };
	}
}

export default async function Page({
	params,
}: {
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;
	const { initialBudgetPosts, error } = await fetchData(lang);
	return (
		<BudgetPage
			key={lang}
			initialBudgetPosts={initialBudgetPosts}
			error={error}
		/>
	);
}
