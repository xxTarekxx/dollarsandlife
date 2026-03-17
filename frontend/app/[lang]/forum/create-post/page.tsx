"use client";

import dynamic from "next/dynamic";

/**
 * App Router entry point for /[lang]/forum/create-post.
 * Note: noindex — this page is excluded from sitemap and robots.txt.
 */
const CreatePostPage = dynamic(() => import("@pages/forum/create-post"), { ssr: true });

export default function Page() {
	return <CreatePostPage />;
}
