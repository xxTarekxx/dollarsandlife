"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scrolls to the top of the page whenever the route changes.
 * Uses usePathname() from next/navigation (App Router compatible).
 */
const ScrollToTop: React.FC = () => {
	const pathname = usePathname();

	useEffect(() => {
		// Scroll to top on route change
		window.scrollTo(0, 0);
	}, [pathname]);

	useEffect(() => {
		if ("scrollRestoration" in window.history) {
			window.history.scrollRestoration = "manual";
		}
	}, []);

	return null;
};

export default ScrollToTop;
