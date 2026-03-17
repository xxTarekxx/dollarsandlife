"use client";

import dynamic from "next/dynamic";

const ForumPage = dynamic(() => import("@pages/forum"), { ssr: true });

export default function Page() {
	return <ForumPage />;
}
