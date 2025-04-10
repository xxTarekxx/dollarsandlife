import React, {
	lazy,
	Suspense,
	useEffect,
	useState,
	useMemo,
	useCallback,
} from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
	Route,
	BrowserRouter as Router, // Keep Router at the top level wrapper
	Routes,
	useLocation, // Import useLocation
} from "react-router-dom";
import "./App.css"; // Keep this global App CSS import
import Loading from "./components/Loading"; // Assuming path is correct
import NavBar from "./components/NavBar"; // Assuming path is correct
import NotFoundPage from "./components/NotFoundPage"; // Assuming path is correct
import ScrollToTop from "./components/ScrollToTop"; // Assuming path is correct

// Lazy load components (verify paths are correct for your structure)
const RssTicker = lazy(() => import("./components/RssTicker"));
const HomePage = lazy(() => import("./pages/HomePage"));
const ExtraIncome = lazy(
	() => import("./pages/category/extra-income/ExtraIncome"),
);
const FreelanceJobs = lazy(
	() => import("./pages/category/extra-income/FreelanceJobs"),
);
const RemoteOnlineJobs = lazy(
	() => import("./pages/category/extra-income/RemoteOnlineJobs"),
);
const MoneyMakingApps = lazy(
	() => import("./pages/category/extra-income/MoneyMakingApps"),
);
const Budget = lazy(() => import("./pages/category/extra-income/Budget"));
const StartABlog = lazy(
	() => import("./pages/category/start-a-blog/StartABlog"),
);
const BreakingNews = lazy(
	() => import("./pages/category/breakingnews/BreakingNews"),
);
const ShoppingDeals = lazy(
	() => import("./pages/category/deals-and-saving/ShoppingDeals"),
);
// --- Use the original component name with the new code ---
const ProductDetails = lazy(
	() => import("./pages/category/deals-and-saving/ProductDetails"), // Points to the rewritten ProductDetails.tsx
);
// --- End ---
const FinancialCalculators = lazy(
	() => import("./components/calculators/FinancialCalculators"),
);
const ContactUs = lazy(() => import("./components/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const BlogPostContent = lazy(() => import("./components/BlogPostContent"));
const BreadcrumbWrapper = lazy(() => import("./components/BreadcrumbWrapper"));
const Footer = lazy(() => import("./components/Footer"));

// Component using hooks (like useLocation)
const AppContent: React.FC = () => {
	const location = useLocation(); // Get location object
	const canonicalUrl = useMemo(
		() => `https://www.dollarsandlife.com${location.pathname.toLowerCase()}`,
		[location.pathname],
	);
	const [showAdBlockPrompt, setShowAdBlockPrompt] = useState(false);

	// Effect to enforce lowercase URLs
	useEffect(() => {
		const currentPath = location.pathname;
		const lowerCasePath = currentPath.toLowerCase();
		if (currentPath !== lowerCasePath) {
			window.history.replaceState({}, document.title, lowerCasePath);
		}
	}, [location.pathname]);

	// Effect for basic AdBlock Detection (keep or remove/refine as desired)
	useEffect(() => {
		const checkAdBlock = () => {
			let isAdBlocked = false;
			const testAd = document.createElement("div");
			testAd.innerHTML = " ";
			testAd.className = "adsbox";
			testAd.style.cssText =
				"position:absolute; height:1px; width:1px; top:-1px; left:-1px; opacity:0.01; pointer-events:none;";
			try {
				document.body.appendChild(testAd);
				requestAnimationFrame(() => {
					setTimeout(() => {
						if (testAd.offsetHeight === 0) isAdBlocked = true;
						if (document.body.contains(testAd))
							document.body.removeChild(testAd);
						if (isAdBlocked) {
							console.log("AdBlock detected.");
							setShowAdBlockPrompt(true);
						}
					}, 100);
				});
			} catch (e) {
				console.error("Error during AdBlock check:", e);
				if (document.body.contains(testAd)) document.body.removeChild(testAd);
			}
		};
		const timer = setTimeout(checkAdBlock, 2000);
		return () => clearTimeout(timer);
	}, []);

	const handleDismissAdBlockPrompt = useCallback(() => {
		setShowAdBlockPrompt(false);
	}, []);

	return (
		<HelmetProvider>
			<div className={`app-container ${showAdBlockPrompt ? "blurred" : ""}`}>
				{showAdBlockPrompt && (
					<div className='adblock-warning'>
						<h2>We Rely on Ads to Keep Our Content Free</h2>
						<p>Please consider pausing AdBlock for our site to support us.</p>
						<button onClick={handleDismissAdBlockPrompt}>I Understand</button>
					</div>
				)}
				<Helmet>
					<title>
						Dollars And Life - Personal Finance, Extra Income & Savings
					</title>
					<link rel='canonical' href={canonicalUrl} />
					<meta
						name='description'
						content='Dollars And Life offers advice on extra income, budgeting, and saving deals.'
					/>
				</Helmet>
				<header>
					<NavBar />
				</header>
				<aside>
					<Suspense
						fallback={
							<div
								style={{ height: "30px", width: "100%", background: "#eee" }}
							/>
						}
					>
						<RssTicker />
					</Suspense>
				</aside>
				{location.pathname !== "/" && (
					<Suspense fallback={<div style={{ minHeight: "20px" }} />}>
						<BreadcrumbWrapper />
					</Suspense>
				)}
				<main>
					<Suspense fallback={<Loading />}>
						<Routes>
							<Route path='/' element={<HomePage />} />
							<Route path='/extra-income' element={<ExtraIncome />} />
							{/* ... other routes ... */}
							<Route path='/shopping-deals' element={<ShoppingDeals />} />

							{/* --- Product Details Route with Key --- */}
							<Route
								path='/shopping-deals/products/:productSlug'
								// Use key={location.pathname} with the imported ProductDetails
								element={<ProductDetails key={location.pathname} />}
							/>
							{/* --- End --- */}

							<Route path='/start-a-blog/*' element={<StartABlog />} />
							{/* ... other routes ... */}
							<Route path='*' element={<NotFoundPage />} />
						</Routes>
					</Suspense>
				</main>
				<footer>
					<Suspense fallback={<div style={{ minHeight: "50px" }} />}>
						<Footer />
					</Suspense>
				</footer>
			</div>
		</HelmetProvider>
	);
};

const WrappedApp: React.FC = () => (
	<Router>
		<ScrollToTop />
		<AppContent />
	</Router>
);

export default WrappedApp;
