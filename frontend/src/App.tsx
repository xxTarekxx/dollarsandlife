import React, { lazy, Suspense, useEffect, useState, useMemo } from "react";
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
import RssTicker from "./components/RssTicker";
import ScrollToTop from "./components/ScrollToTop";

// Lazy load route components
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
const ContactUs = lazy(() => import("./components/ContactUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const BlogPostContent = lazy(() => import("./components/BlogPostContent"));
const BreadcrumbWrapper = lazy(() => import("./components/BreadcrumbWrapper"));
const Footer = lazy(() => import("./components/Footer"));

const App: React.FC = () => {
	const location = useLocation();
	const canonicalUrl = useMemo(
		() => `https://www.dollarsandlife.com${location.pathname}`,
		[location.pathname],
	);
	const [showAdBlockPrompt, setShowAdBlockPrompt] = useState(false);

	useEffect(() => {
		const lowerCaseUrl = location.pathname.toLowerCase();
		if (location.pathname !== lowerCaseUrl) {
			window.history.replaceState({}, document.title, lowerCaseUrl);
		}
	}, [location.pathname]);

	const handleDismissAdBlockPrompt = () => {
		setShowAdBlockPrompt(false);
	};

	useEffect(() => {
		const checkAdBlock = () => {
			try {
				const testAd = document.createElement("div");
				testAd.innerHTML = "&nbsp;";
				testAd.className = "adsbox";
				document.body.appendChild(testAd);

				const isAdBlocked = testAd.offsetHeight === 0;

				document.body.removeChild(testAd);

				if (isAdBlocked) {
					setShowAdBlockPrompt(true);
				}
			} catch (e) {
				setShowAdBlockPrompt(true);
			}
		};

		checkAdBlock();
	}, []);

	return (
		<HelmetProvider>
			<div className={`app-container ${showAdBlockPrompt ? "blurred" : ""}`}>
				{showAdBlockPrompt && (
					<div className='adblock-warning'>
						<h2>We Rely on Ads to Keep Our Content Free</h2>
						<p>
							It looks like you're using an ad blocker. Ads help keep our
							content free and available for everyone.
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
						content='Dollars And Life is a personal finance blog offering expert advice on earning extra income, budgeting, and finding the best money-saving deals.'
					/>
				</Helmet>

				<NavBar />
				<RssTicker />
				{location.pathname !== "/" && (
					<Suspense fallback={<Loading />}>
						<BreadcrumbWrapper />
					</Suspense>
				)}
				<div>
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
				</div>
				<Suspense fallback={<Loading />}>
					<Footer />
				</Suspense>
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
