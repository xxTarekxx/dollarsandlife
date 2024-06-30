import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import Budget from "./pages/category/Extra-Income/Budget";
import ExtraIncome from "./pages/category/Extra-Income/ExtraIncome";
import FreeLanceJobs from "./pages/category/Extra-Income/FreelanceJobs";
import StartAblog from "./pages/category/start-a-blog/StartABlog";
import MoneyMakingApps from "./pages/category/Extra-Income/passive-income/MoneyMakingApps";
import RemoteOnlineJobs from "./pages/category/Extra-Income/RemoteOnlineJobs";
import SideHustles from "./pages/category/Extra-Income/SideHustles";
import DealsAndSavings from "./pages/category/deals-and-saving/DealsAndSaving";
import BlogPostContent from "./components/BlogPostContent";

const App = () => {
	return (
		<Router>
			<Navbar />
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/category/extra-income' element={<ExtraIncome />} />
				<Route
					path='/category/extra-income/freelancers/*'
					element={<FreeLanceJobs />}
				/>

				<Route path='/category/extra-income/budgetting' element={<Budget />} />
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
				<Route
					path='/category/deals-and-saving/deals-and-savings'
					element={<DealsAndSavings />}
				/>
				<Route
					path='/category/extra-income/start-a-blog'
					element={<StartAblog />}
				/>
				<Route
					path='/category/extra-income/freelancers/:id'
					element={<BlogPostContent />}
				/>
			</Routes>
			<Footer />
		</Router>
	);
};

export default App;
