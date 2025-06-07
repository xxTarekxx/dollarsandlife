// frontend/src/App.tsx
import React, {
	lazy,
	Suspense,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { Toaster } from "react-hot-toast";
import {
	Route,
	BrowserRouter as Router,
	Routes,
	useLocation,
} from "react-router-dom";
import "./App.css";
import AuthActionHandler from "./auth/AuthActionHandler"; // Path adjusted based on previous assumption
import Loading from "./components/loadingstatus/Loading";
import NavBar from "./components/navbar/NavBar";
import NotFoundPage from "./components/notfound404/NotFoundPage";
import ScrollToTop from "./components/ScrollToTop";

// Lazy loaded components
const SignUp = lazy(() => import("./auth/SignUp"));
const Login = lazy(() => import("./auth/Login"));
const ForumHomePage = lazy(
	() => import("./pages/forum/forum-home/ForumHomePage"),
);
const ViewPostPage = lazy(() => import("./pages/forum/view-post/ViewPostPage"));
const SentryPCLanding = lazy(
	() => import("./pages/sentrypc-landing/SentryPCLanding"),
);
const RssTicker = lazy(() => import("./components/rss-news/RssTicker"));
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
const AboutUs = lazy(() => import("./pages/aboutus/AboutUs"));
const ContactUs = lazy(() => import("./pages/contactus/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const BlogPostContent = lazy(
	() => import("./components/articles-content/BlogPostContent"),
);
const BreadcrumbWrapper = lazy(
	() => import("./components/breadcrumbs/BreadcrumbWrapper"),
);
const ReturnPolicy = lazy(() => import("./pages/returnpolicy/ReturnPolicy"));
const Footer = lazy(() => import("./components/footer/Footer"));

// Example if you add NewPasswordPage
// const NewPasswordPage = lazy(() => import("./auth/NewPasswordPage"));

declare global {
	interface Window {
		gtag?: (...args: any[]) => void;
	}
}

const GA_MEASUREMENT_ID = "G-76XESXFFJP";
const GOOGLE_ADS_ID = "AW-16613104907";

const AppContent: React.FC = () => {
	const location = useLocation();
	const [showAdBlockPrompt, setShowAdBlockPrompt] = useState(false);

	const canonicalUrl = useMemo(() => {
		const parts = location.pathname.split("/");
		const lowercasedParts = parts.map((part, idx) =>
			parts[idx - 1] === "post" || parts[idx - 1] === "products"
				? part
				: part.toLowerCase(),
		);
		const joinedPath = lowercasedParts.join("/");
		return `https://www.dollarsandlife.com${
			joinedPath === "/" && lowercasedParts.length > 1 ? "" : joinedPath
		}`;
	}, [location.pathname]);

	useEffect(() => {
		const parts = location.pathname.split("/");
		const correctedParts = parts.map((part, idx) =>
			parts[idx - 1] === "post" || parts[idx - 1] === "products"
				? part
				: part.toLowerCase(),
		);
		const correctedPath = correctedParts.join("/");
		if (location.pathname !== correctedPath && location.pathname !== "/") {
			if (correctedPath || location.pathname === "/") {
				window.history.replaceState({}, document.title, correctedPath || "/");
			}
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
						if (
							testAd.offsetHeight === 0 ||
							window.getComputedStyle(testAd).display === "none" ||
							window.getComputedStyle(testAd).visibility === "hidden"
						) {
							isAdBlocked = true;
						}
						if (document.body.contains(testAd)) {
							document.body.removeChild(testAd);
						}
						if (isAdBlocked) {
							setShowAdBlockPrompt(true);
						}
					}, 150);
				});
			} catch (e) {
				console.warn("AdBlock check minor error:", e);
				if (document.body.contains(testAd)) {
					document.body.removeChild(testAd);
				}
			}
		};
		const timer = setTimeout(checkAdBlock, 3000);
		return () => clearTimeout(timer);
	}, []);

	useEffect(() => {
		const VITE_INTERNAL_IP_PREFIX = import.meta.env
			.VITE_REACT_APP_INTERNAL_IP_PREFIX as string | undefined;
		const internalPrefixes = (VITE_INTERNAL_IP_PREFIX || "")
			.split(",")
			.map((p: string) => p.trim()) // Explicitly type 'p'
			.filter((p: string) => p); // Explicitly type 'p'

		const configureGa = (isInternal: boolean) => {
			if (typeof window.gtag === "function") {
				window.gtag("config", GA_MEASUREMENT_ID, {
					page_path: location.pathname + location.search,
					...(isInternal && { traffic_type: "internal" }),
				});
				window.gtag("config", GOOGLE_ADS_ID);
				console.log(
					`GA configured for ${location.pathname}. Internal: ${isInternal}`,
				);
			}
		};

		if (internalPrefixes.length > 0) {
			fetch("https://api64.ipify.org?format=json")
				.then((res) => {
					if (!res.ok) {
						throw new Error(`IPify request failed with status ${res.status}`);
					}
					return res.json();
				})
				.then((data) => {
					if (typeof data?.ip !== "string") {
						throw new Error("Invalid IP data received from IPify");
					}
					const userIP = data.ip;
					const normalizeIP = (ip: string) => ip.replace(/[^a-zA-Z0-9:.]/g, "");
					const isInternal = internalPrefixes.some(
						(
							prefix: string, // Explicitly type 'prefix'
						) => normalizeIP(userIP).startsWith(normalizeIP(prefix)),
					);
					configureGa(isInternal);
				})
				.catch((err) => {
					console.error(
						"Failed to fetch IP or process IP data, defaulting to standard GA config:",
						err,
					);
					configureGa(false);
				});
		} else {
			configureGa(false);
		}
	}, [location.pathname, location.search]);

	const handleDismissAdBlockPrompt = useCallback(() => {
		setShowAdBlockPrompt(false);
	}, []);

	return (
		<HelmetProvider>
			<Toaster
				position='top-center'
				toastOptions={
					{
						/* ... your toast options ... */
					}
				}
			/>
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
							{/* General Pages */}
							<Route path='/' element={<HomePage />} />
							<Route path='/about-us' element={<AboutUs />} />
							<Route path='/contact-us' element={<ContactUs />} />
							<Route path='/terms-of-service' element={<TermsOfService />} />
							<Route path='/privacy-policy' element={<PrivacyPolicy />} />
							<Route path='/return-policy' element={<ReturnPolicy />} />

							{/* Authentication Pages & Handlers */}
							<Route path='/signup' element={<SignUp />} />
							<Route path='/login' element={<Login />} />
							<Route path='/auth/action' element={<AuthActionHandler />} />
							{/* <Route path='/new-password' element={<NewPasswordPage />} /> */}

							{/* Content Category Pages & Dynamic Content */}
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
							<Route
								path='/extra-income/:id'
								element={<BlogPostContent jsonFile='budgetdata.json' />}
							/>

							<Route path='/start-a-blog/*' element={<StartABlog />} />
							<Route
								path='/start-a-blog/:id'
								element={<BlogPostContent jsonFile='start-blog' />}
							/>

							<Route path='/breaking-news' element={<BreakingNews />} />
							<Route
								path='/breaking-news/:id'
								element={<BlogPostContent jsonFile='breaking-news' />}
							/>

							<Route path='/shopping-deals' element={<ShoppingDeals />} />
							<Route
								path='/shopping-deals/products/:productSlug'
								element={<ProductDetails key={location.pathname} />}
							/>

							{/* Tools & Specific Landing Pages */}
							<Route
								path='/financial-calculators'
								element={<FinancialCalculators />}
							/>
							<Route
								path='/sentry-pc-employee-monitoring-systems'
								element={<SentryPCLanding />}
							/>

							{/* Forum Pages (Firebase dependent) */}
							<Route path='/forum' element={<ForumHomePage />} />
							<Route path='/forum/post/:postId' element={<ViewPostPage />} />

							{/* Fallback for unmatched routes */}
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
