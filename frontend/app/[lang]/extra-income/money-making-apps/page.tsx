import MoneyMakingAppsPage from "@pages/extra-income/money-making-apps";
import { fetchInternal } from "@/lib/fetchInternal";

async function fetchData() {
	try {
		const res = await fetchInternal("/money-making-apps");
		if (!res.ok) return { initialApps: [], error: `API error ${res.status}` };
		const data = await res.json();
		return { initialApps: Array.isArray(data) ? data : [] };
	} catch {
		return { initialApps: [], error: "Failed to load from server." };
	}
}

export default async function Page() {
	const { initialApps, error } = await fetchData();
	return <MoneyMakingAppsPage initialApps={initialApps} error={error} />;
}
