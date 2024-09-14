import React from "react";
import {
	Route,
	BrowserRouter as Router,
	Routes,
	useLocation,
} from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import BlogPostContent from "./components/BlogPostContent"; // Import the BlogPostContent component
import Budget from "./pages/category/Extra-Income/Budget";
import ExtraIncome from "./pages/category/Extra-Income/ExtraIncome";
import FreeLanceJobs from "./pages/category/Extra-Income/FreelanceJobs";
import MoneyMakingApps from "./pages/category/Extra-Income/MoneyMakingApps";
import RemoteOnlineJobs from "./pages/category/Extra-Income/RemoteOnlineJobs";
import ShoppingDeals from "./pages/category/deals-and-saving/ShoppingDeals";
import SideHustles from "./pages/category/Extra-Income/SideHustles";
import StartAblog from "./pages/category/start-a-blog/StartABlog";
import TermsOfService from "./pages/TermsOfService";
import ContactUs from "./components/ContactUs";
import BreadcrumbWrapper from "./components/BreadcrumbWrapper";
import FinancialCalculators from "./components/FinancialCalculators";
import styled from "styled-components";

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
		<AppContainer>
			<Navbar />
			{location.pathname !== "/" && <BreadcrumbWrapper />}
			<MainContent>
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/extra-income' element={<ExtraIncome />} />
					<Route
						path='/extra-income/freelancers/*'
						element={<FreeLanceJobs />}
					/>
					<Route path='/extra-income/Budget/*' element={<Budget />} />
					<Route
						path='/extra-income/remote-jobs/*'
						element={<RemoteOnlineJobs />}
					/>
					<Route
						path='/extra-income/side-hustles/*'
						element={<SideHustles />}
					/>
					<Route
						path='/extra-income/money-making-apps/*'
						element={<MoneyMakingApps />}
					/>
					<Route path='/shopping-Deals' element={<ShoppingDeals />} />
					<Route path='/start-a-blog/*' element={<StartAblog />} />
					{/* Route for "My Story" to render BlogPostContent with mystory.json */}
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
				</Routes>
			</MainContent>
			<Footer />
		</AppContainer>
	);
};

const WrappedApp: React.FC = () => (
	<Router>
		<App />
	</Router>
);

export default WrappedApp;
