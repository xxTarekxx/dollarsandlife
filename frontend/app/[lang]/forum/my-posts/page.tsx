"use client";

import dynamic from "next/dynamic";

/**
 * App Router entry point for /[lang]/forum/my-posts.
 * Note: noindex — user-specific page, excluded from sitemap and robots.txt.
 */
const MyPostsPage = dynamic(() => import("@pages/forum/my-posts"), { ssr: false });

export default function Page() {
	return <MyPostsPage />;
}
