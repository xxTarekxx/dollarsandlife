import { useRouter } from "next/router";
import { useEffect } from "react";

const ScrollToTop: React.FC = () => {
	const router = useRouter();

	useEffect(() => {
		// Scroll to top on route change
		window.scrollTo(0, 0);
	}, [router.asPath]);

	useEffect(() => {
		if ("scrollRestoration" in window.history) {
			window.history.scrollRestoration = "manual";
		}
	}, []);

	return null;
};

export default ScrollToTop;
