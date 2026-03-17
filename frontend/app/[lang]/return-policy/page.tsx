"use client";

import dynamic from "next/dynamic";

/**
 * App Router entry point for /[lang]/return-policy.
 * Dynamically imports the return-policy page component from the pages/ directory.
 */
const ReturnPolicyPage = dynamic(() => import("@pages/return-policy"), { ssr: true });

export default function Page() {
	return <ReturnPolicyPage />;
}
