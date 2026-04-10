import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
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

const getPost = cache(async (lang: string, id: string) => {
	const res = await fetch(
		`${INTERNAL_API}/freelance-jobs/${encodeURIComponent(id)}?lang=${lang}`,
		{ next: { revalidate: 3600 } },
	);
	if (!res.ok) {
		return { ok: false as const, status: res.status, post: null };
	}
	const post = await res.json();
	return { ok: true as const, status: res.status, post };
});

export async function generateMetadata({
	params,
}: {
	params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
	const { lang, id } = await params;
	if (!isValidId(id)) return {};
	try {
		const result = await getPost(lang, id);
		if (!result.ok || !result.post) return {};
		const post = result.post;
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
		const result = await getPost(lang, id);
		if (!result.ok || !result.post) {
			if (result.status === 404) notFound();
			throw new Error(`Fetch failed: ${result.status}`);
		}
		const post = result.post;
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
