import BreakingNewsPage from "@pages/breaking-news";
import { fetchInternal } from "@/lib/fetchInternal";

const POSTS_PER_PAGE = 6;

function parsePage(value: string | undefined) {
	const parsed = Number.parseInt(value || "", 10);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

async function fetchData(lang: string, page: number) {
	try {
		const res = await fetchInternal(
			`/breaking-news?lang=${encodeURIComponent(lang)}&page=${page}&limit=${POSTS_PER_PAGE}`,
		);
		if (!res.ok) {
			return {
				initialBreakingNews: {
					items: [],
					total: 0,
					totalPages: 1,
					page,
					limit: POSTS_PER_PAGE,
				},
				error: `API error ${res.status}`,
			};
		}
		const data = await res.json();
		return {
			initialBreakingNews: {
				items: Array.isArray(data?.items) ? data.items : [],
				total: typeof data?.total === "number" ? data.total : 0,
				totalPages: typeof data?.totalPages === "number" ? data.totalPages : 1,
				page: typeof data?.page === "number" ? data.page : page,
				limit: typeof data?.limit === "number" ? data.limit : POSTS_PER_PAGE,
			},
		};
	} catch {
		return {
			initialBreakingNews: {
				items: [],
				total: 0,
				totalPages: 1,
				page,
				limit: POSTS_PER_PAGE,
			},
			error: "Failed to load from server.",
		};
	}
}

export default async function Page({
	params,
	searchParams,
}: {
	params: Promise<{ lang: string }>;
	searchParams?: Promise<{ page?: string }>;
}) {
	const { lang } = await params;
	const resolvedSearchParams = searchParams ? await searchParams : undefined;
	const page = parsePage(resolvedSearchParams?.page);
	const { initialBreakingNews, error } = await fetchData(lang, page);
	return (
		<BreakingNewsPage
			key={`${lang}:${page}`}
			initialBreakingNews={initialBreakingNews}
			error={error}
		/>
	);
}
