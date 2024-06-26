import React, { useState } from "react";
import styled from "styled-components";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/images/website-logo.webp";
import SearchImg from "../assets/images/favcons/searchicon.svg";

const Nav = styled.nav`
	background: White;
	height: 60px;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
	border-radius: 20px;
	position: sticky;
	top: 0;
	padding: 0 1.5em;
	box-sizing: border-box;

	@media (max-width: 768px) {
		padding: 0 1em;
	}
`;

const Logo = styled.img`
	padding-left: 15px;
	width: 255px;
	height: 50px;
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
		position: fixed;
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

	&:hover {
		color: #00a60b;
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
	position: fixed;
	top: 60px;
	width: 100%;
	display: ${({ open }) => (open ? "block" : "none")};
	padding: 0 1rem;
	border-radius: 0 0 20px 20px;
	box-sizing: border-box;
	overflow: hidden;
	z-index: 1;
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
	justify-content: center;
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

	const menuItems = [
		{ to: "/", text: "Home" },
		{ to: "/category/extra-income/", text: "Extra Income" },
		{
			to: "/category/deals-and-saving/Deals-And-Savings",
			text: "Deals & Saving",
		},
		{ to: "/category/extra-income/Start-A-Blog", text: "Start A Blog" },
		{ to: "/category/extra-income/Start-A-Blog", text: "My Story" },
	];

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
						{menuItems.map((item, index) => (
							<MenuItem
								key={index}
								to={item.to}
								style={
									location.pathname === item.to ? { color: "#00A60B" } : {}
								}
								onClick={(event) => {
									event.stopPropagation();
									setIsOpen(false);
								}}
							>
								{item.text}
							</MenuItem>
						))}
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
