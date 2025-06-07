import React, {
	Suspense,
	lazy,
	memo,
	// useCallback, // Keep useCallback import if SearchFeature or other parts still use it
	useState,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./NavBar.css";
import logoImagePath from "../../assets/images/website-logo.webp";
import searchIcon from "../../assets/images/favicon/searchicon.svg";

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
			// If search is being opened
			if (menuOpen) {
				// And menu is open, close the menu
				setIsClosing(true);
				setTimeout(() => {
					setMenuOpen(false);
					setIsClosing(false);
				}, 400);
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
					navigate(to);
				}, 400); // Match CSS animation duration
			} else {
				// If menu isn't open on mobile, just navigate (e.g. logo click)
				// Or if it's already closing, the navigation will happen after animation.
				if (!menuOpen) navigate(to);
			}
		} else {
			// Desktop: just navigate
			navigate(to);
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

	// Define menu items including the new "Ask a Question"
	const menuItems = [
		{ to: "/forum", text: "Ask a Question" },
		{ to: "/extra-income", text: "Extra Income" },
		{ to: "/shopping-deals", text: "Shopping Deals" },
		{ to: "/start-a-blog", text: "Start A Blog" },

		{ to: "/breaking-news", text: "Breaking News" },
		{ to: "/financial-calculators", text: "Financial Calculators" },
		{ to: "/about-us", text: "About Us" },
	];

	return (
		<nav className='nav'>
			{/* Logo */}
			<div className='logo'>
				<Link
					to='/'
					aria-label='Home'
					onClick={(e) => {
						// Ensure menu closes if logo is clicked on mobile
						if (
							menuOpen &&
							window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches
						) {
							e.preventDefault();
							closeMenuAndNavigate("/");
						}
						// For desktop, default Link behavior is fine, or use closeMenuAndNavigate if preferred
					}}
				>
					<img
						src={logoImagePath}
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
					{menuItems.map(
						(
							link,
							i, // Use the menuItems array
						) => (
							<Link
								key={i}
								to={link.to}
								className={`menu-item ${
									// Special highlighting for "Ask a Question" if on any /forum path
									(link.to === "/forum" &&
										location.pathname.startsWith("/forum")) ||
									(location.pathname.startsWith(link.to) && link.to !== "/") || // Avoid highlighting all for "/"
									(location.pathname === "/" && link.to === "/") // Explicitly for home if needed
										? "active"
										: ""
								}`}
								onClick={(e) => {
									e.preventDefault();
									closeMenuAndNavigate(link.to);
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

				{/* Search Icon */}
				<div
					className='search-icon'
					onClick={handleSearchInteraction}
					role='button'
					aria-label='Toggle search'
				>
					<img
						src={searchIcon}
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
							className='search-bar-container open' // Ensure it has 'open' to be visible initially
							style={{ minHeight: "40px", zIndex: 5 }} // zIndex might need adjustment
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
