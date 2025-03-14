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
// import CookieConsentBanner from "./components/CookieConsentBanner";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
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

	// State for AdBlock detection
	const [showAdBlockPrompt, setShowAdBlockPrompt] = useState(false);

	// Detect AdBlock and show the prompt
	useEffect(() => {
		console.log("Initializing AdBlock detection...");

		setTimeout(() => {
			// Skip AdBlock prompt if Google's Consent Management is active
			const googleConsentPrompt = document.querySelector(".fc-consent-root");
			if (googleConsentPrompt) {
				console.log(
					"Google Consent Message detected. Skipping custom AdBlock prompt.",
				);
				return;
			}

			// Create an ad script element
			const adBlockTest = document.createElement("script");
			adBlockTest.src =
				"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
			adBlockTest.type = "text/javascript";
			adBlockTest.async = true;

			adBlockTest.onerror = () => {
				console.log("Ad blocker detected! Showing the prompt...");
				setShowAdBlockPrompt(true);
			};

			document.body.appendChild(adBlockTest);
		}, 2000); // Delay detection to allow page elements to load
	}, []);

	// Function to dismiss the AdBlock prompt and check again
	const handleDismissAdBlockPrompt = () => {
		console.log("User dismissed AdBlock prompt. Checking again...");

		setShowAdBlockPrompt(false);

		// Retest AdBlock after dismissal
		setTimeout(() => {
			const adBlockRetest = document.createElement("script");
			adBlockRetest.src =
				"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
			adBlockRetest.type = "text/javascript";
			adBlockRetest.async = true;

			adBlockRetest.onerror = () => {
				console.log("Ad blocker is still enabled!");
				setShowAdBlockPrompt(true);
			};

			document.body.appendChild(adBlockRetest);
		}, 3000); // Delay before checking again
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

					{/* Structured Data for Breadcrumbs */}
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
									name: location.pathname.replace("/", "") || "Page", // Fallback to "Page" if empty
									item: canonicalUrl,
								},
							],
						})}
					</script>
				</Helmet>

				<Navbar />
				{location.pathname !== "/" && <BreadcrumbWrapper />}
				<div className='main-content'>
					<Routes>
						<Route path='/' element={<HomePage />} />
						<Route path='/Extra-Income' element={<ExtraIncome />} />
						<Route
							path='/Extra-Income/Freelancers/*'
							element={<FreelanceJobs />}
						/>
						<Route path='/Extra-Income/Budget/*' element={<Budget />} />
						<Route
							path='/Extra-Income/Remote-Jobs/*'
							element={<RemoteOnlineJobs />}
						/>
						<Route
							path='/Extra-Income/Money-Making-Apps/*'
							element={<MoneyMakingApps />}
						/>
						<Route path='/Shopping-Deals' element={<ShoppingDeals />} />
						<Route path='/Start-A-Blog/*' element={<StartABlog />} />
						<Route
							path='/my-story'
							element={<BlogPostContent jsonFile='mystory.json' />}
						/>
						<Route
							path='/financial-calculators'
							element={<FinancialCalculators />}
						/>
						<Route path='/breaking-news' element={<BreakingNews />} />
						<Route
							path='/Extra-Income/:id'
							element={<BlogPostContent jsonFile='budgetdata.json' />}
						/>
						<Route
							path='/Shopping-Deals/:id'
							element={<BlogPostContent jsonFile='products.json' />}
						/>
						<Route
							path='/Start-A-Blog/:id'
							element={<BlogPostContent jsonFile='startablogdata.json' />}
						/>
						<Route
							path='/breaking-news/:id'
							element={<BlogPostContent jsonFile='breakingnews.json' />}
						/>
						<Route path='/terms-of-service' element={<TermsOfService />} />
						<Route path='/privacy-policy' element={<PrivacyPolicy />} />
						<Route path='/contact-us' element={<ContactUs />} />
					</Routes>
				</div>
				<Footer />
				{/* <CookieConsentBanner /> */}
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
