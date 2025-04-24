import React, {
	memo,
	useCallback, // Keep useCallback import, but we won't wrap closeMenuAndNavigate
	useState,
	Suspense,
	lazy,
	useEffect,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./NavBar.css";

// Lazily import the SearchFeature component
const SearchFeature = lazy(() => import("./SearchFeature"));

// Define the breakpoint constant
const MOBILE_BREAKPOINT = 1076;

const NavBar: React.FC = () => {
	// State for menu and search visibility
	const [menuOpen, setMenuOpen] = useState(false);
	const [isClosing, setIsClosing] = useState(false); // For menu animation
	const [searchOpen, setSearchOpen] = useState(false);

	const navigate = useNavigate();
	const location = useLocation();

	// --- Handlers ---

	// Toggle Search
	const handleSearchInteraction = () => {
		setSearchOpen((prev) => !prev);
		if (!searchOpen) {
			if (menuOpen) {
				setIsClosing(true);
				setTimeout(() => {
					setMenuOpen(false);
					setIsClosing(false);
				}, 400);
			}
		}
	};

	// Close Search (Callback for SearchFeature)
	const handleCloseSearch = useCallback(() => {
		setSearchOpen(false);
	}, []);

	// Close Menu & Navigate (Viewport Aware - NO useCallback here)
	const closeMenuAndNavigate = (to: string) => {
		// Check viewport width dynamically on click
		const isMobile = window.matchMedia(
			`(max-width: ${MOBILE_BREAKPOINT}px)`,
		).matches;

		if (isMobile) {
			// Mobile logic: requires menu to be open and not closing
			if (menuOpen && !isClosing) {
				setIsClosing(true);
				const timer = setTimeout(() => {
					setMenuOpen(false);
					setIsClosing(false);
					navigate(to);
				}, 400);
			} else {
				console.log(
					"[Mobile] Navigation prevented: menuOpen=",
					menuOpen,
					"isClosing=",
					isClosing,
				);
			}
		} else {
			navigate(to);
		}
	};

	// Toggle Mobile Menu (for Hamburger)
	const toggleMobileMenu = () => {
		if (isClosing) return;

		if (menuOpen) {
			setIsClosing(true);
			setTimeout(() => {
				setMenuOpen(false);
				setIsClosing(false);
			}, 400);
		} else {
			setMenuOpen(true);
			if (searchOpen) {
				setSearchOpen(false);
			}
		}
	};

	return (
		<nav className='nav'>
			{/* Logo */}
			<div className='logo'>
				<Link to='/' aria-label='Home'>
					<img
						src='/images/website-logo.webp'
						alt='Logo'
						className='logo'
						width='240'
						height='46'
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
					{[
						{ to: "/extra-income", text: "Extra Income" },
						{ to: "/shopping-deals", text: "Shopping Deals" },
						{ to: "/start-a-blog", text: "Start A Blog" },
						{ to: "/breaking-news", text: "Breaking News" },
						{ to: "/financial-calculators", text: "Financial Calculators" },
						{ to: "/about-us", text: "About Us" },
					].map((link, i) => (
						<Link
							key={i}
							to={link.to}
							className={`menu-item ${
								location.pathname.startsWith(link.to) ? "active" : ""
							}`}
							onClick={(e) => {
								e.preventDefault(); // Prevent default link navigation
								closeMenuAndNavigate(link.to); // Call viewport-aware function
							}}
							style={{ animationDelay: `${i * 0.1}s` }}
						>
							{link.text}
						</Link>
					))}
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

				{/* Search Icon */}
				<div
					className='search-icon'
					onClick={handleSearchInteraction}
					role='button'
					aria-label='Toggle search'
				>
					<img
						src='/images/favicon/searchicon.svg'
						alt='Search icon'
						className='search-icon-image'
					/>
				</div>
			</div>

			{/* Lazy Search Feature */}
			{searchOpen && (
				<Suspense
					fallback={
						<div
							className='search-bar-container open'
							style={{ minHeight: "40px", zIndex: 5 }}
						>
							<div className='search-loading'>Loading Search...</div>
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
