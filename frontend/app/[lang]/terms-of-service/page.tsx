"use client";

import dynamic from "next/dynamic";

/**
 * App Router entry point for /[lang]/terms-of-service.
 * Dynamically imports the terms-of-service page component from the pages/ directory.
 */
const TermsOfServicePage = dynamic(() => import("@pages/terms-of-service"), { ssr: true });

export default function Page() {
	return <TermsOfServicePage />;
}
