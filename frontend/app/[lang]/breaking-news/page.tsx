"use client";

import dynamic from "next/dynamic";

const BreakingNewsPage = dynamic(() => import("@pages/breaking-news"), {
	ssr: true,
});

export default function Page() {
	return <BreakingNewsPage />;
}
