import StartABlogPage from "@pages/start-a-blog";

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

async function fetchData() {
	try {
		const res = await fetch(`${INTERNAL_API}/start-blog`, {
			next: { revalidate: 3600 },
		});
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
