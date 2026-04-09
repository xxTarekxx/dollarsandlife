import MoneyMakingAppsPage from "@pages/extra-income/money-making-apps";

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

async function fetchData() {
	try {
		const res = await fetch(`${INTERNAL_API}/money-making-apps`, {
			next: { revalidate: 3600 },
		});
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
