import FreelanceJobsPage from "@pages/extra-income/freelance-jobs";
import { fetchInternal } from "@/lib/fetchInternal";

async function fetchData() {
	try {
		const res = await fetchInternal("/freelance-jobs");
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
