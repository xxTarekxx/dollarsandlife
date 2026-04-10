import FreelanceJobsPage from "@pages/extra-income/freelance-jobs";
import { fetchInternal } from "@/lib/fetchInternal";

async function fetchData(lang: string) {
	try {
		const res = await fetchInternal(`/freelance-jobs?lang=${encodeURIComponent(lang)}`);
		if (!res.ok) return { initialFreelanceJobs: [], error: `API error ${res.status}` };
		const data = await res.json();
		return { initialFreelanceJobs: Array.isArray(data) ? data : [] };
	} catch {
		return { initialFreelanceJobs: [], error: "Failed to load from server." };
	}
}

export default async function Page({
	params,
}: {
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;
	const { initialFreelanceJobs, error } = await fetchData(lang);
	return (
		<FreelanceJobsPage
			key={lang}
			initialFreelanceJobs={initialFreelanceJobs}
			error={error}
		/>
	);
}
