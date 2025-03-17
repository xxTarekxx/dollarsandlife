import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./NavBar.css";
import SearchImg from "/images/favicon/searchicon.svg";
import logo from "/images/website-logo.webp";

interface Post {
	id: string;
	title: string;
	route: string;
	jsonFile: string;
}

const menuItems = [
	{ to: "/", text: "Home" },
	{ to: "/extra-income", text: "Extra Income" },
	{ to: "/shopping-deals", text: "Shopping Deals" },
	{ to: "/start-a-blog", text: "Start A Blog" },
	{ to: "/breaking-news", text: "Breaking News" },
	{ to: "/financial-calculators", text: "Calculators" },
];

const Navbar: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [suggestions, setSuggestions] = useState<Post[]>([]);
	const [posts, setPosts] = useState<Post[]>([]);
	const location = useLocation();
	const navigate = useNavigate();

	// Scroll to top on route change
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location.pathname]);

	// Fetch posts from different JSON files
	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const files = [
					{ file: "budgetdata.json", route: "/Extra-Income" },
					{ file: "freelancejobs.json", route: "/Extra-Income/Freelancers" },
					{
						file: "moneymakingapps.json",
						route: "/Extra-Income/Money-Making-Apps",
					},
					{ file: "products.json", route: "/Shopping-Deals" },
					{ file: "remotejobs.json", route: "/Extra-Income/Remote-Jobs" },
					{ file: "startablogdata.json", route: "/Start-A-Blog" },
					{ file: "breakingnews.json", route: "/breaking-news" },
				];

				const allPosts: Post[] = [];

				for (const fileInfo of files) {
					const response = await fetch(
						`/data/${fileInfo.file}?v=${Date.now()}`,
					); // Cache-busting
					if (!response.ok) {
						console.warn(
							`Failed to fetch ${fileInfo.file}: ${response.statusText}`,
						);
						continue;
					}
					const data: Post[] = await response.json();
					const postsWithRoute = data.map((post) => ({
						...post,
						route: fileInfo.route,
						jsonFile: fileInfo.file,
					}));
					allPosts.push(...postsWithRoute);
				}

				console.log("Fetched posts:", allPosts); // Debugging
				setPosts(allPosts);
			} catch (error) {
				console.error("Error fetching posts:", error);
			}
		};

		fetchPosts();
	}, []);

	// Filter search suggestions
	useEffect(() => {
		if (searchTerm.trim()) {
			const lowerCaseTerm = searchTerm.toLowerCase();
			const filteredSuggestions = posts.filter(
				(post) =>
					post.title.toLowerCase().includes(lowerCaseTerm) ||
					post.id.toLowerCase().includes(lowerCaseTerm),
			);
			console.log("Filtered suggestions:", filteredSuggestions); // Debugging
			setSuggestions(filteredSuggestions);
		} else {
			setSuggestions([]);
		}
	}, [searchTerm, posts]);

	// Handle menu navigation
	const handleMenuItemClick = (
		event: React.MouseEvent<HTMLAnchorElement>,
		to: string,
	) => {
		event.stopPropagation();
		setIsOpen(false);
		if (location.pathname !== to) {
			navigate(to);
		}
	};

	// Handle search input change
	const handleSearchInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setSearchTerm(event.target.value);
	};

	// Handle search suggestion click
	const handleSuggestionClick = (suggestion: Post) => {
		const fullRoute = `${suggestion.route}/${suggestion.id}`;
		console.log("Navigating to:", fullRoute); // Debugging
		navigate(fullRoute);
		setSearchTerm("");
		setIsSearchOpen(false);
	};

	return (
		<>
			<Helmet>
				<script type='application/ld+json'>
					{JSON.stringify({
						"@context": "https://schema.org",
						"@type": "WebSite",
						name: "Dollars And Life",
						url: "https://www.dollarsandlife.com",
						potentialAction: {
							"@type": "SearchAction",
							target: "https://www.dollarsandlife.com/search?q={search_term}",
							"query-input": "required name=search_term",
						},
					})}
				</script>
			</Helmet>

			<nav className='nav'>
				<img
					className='logo'
					src={logo}
					alt='Dollars and Life Logo'
					onClick={() => navigate("/")}
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
									location.pathname === item.to ? { color: "#008507" } : {}
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
						<img
							className='search-icon-image'
							src={SearchImg}
							alt='Search Icon'
						/>
					</div>
				</div>
			</nav>

			{/* Search Bar */}
			<div
				className={`search-bar-container ${isSearchOpen ? "open" : "closed"}`}
			>
				<input
					className='search-bar'
					type='text'
					placeholder='Search...'
					value={searchTerm}
					onChange={handleSearchInputChange}
					aria-label='Search for articles'
				/>
				{suggestions.length > 0 && (
					<ul className='suggestions-list'>
						{suggestions.map((suggestion, index) => (
							<li key={index} onClick={() => handleSuggestionClick(suggestion)}>
								{suggestion.title}
							</li>
						))}
					</ul>
				)}
			</div>
		</>
	);
};

export default React.memo(Navbar);
