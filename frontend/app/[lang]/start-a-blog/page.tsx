import dynamic from "next/dynamic";

// Client component — keeps all hooks/state, receives initial data as props from server
const PageComponent = dynamic(
	() => import("@pages/start-a-blog"),
	{ ssr: true },
);

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

async function fetchData() {
	try {
		const res = await fetch(`${INTERNAL_API}/start-blog`, {
			next: { revalidate: 3600 },
		});
		if (!res.ok) {
			console.error("[start-a-blog] API returned " + res.status);
			return { initialBlogPosts: [], error: `API error ${res.status}` };
		}
		const data = await res.json();
		return { initialBlogPosts: Array.isArray(data) ? data : [] };
	} catch (err) {
		console.error("[start-a-blog] fetch failed:", err);
		return { initialBlogPosts: [], error: "Failed to load from server." };
	}
}

// Server Component — fetches data before rendering, no client-side waterfall
export default async function Page() {
	const { initialBlogPosts, error } = await fetchData();
	return <PageComponent initialBlogPosts={initialBlogPosts} error={error} />;
}
