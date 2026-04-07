import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanitizeAndTruncateHTML } from "@/utils/sanitization.server";

export const revalidate = 3600;

const isValidId = (id: string) =>
	/^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 100;

const cleanHeadline = (headline: unknown): string => {
	if (Array.isArray(headline)) return headline.join("").trim();
	if (typeof headline === "string") return headline.trim();
	return "";
};

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
	const { lang, id } = await params;
	if (!isValidId(id)) return {};
	const base = process.env.NEXT_PUBLIC_REACT_APP_API_BASE;
	if (!base) return {};
	try {
		const res = await fetch(
			`${base}/start-blog/${encodeURIComponent(id)}?lang=${lang}`,
			{ next: { revalidate: 3600 } },
		);
		if (!res.ok) return {};
		const post = await res.json();
		const title = cleanHeadline(post?.headline);
		const first = post?.content?.find((s: { text?: string }) => s?.text);
		const description =
			first && typeof first.text === "string"
				? sanitizeAndTruncateHTML(first.text, 160)
				: "Detailed start a blog post.";
		return {
			title: title ? `${title} | Start a Blog` : "Start a Blog",
			description,
		};
	} catch {
		return {};
	}
}

export default async function StartABlogDetailPage({
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
			`${base}/start-blog/${encodeURIComponent(id)}?lang=${lang}`,
			{ next: { revalidate: 3600 } },
		);
		if (!res.ok) {
			if (res.status === 404) notFound();
			throw new Error(`Fetch failed: ${res.status}`);
		}
		const post = await res.json();
		const first = post.content?.find((s: { text?: string }) => s?.text);
		post.metaDescription =
			first && typeof first.text === "string"
				? sanitizeAndTruncateHTML(first.text, 160)
				: "Detailed start a blog post.";
		const Component = (await import("@pages/start-a-blog/[id]")).default;
		return <Component post={post} locale={lang} />;
	} catch {
		notFound();
	}
}
