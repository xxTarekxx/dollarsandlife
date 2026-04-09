import RemoteOnlineJobsPage from "@pages/extra-income/remote-online-jobs";

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

async function fetchData() {
	try {
		const res = await fetch(`${INTERNAL_API}/remote-jobs`, {
			next: { revalidate: 3600 },
		});
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
