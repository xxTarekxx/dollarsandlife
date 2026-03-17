"use client";

import dynamic from "next/dynamic";

/**
 * App Router entry point for /[lang]/contact-us.
 * Dynamically imports the contact-us page component from the pages/ directory.
 */
const ContactUsPage = dynamic(() => import("@pages/contact-us"), { ssr: true });

export default function Page() {
	return <ContactUsPage />;
}
