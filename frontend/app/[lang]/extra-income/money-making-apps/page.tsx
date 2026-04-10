import MoneyMakingAppsPage from "@pages/extra-income/money-making-apps";
import { fetchInternal } from "@/lib/fetchInternal";

async function fetchData(lang: string) {
	try {
		const res = await fetchInternal(`/money-making-apps?lang=${encodeURIComponent(lang)}`);
		if (!res.ok) return { initialApps: [], error: `API error ${res.status}` };
		const data = await res.json();
		return { initialApps: Array.isArray(data) ? data : [] };
	} catch {
		return { initialApps: [], error: "Failed to load from server." };
	}
}

export default async function Page({
	params,
}: {
	params: Promise<{ lang: string }>;
}) {
	const { lang } = await params;
	const { initialApps, error } = await fetchData(lang);
	return (
		<MoneyMakingAppsPage
			key={lang}
			initialApps={initialApps}
			error={error}
		/>
	);
}
