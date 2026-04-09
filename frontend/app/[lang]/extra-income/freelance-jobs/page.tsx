import FreelanceJobsPage from "@pages/extra-income/freelance-jobs";

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

async function fetchData() {
	try {
		const res = await fetch(`${INTERNAL_API}/freelance-jobs`, {
			next: { revalidate: 3600 },
		});
		if (!res.ok) return { initialFreelanceJobs: [], error: `API error ${res.status}` };
		const data = await res.json();
		return { initialFreelanceJobs: Array.isArray(data) ? data : [] };
	} catch {
		return { initialFreelanceJobs: [], error: "Failed to load from server." };
	}
}

export default async function Page() {
	const { initialFreelanceJobs, error } = await fetchData();
	return <FreelanceJobsPage initialFreelanceJobs={initialFreelanceJobs} error={error} />;
}
