import React, { useEffect } from "react";
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
import MyStory from "./pages/MyStory";
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
import styled from "styled-components";

const AppContainer = styled.div`
	display: flex;
	flex-direction: column;
	min-height: 100vh;
`;

const MainContent = styled.div`
	flex: 1;
`;

// ScrollToTop Component to scroll to the top smoothly on every route change
const ScrollToTop: React.FC = () => {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	}, [pathname]);

	return null;
};

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
					<Route path='/My-Story' element={<MyStory />} />
					<Route path='/terms-of-service' element={<TermsOfService />} />
					<Route path='/contact-us' element={<ContactUs />} />
				</Routes>
			</MainContent>
			<Footer />
		</AppContainer>
	);
};

const WrappedApp: React.FC = () => (
	<Router>
		<ScrollToTop />{" "}
		{/* Ensures scroll-to-top with smooth behavior on every route change */}
		<App />
	</Router>
);

export default WrappedApp;
