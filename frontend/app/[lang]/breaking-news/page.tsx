import BreakingNewsPage from "@pages/breaking-news";
import { fetchInternal } from "@/lib/fetchInternal";

async function fetchData() {
	try {
		const res = await fetchInternal("/breaking-news");
		if (!res.ok) return { initialBreakingNews: [], error: `API error ${res.status}` };
		const data = await res.json();
		return { initialBreakingNews: Array.isArray(data) ? data : [] };
	} catch {
		return { initialBreakingNews: [], error: "Failed to load from server." };
	}
}

export default async function Page() {
	const { initialBreakingNews, error } = await fetchData();
	return <BreakingNewsPage initialBreakingNews={initialBreakingNews} error={error} />;
}
