"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { Suspense, lazy, memo, useEffect, useState } from "react";
import { prefixLang } from "@/lib/i18n/prefixLang";
import type { NavLabels } from "@/lib/i18n/ui-translations";
import searchIcon from "../../assets/images/favicon/searchicon.svg";
import logoImagePath from "../../assets/images/website-logo.webp";
import LanguageSwitcher from "../LanguageSwitcher";

// Lazily import the SearchFeature component
const SearchFeature = lazy(() => import("./SearchFeature"));

// Define the breakpoint constant
const MOBILE_BREAKPOINT = 1076;

const NavBar: React.FC<{ lang?: string; labels?: NavLabels }> = ({ lang, labels }) => {
	// State for menu and search visibility
	const [menuOpen, setMenuOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false); // For menu animation
	const [searchOpen, setSearchOpen] = useState(false);
	const [isClient, setIsClient] = useState(false);

	const router = useRouter();
	const pathname = usePathname() ?? "";

	// Ensure we're on the client side
	useEffect(() => {
		setIsClient(true);
	}, []);

	// --- Handlers ---

	// Toggle Search
	const handleSearchInteraction = () => {
		setSearchOpen((prev) => !prev);
		if (!searchOpen) {
			// If search is being opened
			if (menuOpen) {
				// And menu is open, close the menu
				setIsClosing(true);
				setTimeout(() => {
					setMenuOpen(false);
					setIsClosing(false);
				}, 500);
			}
		}
	};

	// Close Search (Callback for SearchFeature)
	// Wrapped in useCallback because it's passed as a prop to SearchFeature
	const handleCloseSearch = React.useCallback(() => {
		setSearchOpen(false);
	}, []);

	// Close Menu & Navigate (Viewport Aware)
	const closeMenuAndNavigate = (to: string) => {
		if (!isClient) return;

		const isMobile = window.matchMedia(
			`(max-width: ${MOBILE_BREAKPOINT}px)`,
		).matches;

		if (isMobile) {
			if (menuOpen && !isClosing) {
				setIsClosing(true);
				setTimeout(() => {
					// Use setTimeout to allow animation to play
					setMenuOpen(false);
					setIsClosing(false);
					router.push(prefixLang(to, lang));
				}, 500); // Match CSS animation duration
			} else {
				// If menu isn't open on mobile, just navigate (e.g. logo click)
				// Or if it's already closing, the navigation will happen after animation.
				if (!menuOpen) router.push(prefixLang(to, lang));
			}
		} else {
			// Desktop: just navigate
			router.push(prefixLang(to, lang));
		}
	};

	// Toggle Mobile Menu (for Hamburger)
	const toggleMobileMenu = () => {
		if (isClosing) return; // Prevent re-toggling during closing animation

		if (menuOpen) {
			setIsClosing(true);
			setTimeout(() => {
				setMenuOpen(false);
				setIsClosing(false);
			}, 400);
		} else {
			setMenuOpen(true);
			if (searchOpen) {
				// If search is open, close it when opening menu
				setSearchOpen(false);
			}
		}
	};

	// Define menu items — use translated labels when provided, else fall back to English
	const menuItems = [
		{ to: "/forum", text: labels?.forum ?? "Forum" },
		{ to: "/extra-income", text: labels?.extraIncome ?? "Extra Income" },
		{ to: "/shopping-deals", text: labels?.shoppingDeals ?? "Shopping Deals" },
		{ to: "/start-a-blog", text: labels?.startABlog ?? "Start A Blog" },
		{ to: "/breaking-news", text: labels?.breakingNews ?? "Breaking News" },
		{ to: "/financial-calculators", text: labels?.financialCalculators ?? "Financial Calculators" },
		{ to: "/about-us", text: labels?.aboutUs ?? "About Us" },
	];

	// Get current pathname safely
	const currentPathname = isClient ? pathname : "";

	return (
		<nav className='nav'>
			{/* Logo */}
			<div className='logo'>
				<Link
					href={prefixLang("/", lang)}
					aria-label='Home'
					onClick={(e) => {
						// Ensure menu closes if logo is clicked on mobile
						if (
							isClient &&
							menuOpen &&
							window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
						) {
							e.preventDefault();
							closeMenuAndNavigate(prefixLang("/", lang));
						}
						// For desktop, default Link behavior is fine, or use closeMenuAndNavigate if preferred
					}}
				>
					<Image
						src={logoImagePath}
						alt='Logo'
						className='logo'
						width={240}
						height={46}
						priority
					/>
				</Link>
			</div>

			{/* Right-side controls */}
			<div className='right-controls'>
				{/* Mobile/Desktop Menu */}
				<div
					className={`menu ${
						menuOpen ? (isClosing ? "closing" : "open") : "closed"
					}`}
				>
					{menuItems.map(
						(
							link,
							i, // Use the menuItems array
						) => (
							<Link
								key={i}
								href={prefixLang(link.to, lang)}
								className={`menu-item ${
									(currentPathname === prefixLang("/", lang) && link.to === "/") ||
									(link.to !== "/" &&
										currentPathname.startsWith(prefixLang(link.to, lang)))
										? "active"
										: ""
								}`}
								onClick={(e) => {
									e.preventDefault();
									closeMenuAndNavigate(prefixLang(link.to, lang));
								}}
								style={{ animationDelay: `${i * 0.1}s` }}
							>
								{link.text}
							</Link>
						),
					)}
				</div>

				{/* Hamburger Icon */}
				<div
					className={`hamburger ${menuOpen ? "open" : ""}`}
					onClick={toggleMobileMenu}
					role='button'
					aria-label='Toggle menu'
					aria-expanded={menuOpen}
				>
					<div></div>
					<div></div>
					<div></div>
				</div>

				{/* Language Switcher */}
				<LanguageSwitcher />

				{/* Search Icon */}
				<div
					className='search-icon'
					onClick={handleSearchInteraction}
					role='button'
					aria-label='Toggle search'
				>
					<img
						src={searchIcon.src}
						alt='Search icon'
						className='search-icon-image'
					/>
				</div>
			</div>

			{/* Lazy Search Feature */}
			{searchOpen && (
				<Suspense
					fallback={
						<div className='search-bar-overlay open'>
							<div className='search-bar-container'>
								<div className='search-loading'>Loading Search...</div>
							</div>
						</div>
					}
				>
					<SearchFeature isOpen={searchOpen} onClose={handleCloseSearch} />
				</Suspense>
			)}
		</nav>
	);
};

export default memo(NavBar);
