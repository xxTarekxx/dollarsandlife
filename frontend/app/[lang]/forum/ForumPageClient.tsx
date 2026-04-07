"use client";

import dynamic from "next/dynamic";

const ForumPage = dynamic(() => import("@pages/forum"), { ssr: false });

export default function ForumPageClient() {
	return <ForumPage />;
}
