import dynamic from "next/dynamic";

// Client component — keeps all hooks/state, receives initial data as props from server
const PageComponent = dynamic(
	() => import("@pages/extra-income/money-making-apps"),
	{ ssr: true },
);

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

async function fetchData() {
	try {
		const res = await fetch(`${INTERNAL_API}/money-making-apps`, {
			next: { revalidate: 3600 },
		});
		if (!res.ok) {
			console.error("[money-making-apps] API returned " + res.status);
			return { initialApps: [], error: `API error ${res.status}` };
		}
		const data = await res.json();
		return { initialApps: Array.isArray(data) ? data : [] };
	} catch (err) {
		console.error("[money-making-apps] fetch failed:", err);
		return { initialApps: [], error: "Failed to load from server." };
	}
}

// Server Component — fetches data before rendering, no client-side waterfall
export default async function Page() {
	const { initialApps, error } = await fetchData();
	return <PageComponent initialApps={initialApps} error={error} />;
}
