import dynamic from "next/dynamic";

// Client component — keeps all hooks/state, receives initial data as props from server
const PageComponent = dynamic(
	() => import("@pages/extra-income/remote-online-jobs"),
	{ ssr: true },
);

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

async function fetchData() {
	try {
		const res = await fetch(`${INTERNAL_API}/remote-jobs`, {
			next: { revalidate: 3600 },
		});
		if (!res.ok) {
			console.error("[remote-online-jobs] API returned " + res.status);
			return { initialRemoteJobs: [], error: `API error ${res.status}` };
		}
		const data = await res.json();
		return { initialRemoteJobs: Array.isArray(data) ? data : [] };
	} catch (err) {
		console.error("[remote-online-jobs] fetch failed:", err);
		return { initialRemoteJobs: [], error: "Failed to load from server." };
	}
}

// Server Component — fetches data before rendering, no client-side waterfall
export default async function Page() {
	const { initialRemoteJobs, error } = await fetchData();
	return <PageComponent initialRemoteJobs={initialRemoteJobs} error={error} />;
}
