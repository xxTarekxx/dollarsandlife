import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import SideHustles from "./pages/category/Extra-Income/SideHustles";
import PassiveIncome from "./pages/category/Extra-Income/PassiveIncome";
import DealsAndSavings from "./pages/category/deals-and-saving/DealsAndSaving";
import Footer from "./components/Footer";
import ExtraIncome from "./pages/category/Extra-Income/ExtraIncome";
import FreeLanceJobs from "./pages/category/Extra-Income/FreelanceJobs";
import MoneyMakingApps from "./pages/category/Extra-Income/MoneyMakingApps";
import RemoteOnlineJobs from "./pages/category/Extra-Income/RemoteOnlineJobs";

const App: React.FC = () => {
	return (
		<Router>
			<Navbar />
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route path='/category/extra-income' element={<ExtraIncome />} />
				<Route
					path='/category/extra-income/freelancers'
					element={<FreeLanceJobs />}
				/>
				<Route
					path='/category/extra-income/Passive-income'
					element={<PassiveIncome />}
				/>
				<Route
					path='/category/extra-income/Remote-Jobs'
					element={<RemoteOnlineJobs />}
				/>
				<Route
					path='/category/extra-income/Side-Hustles'
					element={<SideHustles />}
				/>
				<Route
					path='/category/extra-income/money-making-apps'
					element={<MoneyMakingApps />}
				/>
				<Route path='/side-hustles' element={<SideHustles />} />
				<Route
					path='/category/deals-and-saving/ProductDisplay'
					element={<DealsAndSavings />}
				/>
				<Route path='/passive-income' element={<PassiveIncome />} />

				{/* Add other routes here */}
			</Routes>
			<Footer />
		</Router>
	);
};

export default App;
