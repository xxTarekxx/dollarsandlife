import { notFound } from "next/navigation";
import { sanitizeAndTruncateHTML } from "@/utils/sanitization.server";

export const revalidate = 3600;

const isValidId = (id: string) =>
	/^[a-zA-Z0-9_-]+$/.test(id) && id.length > 0 && id.length <= 100;

export default async function MoneyMakingAppDetailPage({
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
			`${base}/money-making-apps/${encodeURIComponent(id)}?lang=${lang}`,
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
				: "Detailed money-making app post.";
		const Component = (await import("@pages/extra-income/money-making-apps/[id]")).default;
		return <Component post={post} locale={lang} />;
	} catch {
		notFound();
	}
}
