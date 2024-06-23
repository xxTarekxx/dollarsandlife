import React, { useState } from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/website-logo.png";
import SearchImg from "../assets/images/favcons/searchicon.svg";

const Nav = styled.nav`
	background: White;
	height: 60px;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-radius: 20px;
	position: sticky; /* Add this line */
	top: 0; /* Add this line */
	// z-index: 6; /* Add this line */
	padding: 0 1.5em;
	box-sizing: border-box;

	@media (max-width: 768px) {
		padding: 0 1em;
	}
`;

const Logo = styled.img`
	padding-left: 20px;
	width: 226px; /* Set the width */
	height: 40px; /* Set the height */
	cursor: pointer;
`;

const Hamburger = styled.div`
	display: none;
	flex-direction: column;
	cursor: pointer;

	div {
		width: 25px;
		height: 2px;
		background: #000;
		margin-bottom: 4px;
		border-radius: 5px;
	}

	@media (max-width: 768px) {
		display: flex;
	}
`;

const Menu = styled.div<{ open: boolean }>`
	display: flex;
	align-items: center;
	transition: all 0.3s ease-in-out;

	@media (max-width: 768px) {
		position: absolute;
		top: 60px;
		left: 0;
		flex-direction: column;
		width: 100%;
		background: white;
		display: ${({ open }) => (open ? "flex" : "none")};
	}
`;

const MenuItem = styled(Link)`
	padding: 0px 1rem;
	cursor: pointer;
	text-align: center;
	text-decoration: none;
	color: black;
	font-size: 1.08rem;
	position: relative; // Added for absolute positioning of pseudo-elements
	overflow: hidden; // Added to contain the pseudo-elements within the button

	&::before,
	&::after {
		content: "";
		position: absolute;
		width: 100%;
		height: 100%;
		display: block;
		background: rgba(255, 192, 0, 0.5);
		border-radius: 30%;
		top: 0;
		left: 0;
		z-index: -1;
		transform: scaleX(0);
		transition: transform 0.3s ease-in-out, opacity 0.5s ease-in-out;
	}

	&::before {
		left: -30%;
	}

	&::after {
		right: -30%;
		transition: transform 0.5s ease-in-out, background 0.5s; // Adjusted for the hover effect
	}

	&:hover::after {
		transform: scaleX(1); // Adjusted to match the scaleX transformation
	}

	&:active {
		transform: translateY(2px);
	}

	@media (max-width: 768px) {
		width: 100%;
		padding: 1rem 0;
		text-align: left;
		padding-left: 1rem;
		font-size: 1.2rem;
	}
`;

const SearchBarContainer = styled.div<{ open: boolean }>`
	position: absolute;
	top: 60px;
	width: 100%;
	display: ${({ open }) => (open ? "block" : "none")};
	padding: 0 1rem;
	border-radius: 0 0 20px 20px;
	box-sizing: border-box;
	overflow: hidden;
	// position: sticky;
`;

const SearchBar = styled.input`
	width: calc(80% - 2rem);
	background: rgba(0, 166, 11, 1);
	border-radius: 25%;
	float: right;
	padding: 0.5rem;
	box-sizing: border-box;
`;

const SearchIcon = styled.div`
	cursor: pointer;
	display: flex;
	align-items: center;
	justify-content: center; /* Center horizontally */
	height: 100%;
	margin-left: 1rem;

	@media (max-width: 768px) {
		order: -1;
		margin-left: 0;
		margin-right: 1rem;
	}
`;

const SearchIconImage = styled.img`
	width: 25px;
	height: 25px;
`;

const Navbar: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const location = useLocation();

	return (
		<>
			<Nav>
				<Logo
					src={logo}
					alt='logo'
					onClick={() => (window.location.href = "/")}
				/>
				<div style={{ display: "flex", alignItems: "center" }}>
					<Hamburger onClick={() => setIsOpen(!isOpen)}>
						<div />
						<div />
						<div />
					</Hamburger>
					<Menu open={isOpen}>
						<MenuItem
							to='/'
							style={location.pathname === "/" ? { color: "#00A60B" } : {}}
							onClick={(event) => {
								event.stopPropagation();
								setIsOpen(false);
							}}
						>
							Home
						</MenuItem>
						<MenuItem
							to='/category/extra-income/'
							style={
								location.pathname === "/category/extra-income/"
									? { color: "#00A60B" }
									: {}
							}
							onClick={(event) => {
								event.stopPropagation();
								setIsOpen(false);
							}}
						>
							Extra Income
						</MenuItem>

						{/* <MenuItem
							to='/passive-income'
							style={
								location.pathname === "/passive-income"
									? { color: "#00A60B" }
									: {}
							}
							onClick={(event) => {
								event.stopPropagation();
								setIsOpen(false);
							}}
						>
							Passive Income
						</MenuItem> */}
						{/* <MenuItem
							to='/side-hustles'
							style={
								location.pathname === "/side-hustles"
									? { color: "#00A60B" }
									: {}
							}
							onClick={(event) => {
								event.stopPropagation();
								setIsOpen(false);
							}}
						>
							Side Hustles
						</MenuItem> */}
						<MenuItem
							to='/category/deals-and-saving/Deals-And-Savings'
							style={
								location.pathname ===
								"/category/deals-and-saving/ProductDisplay"
									? { color: "#00A60B" }
									: {}
							}
							onClick={(event) => {
								event.stopPropagation();
								setIsOpen(false);
							}}
						>
							Deals & Saving
						</MenuItem>
						<MenuItem
							to='/start-a-blog'
							style={
								location.pathname === "/start-a-blog"
									? { color: "#00A60B" }
									: {}
							}
							onClick={(event) => {
								event.stopPropagation();
								setIsOpen(false);
							}}
						>
							Start A Blog
						</MenuItem>
					</Menu>
					<SearchIcon onClick={() => setIsSearchOpen(!isSearchOpen)}>
						<SearchIconImage src={SearchImg} alt='search' />
					</SearchIcon>
				</div>
			</Nav>
			<SearchBarContainer open={isSearchOpen}>
				<SearchBar type='text' placeholder='Search...' />
			</SearchBarContainer>
		</>
	);
};

export default React.memo(Navbar);
