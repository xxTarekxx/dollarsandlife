import React from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import BlogPostContent from "./components/BlogPostContent";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import MyStory from "./pages/MyStory";
import Budget from "./pages/category/Extra-Income/Budget";
import ExtraIncome from "./pages/category/Extra-Income/ExtraIncome";
import FreeLanceJobs from "./pages/category/Extra-Income/FreelanceJobs";
import MoneyMakingApps from "./pages/category/Extra-Income/MoneyMakingApps";
import RemoteOnlineJobs from "./pages/category/Extra-Income/RemoteOnlineJobs";
import DealsAndSavings from "./pages/category/deals-and-saving/DealsAndSavings";
import SideHustles from "./pages/category/Extra-Income/SideHustles";
import StartAblog from "./pages/category/start-a-blog/StartABlog";
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
	return (
		<Router>
			<Navbar />
			<MainContent>
				<Routes>
					<Route path='/' element={<HomePage />} />
					<Route path='/category/extra-income' element={<ExtraIncome />} />
					<Route
						path='/category/extra-income/freelancers'
						element={<FreeLanceJobs />}
					/>
					<Route
						path='/category/extra-income/budgetting'
						element={<Budget />}
					/>
					<Route
						path='/category/extra-income/remote-jobs'
						element={<RemoteOnlineJobs />}
					/>
					<Route
						path='/category/extra-income/side-hustles'
						element={<SideHustles />}
					/>
					<Route
						path='/category/extra-income/money-making-apps'
						element={<MoneyMakingApps />}
					/>
					<Route path='/deals-and-savings' element={<DealsAndSavings />} />
					<Route path='/start-a-blog' element={<StartAblog />} />
					<Route path='/My-Story' element={<MyStory />} />
					<Route
						path='/category/extra-income/freelancers/:id'
						element={<BlogPostContent />}
					/>
				</Routes>
			</MainContent>
			<Footer />
		</Router>
	);
};

export default App;
