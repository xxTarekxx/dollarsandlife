import { notFound } from "next/navigation";
import { sanitizeAndTruncateHTML } from "@/utils/sanitization.server";
import type { BreakingNewsPost } from "@pages/breaking-news/[id]";

export const revalidate = 3600;

const isValidId = (id: string) =>
	/^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 100;

export default async function BreakingNewsDetailPage({
	params,
}: {
	params: Promise<{ lang: string; id: string }>;
}) {
	const { lang, id } = await params;
	if (!isValidId(id)) notFound();
	const base = process.env.NEXT_PUBLIC_REACT_APP_API_BASE;
	if (!base) notFound();
	try {
		// Pass ?lang= so the API returns pre-translated content from MongoDB.
		// Falls back to English automatically when the locale is unavailable.
		const res = await fetch(
			`${base}/breaking-news/${encodeURIComponent(id)}?lang=${lang}`,
			{ next: { revalidate: 3600 } },
		);
		if (!res.ok) {
			if (res.status === 404) notFound();
			throw new Error(`Fetch failed: ${res.status}`);
		}
		const post = (await res.json()) as BreakingNewsPost;
		const first = post.content?.find((s: { text?: string }) => s?.text);
		post.metaDescription =
			first && typeof first.text === "string"
				? sanitizeAndTruncateHTML(first.text, 160)
				: "Detailed breaking news post.";
		const Component = (await import("@pages/breaking-news/[id]")).default;
		return <Component post={post} />;
	} catch {
		notFound();
	}
}
