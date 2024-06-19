import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
// import Bargains from "./pages/category/Deals-and-saving/Bargains";
import ManageYourFinances from "./pages/category/Extra-Income/ManageYourFinances";
import StartABlog from "./pages/category/Extra-Income/StartABlog";
import SideHustles from "./pages/category/Extra-Income/SideHustles";
import PassiveIncome from "./pages/category/Extra-Income/PassiveIncome";
// import ProductDisplay from "./pages/category/deals-and-saving/ProductDisplay";
import DealsAndSavings from "./pages/category/deals-and-saving/DealsAndSaving";
import Footer from "./components/Footer";

const App: React.FC = () => {
	return (
		<Router>
			<Navbar />
			<Routes>
				<Route path='/' element={<HomePage />} />
				<Route
					path='/category/manageyourfinances'
					element={<ManageYourFinances />}
				/>
				<Route path='/side-hustles' element={<SideHustles />} />
				<Route path='/start-a-blog' element={<StartABlog />} />
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
