import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "/images/website-logo.webp";
import SearchImg from "/images/favcons/searchicon.svg";
import "./NavBar.css";

const menuItems = [
	{ to: "/", text: "Home" },
	{ to: "/extra-income/", text: "Extra Income" },
	{ to: "/shopping-deals", text: "Shopping Deals" },
	{ to: "/start-a-blog", text: "Start A Blog" },
	// { to: "/my-story", text: "My Story" },
];

const Navbar: React.FC = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [suggestions, setSuggestions] = useState<
		{ id: string; jsonFile: string }[]
	>([]);
	const [posts, setPosts] = useState<any[]>([]);
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location.pathname]);

	// Fetch all JSON files dynamically from the /data directory
	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const files = [
					{ file: "budgetdata.json", route: "/extra-income/" },
					{ file: "freelancejobs.json", route: "/extra-income/freelancers/" },
					{
						file: "moneymakingapps.json",
						route: "/extra-income/money-making-apps/",
					},
					{ file: "products.json", route: "/shopping-deals/" },
					{ file: "remotejobs.json", route: "/extra-income/remote-jobs/" },
					{ file: "sidehustles.json", route: "/extra-income/side-hustles/" },
					{ file: "startablogdata.json", route: "/start-a-blog/" },
				];

				const allPosts: any[] = [];

				for (const fileInfo of files) {
					const response = await fetch(`/data/${fileInfo.file}`);
					if (!response.ok) {
						throw new Error(
							`Failed to fetch ${fileInfo.file}: ${response.statusText}`,
						);
					}
					const data = await response.json();
					const postsWithRoute = data.map((post: any) => ({
						...post,
						route: fileInfo.route, // Attach route to each post
						jsonFile: fileInfo.file, // Attach the corresponding JSON file
					}));
					allPosts.push(...postsWithRoute);
				}

				setPosts(allPosts);
				console.log("Fetched posts:", allPosts); // Debugging output
			} catch (error) {
				console.error("Error fetching posts:", error);
			}
		};

		fetchPosts();
	}, []);

	// Filter suggestions based on the search term
	useEffect(() => {
		if (searchTerm) {
			const lowerCaseTerm = searchTerm.toLowerCase();
			const filteredSuggestions = posts
				.filter((post) => post.id.toLowerCase().includes(lowerCaseTerm))
				.map((post) => ({
					id: post.id,
					jsonFile: post.jsonFile,
				}));

			setSuggestions(filteredSuggestions);
			console.log("Suggestions:", filteredSuggestions); // Debugging output
		} else {
			setSuggestions([]);
		}
	}, [searchTerm, posts]);

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

	const handleSearchInputChange = (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		setSearchTerm(event.target.value);
		console.log("Search term:", event.target.value); // Debugging output
	};

	const handleSuggestionClick = (suggestion: {
		id: string;
		jsonFile: string;
	}) => {
		// Navigate to the specific post using its ID
		const jsonFileRoute =
			posts.find((post) => post.id === suggestion.id)?.route || "/";
		navigate(`${jsonFileRoute}${suggestion.id}`);
		setSearchTerm("");
		setIsSearchOpen(false);
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
				<input
					className='search-bar'
					type='text'
					placeholder='Search...'
					value={searchTerm}
					onChange={handleSearchInputChange}
				/>
				{suggestions.length > 0 && (
					<ul className='suggestions-list'>
						{suggestions.map((suggestion, index) => (
							<li key={index} onClick={() => handleSuggestionClick(suggestion)}>
								{suggestion.id}
							</li>
						))}
					</ul>
				)}
			</div>
		</>
	);
};

export default React.memo(Navbar);
