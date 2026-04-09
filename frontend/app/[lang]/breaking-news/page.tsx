import BreakingNewsPage from "@pages/breaking-news";

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

async function fetchData() {
	try {
		const res = await fetch(`${INTERNAL_API}/breaking-news`, {
			next: { revalidate: 3600 },
		});
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
