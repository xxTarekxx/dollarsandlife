import React from "react";
import {
	Route,
	BrowserRouter as Router,
	Routes,
	useLocation,
} from "react-router-dom";
import styled from "styled-components";
import { HelmetProvider, Helmet } from "react-helmet-async";
import "./App.css";
import BlogPostContent from "./components/BlogPostContent";
import BreadcrumbWrapper from "./components/BreadcrumbWrapper";
import FinancialCalculators from "./components/calculators/FinancialCalculators";
import ContactUs from "./components/ContactUs";
import CookieConsentBanner from "./components/CookieConsentBanner";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ShoppingDeals from "./pages/category/deals-and-saving/ShoppingDeals";
import Budget from "./pages/category/Extra-Income/Budget";
import ExtraIncome from "./pages/category/Extra-Income/ExtraIncome";
import FreelanceJobs from "./pages/category/Extra-Income/FreelanceJobs";
import MoneyMakingApps from "./pages/category/Extra-Income/MoneyMakingApps";
import RemoteOnlineJobs from "./pages/category/Extra-Income/RemoteOnlineJobs";
import StartABlog from "./pages/category/start-a-blog/StartABlog";
import HomePage from "./pages/HomePage";
import TermsOfService from "./pages/TermsOfService";
import BreakingNews from "./pages/category/breakingnews/BreakingNews";

const AppContainer = styled.div`
	display: flex;
	flex-direction: column;
	min-height: 100vh;
`;

const MainContent = styled.div`
	flex: 1;
`;

const App: React.FC = () => {
	const location = useLocation();
	const canonicalUrl = `https://www.dollarsandlife.com${location.pathname}`;

	return (
		<HelmetProvider>
			<AppContainer>
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
									name: location.pathname.replace("/", ""),
									item: canonicalUrl,
								},
							],
						})}
					</script>
				</Helmet>

				<Navbar />
				{location.pathname !== "/" && <BreadcrumbWrapper />}
				<MainContent>
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
							path='/my-story'
							element={<BlogPostContent jsonFile='mystory.json' />}
						/>
						<Route path='/terms-of-service' element={<TermsOfService />} />
						<Route path='/contact-us' element={<ContactUs />} />
						<Route
							path='/financial-calculators'
							element={<FinancialCalculators />}
						/>
						<Route path='/breaking-news' element={<BreakingNews />} />

						{/* Blog Post Pages with Dynamic JSON Files */}
						<Route
							path='/extra-income/:id'
							element={<BlogPostContent jsonFile='budgetdata.json' />}
						/>
						<Route
							path='/shopping-deals/:id'
							element={<BlogPostContent jsonFile='products.json' />}
						/>
						<Route
							path='/start-a-blog/:id'
							element={<BlogPostContent jsonFile='startablogdata.json' />}
						/>
						<Route
							path='/breaking-news/:id'
							element={<BlogPostContent jsonFile='breakingnews.json' />}
						/>
					</Routes>
				</MainContent>
				<Footer />
				<CookieConsentBanner />
			</AppContainer>
		</HelmetProvider>
	);
};

const WrappedApp: React.FC = () => (
	<Router>
		<App />
	</Router>
);

export default WrappedApp;
