import RemoteOnlineJobsPage from "@pages/extra-income/remote-online-jobs";
import { fetchInternal } from "@/lib/fetchInternal";

async function fetchData() {
	try {
		const res = await fetchInternal("/remote-jobs");
		if (!res.ok) return { initialRemoteJobs: [], error: `API error ${res.status}` };
		const data = await res.json();
		return { initialRemoteJobs: Array.isArray(data) ? data : [] };
	} catch {
		return { initialRemoteJobs: [], error: "Failed to load from server." };
	}
}

export default async function Page() {
	const { initialRemoteJobs, error } = await fetchData();
	return <RemoteOnlineJobsPage initialRemoteJobs={initialRemoteJobs} error={error} />;
}
