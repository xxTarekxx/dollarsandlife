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
import {
	Route,
	BrowserRouter as Router,
	Routes,
	useLocation,
} from "react-router-dom";
import "./App.css";
import Loading from "./components/loadingstatus/Loading";
import NavBar from "./components/navbar/NavBar";
import NotFoundPage from "./components/notfound404/NotFoundPage";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "react-hot-toast";
import AuthActionHandler from "./auth/AuthActionHandler";

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

// const NewPasswordPage = lazy(() => import("./auth/NewPasswordPage"));

declare global {
	interface Window {
		gtag?: (...args: any[]) => void;
	}
}

const GA_MEASUREMENT_ID = "G-76XESXFFJP"; // Your primary GA4 ID
const GOOGLE_ADS_ID = "AW-16613104907"; // Your Google Ads ID

const AppContent: React.FC = () => {
	const location = useLocation();
	const [showAdBlockPrompt, setShowAdBlockPrompt] = useState(false);

	const canonicalUrl = useMemo(() => {
		const parts = location.pathname.split("/");
		const lowercasedParts = parts.map((part, idx) =>
			parts[idx - 1] === "post" ? part : part.toLowerCase(),
		);
		const joinedPath = lowercasedParts.join("/");
		return `https://www.dollarsandlife.com${
			joinedPath === "/" && lowercasedParts.length > 1 ? "" : joinedPath
		}`;
	}, [location.pathname]);

	// Normalize URL to lowercase (except for post IDs)
	useEffect(() => {
		const parts = location.pathname.split("/");
		const correctedParts = parts.map((part, idx) =>
			parts[idx - 1] === "post" ? part : part.toLowerCase(),
		);
		const correctedPath = correctedParts.join("/");
		if (location.pathname !== correctedPath && location.pathname !== "/") {
			if (correctedPath || location.pathname === "/") {
				window.history.replaceState({}, document.title, correctedPath || "/");
			}
		}
	}, [location.pathname]);

	// AdBlock detection
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
							testAd.style.display === "none" ||
							testAd.style.visibility === "hidden"
						) {
							isAdBlocked = true;
						}
						if (document.body.contains(testAd)) {
							document.body.removeChild(testAd);
						}
						if (isAdBlocked) {
							setShowAdBlockPrompt(true);
						}
					}, 100);
				});
			} catch (e) {
				console.error("Error during AdBlock check:", e);
				if (document.body.contains(testAd)) {
					document.body.removeChild(testAd);
				}
			}
		};
		const timer = setTimeout(checkAdBlock, 2500);
		return () => clearTimeout(timer);
	}, []);

	// IP-based GA configuration & Page View tracking for GA4
	useEffect(() => {
		const internalPrefixes = (process.env.REACT_APP_INTERNAL_IP_PREFIX || "")
			.split(",")
			.map((p) => p.trim())
			.filter((p) => p);

		if (internalPrefixes.length > 0) {
		}

		const configureGa = (isInternal: boolean) => {
			if (typeof window.gtag === "function") {
				window.gtag("config", GA_MEASUREMENT_ID, {
					send_page_view: !isInternal, // Send page_view based on IP check
					...(isInternal ? { page_title: "internal_traffic" } : {}),
				});
				// Configure Google Ads as well
				window.gtag("config", GOOGLE_ADS_ID);
			}
		};

		// Fetch IP and configure GA
		fetch("https://api64.ipify.org?format=json")
			.then((res) => res.json())
			.then((data) => {
				const userIP = data.ip;
				const normalizeIP = (ip: string) => ip.replace(/[^a-zA-Z0-9:.]/g, "");
				let isInternal = false;
				if (internalPrefixes.length > 0) {
					isInternal = internalPrefixes.some((prefix) =>
						normalizeIP(userIP).startsWith(normalizeIP(prefix)),
					);
				}
				configureGa(isInternal);
			})
			.catch((err) => {
				console.error(
					"Failed to fetch IP or configure gtag, defaulting to standard config:",
					err,
				);
				// Fallback to standard configuration if IP check fails
				configureGa(false); // Assume not internal if IP check fails
			});
	}, [location.pathname]); // Re-run config if path changes for SPA page_view logic

	const handleDismissAdBlockPrompt = useCallback(() => {
		setShowAdBlockPrompt(false);
	}, []);

	return (
		<HelmetProvider>
			<Toaster
				position='top-center'
				toastOptions={{
					style: {
						fontSize: "1rem",
						fontWeight: "600",
						padding: "14px 24px",
						borderRadius: "10px",
						background: "#333",
						color: "#fff",
					},
					success: {
						duration: 3000,
						iconTheme: { primary: "green", secondary: "white" },
					},
					error: {
						duration: 5000,
						iconTheme: { primary: "red", secondary: "white" },
					},
				}}
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

							{/* Content Category Pages */}
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
							<Route path='/start-a-blog/*' element={<StartABlog />} />
							<Route path='/breaking-news' element={<BreakingNews />} />
							<Route path='/shopping-deals' element={<ShoppingDeals />} />

							{/* Dynamic Content / Post Pages */}
							<Route
								path='/shopping-deals/products/:productSlug'
								element={<ProductDetails key={location.pathname} />}
							/>
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

							{/* Tools & Specific Landing Pages */}
							<Route
								path='/financial-calculators'
								element={<FinancialCalculators />}
							/>
							<Route
								path='/sentry-pc-employee-monitoring-systems'
								element={<SentryPCLanding />}
							/>

							{/* Forum Pages */}
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
