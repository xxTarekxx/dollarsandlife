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
	BrowserRouter as Router,
	Routes,
	useLocation,
} from "react-router-dom";
import "./App.css";
import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import NotFoundPage from "./components/NotFoundPage";
import ScrollToTop from "./components/ScrollToTop";

const SentryPCLanding = lazy(
	() => import("./pages/sentrypc-landing/SentryPCLanding"),
);
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
const ProductDetails = lazy(
	() => import("./pages/category/deals-and-saving/ProductDetails"),
);
const FinancialCalculators = lazy(
	() => import("./components/calculators/FinancialCalculators"),
);
const AboutUs = lazy(() => import("./pages/AboutUs"));

const ContactUs = lazy(() => import("./components/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const BlogPostContent = lazy(() => import("./components/BlogPostContent"));
const BreadcrumbWrapper = lazy(() => import("./components/BreadcrumbWrapper"));
const ReturnPolicy = lazy(() => import("./pages/returnpolicy/ReturnPolicy"));
const Footer = lazy(() => import("./components/Footer"));

declare global {
	interface Window {
		gtag?: (...args: any[]) => void;
	}
}

const AppContent: React.FC = () => {
	const location = useLocation();
	const canonicalUrl = useMemo(
		() => `https://www.dollarsandlife.com${location.pathname.toLowerCase()}`,
		[location.pathname],
	);
	const [showAdBlockPrompt, setShowAdBlockPrompt] = useState(false);

	useEffect(() => {
		const currentPath = location.pathname;
		const lowerCasePath = currentPath.toLowerCase();
		if (currentPath !== lowerCasePath) {
			window.history.replaceState({}, document.title, lowerCasePath);
		}
	}, [location.pathname]);

	useEffect(() => {
		const checkAdBlock = () => {
			let isAdBlocked = false;
			const testAd = document.createElement("div");
			testAd.innerHTML = "\u00A0";
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

	useEffect(() => {
		const internalPrefixes = (process.env.REACT_APP_INTERNAL_IP_PREFIX || "")
			.split(",")
			.map((p) => p.trim());

		console.log("ENV INTERNAL IP Prefixes:", internalPrefixes);

		fetch("https://api64.ipify.org?format=json")
			.then((res) => res.json())
			.then((data) => {
				const userIP = data.ip;
				const normalizeIP = (ip: string) => ip.replace(/[^a-zA-Z0-9:.]/g, "");

				const isInternal = internalPrefixes.some((prefix) => {
					return normalizeIP(userIP).startsWith(normalizeIP(prefix));
				});

				console.log("Your IP is:", userIP);
				console.log("Tracking allowed:", !isInternal);

				if (typeof window.gtag === "function") {
					window.gtag("config", "G-S7FWNHSD7P", {
						send_page_view: !isInternal,
						...(isInternal ? { traffic_type: "internal_traffic" } : {}),
					});
					window.gtag("config", "AW-16613104907");
				}
			})
			.catch(() => {
				if (typeof window.gtag === "function") {
					window.gtag("config", "G-S7FWNHSD7P");
					window.gtag("config", "AW-16613104907");
				}
			});
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
							<Route
								path='/extra-income/freelancers/*'
								element={<FreelanceJobs />}
							/>
							<Route
								path='/extra-income/remote-jobs/*'
								element={<RemoteOnlineJobs />}
							/>
							<Route
								path='/extra-income/money-making-apps/*'
								element={<MoneyMakingApps />}
							/>
							<Route path='/extra-income/budget/*' element={<Budget />} />
							<Route path='/shopping-deals' element={<ShoppingDeals />} />
							<Route
								path='/shopping-deals/products/:productSlug'
								element={<ProductDetails key={location.pathname} />}
							/>
							<Route path='/start-a-blog/*' element={<StartABlog />} />
							<Route
								path='/financial-calculators'
								element={<FinancialCalculators />}
							/>
							<Route path='/breaking-news' element={<BreakingNews />} />
							<Route path='/terms-of-service' element={<TermsOfService />} />
							<Route path='/privacy-policy' element={<PrivacyPolicy />} />
							<Route path='/contact-us' element={<ContactUs />} />
							<Route
								path='/extra-income/:id'
								element={<BlogPostContent jsonFile='budgetdata.json' />}
							/>
							<Route
								path='/start-a-blog/:id'
								element={<BlogPostContent jsonFile='start-blog' />}
							/>
							<Route
								path='/breaking-news/:id'
								element={<BlogPostContent jsonFile='breaking-news' />}
							/>
							<Route
								path='/sentry-pc-employee-monitoring-systems'
								element={<SentryPCLanding />}
							/>
							<Route path='/return-policy' element={<ReturnPolicy />} />
							<Route path='*' element={<NotFoundPage />} />
							<Route path='/about-us' element={<AboutUs />} />
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
