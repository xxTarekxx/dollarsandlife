import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sanitizeAndTruncateHTML } from "@/utils/sanitization.server";

export const revalidate = 3600;

const INTERNAL_API =
	process.env.API_INTERNAL_BASE || "http://127.0.0.1:5001/api";

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
	try {
		const res = await fetch(
			`${INTERNAL_API}/freelance-jobs/${encodeURIComponent(id)}?lang=${lang}`,
			{ next: { revalidate: 3600 } },
		);
		if (!res.ok) return {};
		const post = await res.json();
		const title = cleanHeadline(post?.headline);
		const first = post?.content?.find((s: { text?: string }) => s?.text);
		const description =
			first && typeof first.text === "string"
				? sanitizeAndTruncateHTML(first.text, 160)
				: "Detailed freelance job post.";
		return {
			title: title ? `${title} | Freelance Jobs` : "Freelance Jobs",
			description,
		};
	} catch {
		return {};
	}
}

export default async function FreelanceJobDetailPage({
	params,
}: {
	params: Promise<{ lang: string; id: string }>;
}) {
	const { lang, id } = await params;
	if (!isValidId(id)) notFound();
	try {
		// Pass ?lang= so the API returns pre-translated content from MongoDB.
		// Falls back to English automatically when the locale is unavailable.
		const res = await fetch(
			`${INTERNAL_API}/freelance-jobs/${encodeURIComponent(id)}?lang=${lang}`,
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
				: "Detailed freelance job post.";
		const Component = (await import("@pages/extra-income/freelance-jobs/[id]")).default;
		return <Component post={post} locale={lang} />;
	} catch {
		notFound();
	}
}
