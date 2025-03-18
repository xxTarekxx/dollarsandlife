import React, { useState, useEffect, useRef, memo } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NavBar.css";

interface Post {
	id: string;
	headline: string;
	jsonFile: string;
	route: string;
}

const NavBar: React.FC = () => {
	const [menuOpen, setMenuOpen] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Post[]>([]);
	const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);

	const searchRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();

	// Toggle mobile menu
	const toggleMenu = () => {
		setMenuOpen(!menuOpen);
	};

	// Fetch posts from multiple JSON files
	useEffect(() => {
		const fetchPosts = async () => {
			try {
				const files = [
					{ file: "budgetdata.json", route: "/extra-income" },
					{ file: "freelancejobs.json", route: "/extra-income/freelancers" },
					{
						file: "moneymakingapps.json",
						route: "/extra-income/money-making-apps",
					},
					{ file: "products.json", route: "/shopping-deals" },
					{ file: "remotejobs.json", route: "/extra-income/remote-jobs" },
					{ file: "startablogdata.json", route: "/start-a-blog" },
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

				console.log("Fetched posts:", allPosts);
				setSearchResults(allPosts);
			} catch (error) {
				console.error("Error fetching posts:", error);
			}
		};

		fetchPosts();
	}, []);

	// Filter search results
	useEffect(() => {
		if (searchQuery.trim() !== "" && searchResults.length > 0) {
			const filtered = searchResults.filter(
				(post) =>
					post &&
					post.headline &&
					post.headline.toLowerCase().includes(searchQuery.toLowerCase()),
			);
			setFilteredPosts(filtered);
		} else {
			setFilteredPosts([]);
		}
	}, [searchQuery, searchResults]);

	// Close search bar on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target as Node)
			) {
				setSearchOpen(false);
				setSearchQuery("");
				setFilteredPosts([]);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	// Navigate to selected post
	const handlePostClick = (post: Post) => {
		setSearchOpen(false);
		setSearchQuery("");
		setFilteredPosts([]);

		if (post.jsonFile === "budgetdata.json") {
			navigate(`/extra-income/${post.id}`);
		} else if (post.jsonFile === "freelancejobs.json") {
			navigate(`/extra-income/freelancers/${post.id}`);
		} else if (post.jsonFile === "moneymakingapps.json") {
			navigate(`/extra-income/money-making-apps/${post.id}`);
		} else if (post.jsonFile === "remotejobs.json") {
			navigate(`/extra-income/remote-jobs/${post.id}`);
		} else if (post.jsonFile === "startablogdata.json") {
			navigate(`/start-a-blog/${post.id}`);
		} else if (post.jsonFile === "breakingnews.json") {
			navigate(`/breaking-news/${post.id}`);
		} else if (post.jsonFile === "products.json") {
			navigate(`/shopping-deals/${post.id}`);
		}
	};

	return (
		<nav className='nav'>
			<div className='logo'>
				<Link to='/'>
					<img src='/images/website-logo.webp' alt='Logo' className='logo' />
				</Link>
			</div>

			<div className='nav-center'>
				<div className={`menu ${menuOpen ? "open" : "closed"}`}>
					{/* Menu Links */}
					<Link
						to='/extra-income'
						className='menu-item'
						onClick={() => setMenuOpen(false)}
					>
						Extra Income
					</Link>
					<Link
						to='/shopping-deals'
						className='menu-item'
						onClick={() => setMenuOpen(false)}
					>
						Shopping Deals
					</Link>
					<Link
						to='/start-a-blog'
						className='menu-item'
						onClick={() => setMenuOpen(false)}
					>
						Start A Blog
					</Link>
					<Link
						to='/breaking-news'
						className='menu-item'
						onClick={() => setMenuOpen(false)}
					>
						Breaking News
					</Link>
					<Link
						to='/financial-calculators'
						className='menu-item'
						onClick={() => setMenuOpen(false)}
					>
						Financial Calculators
					</Link>
				</div>

				<div className='search-icon' onClick={() => setSearchOpen(!searchOpen)}>
					<img
						src='/images/favicon/searchicon.svg'
						alt='Search'
						className='search-icon-image'
					/>
				</div>
			</div>

			<div
				ref={searchRef}
				className={`search-bar-container ${searchOpen ? "open" : "closed"}`}
			>
				{/* Search Input */}
				<input
					type='text'
					placeholder='Search posts...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className='search-bar'
				/>
				{filteredPosts.length > 0 && (
					<ul className='suggestions-list'>
						{filteredPosts.map((post) => (
							<li key={post.id} onClick={() => handlePostClick(post)}>
								{post.headline}
							</li>
						))}
					</ul>
				)}
			</div>

			<div className='hamburger' onClick={toggleMenu}>
				<div></div>
				<div></div>
				<div></div>
			</div>
		</nav>
	);
};

export default memo(NavBar);
