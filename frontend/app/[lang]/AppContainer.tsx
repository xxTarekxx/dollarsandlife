"use client";

import { usePathname } from "next/navigation";
import React from "react";

interface AppContainerProps {
	children: React.ReactNode;
	lang: string;
}

/**
 * Client wrapper for app-container so the is-homepage class updates
 * on every client-side navigation (server components only run once).
 */
export default function AppContainer({ children, lang }: AppContainerProps) {
	const pathname = usePathname();
	const isHomePage =
		pathname === `/${lang}` ||
		pathname === `/${lang}/` ||
		pathname === "/";

	return (
		<div className={`app-container${isHomePage ? " is-homepage" : ""}`}>
			{children}
		</div>
	);
}
