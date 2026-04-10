import RemoteOnlineJobsPage from "@pages/extra-income/remote-online-jobs";
import { fetchInternal } from "@/lib/fetchInternal";

async function fetchData(lang: string) {
	try {
		const res = await fetchInternal(`/remote-jobs?lang=${encodeURIComponent(lang)}`);
		if (!res.ok) return { initialRemoteJobs: [], error: `API error ${res.status}` };
		const data = await res.json();
		return { initialRemoteJobs: Array.isArray(data) ? data : [] };
	} catch {
		return { initialRemoteJobs: [], error: "Failed to load from server." };
	}
}

export default async function Page({
	params,
}: {
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;
	const { initialRemoteJobs, error } = await fetchData(lang);
	return (
		<RemoteOnlineJobsPage
			key={lang}
			initialRemoteJobs={initialRemoteJobs}
			error={error}
		/>
	);
}
