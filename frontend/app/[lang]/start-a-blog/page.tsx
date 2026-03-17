"use client";

import dynamic from "next/dynamic";

const StartABlogPage = dynamic(() => import("@pages/start-a-blog"), {
	ssr: true,
});

export default function Page() {
	return <StartABlogPage />;
}
