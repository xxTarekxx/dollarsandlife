import StartABlogPage from "@pages/start-a-blog";
import { fetchInternal } from "@/lib/fetchInternal";

async function fetchData() {
	try {
		const res = await fetchInternal("/start-blog");
		if (!res.ok) return { initialBlogPosts: [], error: `API error ${res.status}` };
		const data = await res.json();
		return { initialBlogPosts: Array.isArray(data) ? data : [] };
	} catch {
		return { initialBlogPosts: [], error: "Failed to load from server." };
	}
}

export default async function Page() {
	const { initialBlogPosts, error } = await fetchData();
	return <StartABlogPage initialBlogPosts={initialBlogPosts} error={error} />;
}
