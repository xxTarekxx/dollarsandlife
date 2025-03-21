import React, { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import {
	Route,
	BrowserRouter as Router,
	Routes,
	useLocation,
} from "react-router-dom";
import "./App.css";
import BlogPostContent from "./components/BlogPostContent";
import BreadcrumbWrapper from "./components/BreadcrumbWrapper";
import FinancialCalculators from "./components/calculators/FinancialCalculators";
import ContactUs from "./components/ContactUs";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import NotFoundPage from "./components/NotFoundPage";
import RssTicker from "./components/RssTicker";
import BreakingNews from "./pages/category/breakingnews/BreakingNews";
import ShoppingDeals from "./pages/category/deals-and-saving/ShoppingDeals";
import Budget from "./pages/category/Extra-Income/Budget";
import ExtraIncome from "./pages/category/Extra-Income/ExtraIncome";
import FreelanceJobs from "./pages/category/Extra-Income/FreelanceJobs";
import MoneyMakingApps from "./pages/category/Extra-Income/MoneyMakingApps";
import RemoteOnlineJobs from "./pages/category/Extra-Income/RemoteOnlineJobs";
import StartABlog from "./pages/category/start-a-blog/StartABlog";
import HomePage from "./pages/HomePage";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const App: React.FC = () => {
	const location = useLocation();
	const canonicalUrl = `https://www.dollarsandlife.com${location.pathname}`;

	const [showAdBlockPrompt, setShowAdBlockPrompt] = useState(false);

	// Force lowercase full reload
	useEffect(() => {
		if (/[A-Z]/.test(location.pathname)) {
			const lowerCaseUrl = location.pathname.toLowerCase();
			if (location.pathname !== lowerCaseUrl) {
				window.location.href = lowerCaseUrl;
			}
		}
	}, [location.pathname]);

	useEffect(() => {
		const loadAdsense = () => {
			if (document.querySelector('script[src*="adsbygoogle.js"]')) return;

			const adScript = document.createElement("script");
			adScript.src =
				"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
			adScript.async = true;
			adScript.setAttribute("data-ad-client", "ca-pub-1079721341426198");
			document.head.appendChild(adScript);
		};

		const handleInteraction = () => {
			loadAdsense();
			window.removeEventListener("scroll", handleInteraction);
			window.removeEventListener("click", handleInteraction);
		};

		window.addEventListener("scroll", handleInteraction);
		window.addEventListener("click", handleInteraction);

		return () => {
			window.removeEventListener("scroll", handleInteraction);
			window.removeEventListener("click", handleInteraction);
		};
	}, []);

	useEffect(() => {
		setTimeout(() => {
			const googleConsentPrompt = document.querySelector(".fc-consent-root");
			if (googleConsentPrompt) return;

			const adBlockTest = document.createElement("script");
			adBlockTest.src =
				"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
			adBlockTest.type = "text/javascript";
			adBlockTest.async = true;

			adBlockTest.onerror = () => {
				setShowAdBlockPrompt(true);
			};

			document.body.appendChild(adBlockTest);
		}, 2000);
	}, []);

	const handleDismissAdBlockPrompt = () => {
		setShowAdBlockPrompt(false);

		setTimeout(() => {
			const adBlockRetest = document.createElement("script");
			adBlockRetest.src =
				"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
			adBlockRetest.type = "text/javascript";
			adBlockRetest.async = true;

			adBlockRetest.onerror = () => {
				setShowAdBlockPrompt(true);
			};

			document.body.appendChild(adBlockRetest);
		}, 3000);
	};

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
						<p>
							<strong>
								Please consider disabling your ad blocker to support us.
							</strong>
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
					<meta
						property='og:title'
						content='Dollars And Life - Personal Finance & Savings'
					/>
					<meta
						property='og:description'
						content='Discover financial strategies, income opportunities, and shopping deals at Dollars And Life. Get insights on starting a blog, budgeting, and passive income apps.'
					/>
					<meta property='og:url' content={canonicalUrl} />
					<meta property='og:type' content='website' />
					<meta
						property='og:image'
						content='https://www.dollarsandlife.com/path-to-site-image.jpg'
					/>
					<meta property='twitter:card' content='summary_large_image' />
					<meta
						property='twitter:title'
						content='Dollars And Life - Smart Financial Choices'
					/>
					<meta
						property='twitter:description'
						content='Financial freedom starts here. Learn budgeting, side hustles, and investment strategies.'
					/>
					<meta
						property='twitter:image'
						content='https://www.dollarsandlife.com/path-to-site-image.jpg'
					/>
					<script type='application/ld+json'>
						{JSON.stringify({
							"@context": "https://schema.org",
							"@type": "BreadcrumbList",
							itemListElement: [
								{
									"@type": "ListItem",
									position: 1,
									name: "Home",
									item: "https://www.dollarsandlife.com/",
								},
								{
									"@type": "ListItem",
									position: 2,
									name: location.pathname.replace("/", "") || "Page",
									item: canonicalUrl,
								},
							],
						})}
					</script>
				</Helmet>

				<Navbar />
				<RssTicker />
				{location.pathname !== "/" && <BreadcrumbWrapper />}
				<div className='main-content'>
					<Routes>
						<Route path='/' element={<HomePage />} />
						<Route path='/extra-income' element={<ExtraIncome />} />
						<Route
							path='/extra-income/freelancers/*'
							element={<FreelanceJobs />}
						/>
						<Route path='/extra-income/budget/*' element={<Budget />} />
						<Route
							path='/extra-income/remote-jobs/*'
							element={<RemoteOnlineJobs />}
						/>
						<Route
							path='/extra-income/money-making-apps/*'
							element={<MoneyMakingApps />}
						/>
						<Route path='/shopping-deals' element={<ShoppingDeals />} />
						<Route path='/start-a-blog/*' element={<StartABlog />} />
						<Route
							path='/financial-calculators'
							element={<FinancialCalculators />}
						/>
						<Route path='/breaking-news' element={<BreakingNews />} />
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
						<Route path='/terms-of-service' element={<TermsOfService />} />
						<Route path='/privacy-policy' element={<PrivacyPolicy />} />
						<Route path='/contact-us' element={<ContactUs />} />
						<Route path='*' element={<NotFoundPage />} />
					</Routes>
				</div>

				<Footer />
			</div>
		</HelmetProvider>
	);
};

const WrappedApp: React.FC = () => (
	<Router>
		<App />
	</Router>
);

export default WrappedApp;
