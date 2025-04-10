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
import "./App.css"; // Keep this global App CSS import
import Loading from "./components/Loading";
import NavBar from "./components/NavBar";
import NotFoundPage from "./components/NotFoundPage";
import ScrollToTop from "./components/ScrollToTop";

// Lazy load components
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
	// Lazy loading ProductDetails component
	() => import("./pages/category/deals-and-saving/ProductDetails"),
);
const FinancialCalculators = lazy(
	() => import("./components/calculators/FinancialCalculators"),
);
const ContactUs = lazy(() => import("./components/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const BlogPostContent = lazy(() => import("./components/BlogPostContent"));
const BreadcrumbWrapper = lazy(() => import("./components/BreadcrumbWrapper"));
const Footer = lazy(() => import("./components/Footer"));

// REMOVED: import './ProductDetails.css'; // THIS LINE WAS INCORRECT HERE

const App: React.FC = () => {
	const location = useLocation();
	const canonicalUrl = useMemo(
		() => `https://www.dollarsandlife.com${location.pathname}`,
		[location.pathname],
	);
	const [showAdBlockPrompt, setShowAdBlockPrompt] = useState(false);

	// Force lowercase URLs
	useEffect(() => {
		const lowerCaseUrl = location.pathname.toLowerCase();
		if (location.pathname !== lowerCaseUrl) {
			window.history.replaceState({}, document.title, lowerCaseUrl);
		}
	}, [location.pathname]);

	// Basic AdBlock Detection
	useEffect(() => {
		const checkAdBlock = () => {
			let isAdBlocked = false;
			const testAd = document.createElement("div");
			testAd.innerHTML = " ";
			testAd.className = "adsbox";
			testAd.style.cssText =
				"position:absolute; height:1px; width:1px; opacity:0.01; left:-10px;";

			try {
				document.body.appendChild(testAd);
				setTimeout(() => {
					if (testAd.offsetHeight === 0) {
						isAdBlocked = true;
					}
					if (document.body.contains(testAd)) {
						document.body.removeChild(testAd);
					}
					if (isAdBlocked) {
						setShowAdBlockPrompt(true);
					}
				}, 100);
			} catch (e) {
				setShowAdBlockPrompt(true);
				if (document.body.contains(testAd)) {
					document.body.removeChild(testAd);
				}
			}
		};
		const timer = setTimeout(checkAdBlock, 1500);
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
						<p>
							It looks like you're using an ad blocker. Please consider pausing
							it for our site to support us.
						</p>
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
								className='rss-ticker-placeholder'
								style={{ height: "30px", width: "100%" }}
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
								element={<ProductDetails />}
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
								element={<BlogPostContent jsonFile='startablogdata.json' />}
							/>
							<Route
								path='/breaking-news/:id'
								element={<BlogPostContent jsonFile='breakingnews.json' />}
							/>
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
		<App />
	</Router>
);

export default WrappedApp;
