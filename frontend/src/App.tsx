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

	return (
		<HelmetProvider>
			<AppContainer>
				<Helmet>
					<link
						rel='canonical'
						href={`https://www.dollarsandlife.com${location.pathname}`}
					/>
					<meta
						name='description'
						content='Dollars And Life is a personal finance blog offering tips on earning extra income, finding the best deals, and achieving financial freedom.'
					/>
					<meta
						property='og:description'
						content='Dollars And Life is your go-to resource for personal finance, offering guides on budgeting, extra income, and money-saving tips.'
					/>
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

						{/* ✅ Fix: Ensure jsonFile is passed correctly */}
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
