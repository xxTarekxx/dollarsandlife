import dynamic from "next/dynamic";

// Client component — keeps all hooks/state, receives initial data as props from server
const PageComponent = dynamic(
	() => import("@pages/extra-income/freelance-jobs"),
	{ ssr: true },
);

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

async function fetchData() {
	try {
		const res = await fetch(`${INTERNAL_API}/freelance-jobs`, {
			next: { revalidate: 3600 },
		});
		if (!res.ok) {
			console.error("[freelance-jobs] API returned " + res.status);
			return { initialFreelanceJobs: [], error: `API error ${res.status}` };
		}
		const data = await res.json();
		return { initialFreelanceJobs: Array.isArray(data) ? data : [] };
	} catch (err) {
		console.error("[freelance-jobs] fetch failed:", err);
		return { initialFreelanceJobs: [], error: "Failed to load from server." };
	}
}

// Server Component — fetches data before rendering, no client-side waterfall
export default async function Page() {
	const { initialFreelanceJobs, error } = await fetchData();
	return <PageComponent initialFreelanceJobs={initialFreelanceJobs} error={error} />;
}
