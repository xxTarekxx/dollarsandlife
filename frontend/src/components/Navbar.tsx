import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "/images/website-logo.webp";
import SearchImg from "/images/favcons/searchicon.svg";
import "./NavBar.css";

const Navbar: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const location = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location.pathname]);

	const menuItems = [
		{ to: "/", text: "Home" },
		{ to: "/extra-income/", text: "Extra Income" },
		{ to: "/Shopping-deals", text: "Shopping Deals" },
		{ to: "/Start-A-Blog", text: "Start A Blog" },
		{ to: "/My-Story", text: "My Story" },
	];

	const handleMenuItemClick = (
		event: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
		to: string,
	) => {
		event.stopPropagation();
		setIsOpen(false);
		if (location.pathname !== to) {
			window.location.href = to;
		}
	};

	return (
		<>
			<nav className='nav'>
				<img
					className='logo'
					src={logo}
					alt='logo'
					onClick={() => (window.location.href = "/")}
				/>
				<div style={{ display: "flex", alignItems: "center" }}>
					<div className='hamburger' onClick={() => setIsOpen(!isOpen)}>
						<div />
						<div />
						<div />
					</div>
					<div className={`menu ${isOpen ? "open" : "closed"}`}>
						{menuItems.map((item, index) => (
							<Link
								key={index}
								className='menu-item'
								to={item.to}
								style={
									location.pathname === item.to ? { color: "#00A60B" } : {}
								}
								onClick={(event) => handleMenuItemClick(event, item.to)}
							>
								{item.text}
							</Link>
						))}
					</div>
					<div
						className='search-icon'
						onClick={() => setIsSearchOpen(!isSearchOpen)}
					>
						<img className='search-icon-image' src={SearchImg} alt='search' />
					</div>
				</div>
			</nav>
			<div
				className={`search-bar-container ${isSearchOpen ? "open" : "closed"}`}
			>
				<input className='search-bar' type='text' placeholder='Search...' />
			</div>
		</>
	);
};

export default React.memo(Navbar);
