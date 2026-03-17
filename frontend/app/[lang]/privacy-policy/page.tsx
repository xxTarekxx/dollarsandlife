"use client";

import dynamic from "next/dynamic";

/**
 * App Router entry point for /[lang]/privacy-policy.
 * Dynamically imports the privacy-policy page component from the pages/ directory.
 */
const PrivacyPolicyPage = dynamic(() => import("@pages/privacy-policy"), { ssr: true });

export default function Page() {
	return <PrivacyPolicyPage />;
}
