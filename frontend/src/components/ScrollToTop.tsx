import { useEffect } from "react";
import { useLocation, useNavigationType } from "react-router-dom";

const ScrollToTop: React.FC = () => {
	const { pathname } = useLocation();
	const navigationType = useNavigationType();

	useEffect(() => {
		if (navigationType !== "POP") {
			window.scrollTo(0, 0);
		}
	}, [pathname, navigationType]);

	useEffect(() => {
		if ("scrollRestoration" in window.history) {
			window.history.scrollRestoration = "manual";
		}
	}, []);

	return null;
};

export default ScrollToTop;
