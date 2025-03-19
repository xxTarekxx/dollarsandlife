import React, { useState, useEffect, useRef, memo, useCallback } from "react";
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
	const [isClosing, setIsClosing] = useState(false);
	const [searchOpen, setSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Post[]>([]);
	const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
	const searchRef = useRef<HTMLDivElement>(null);
	const navigate = useNavigate();
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
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

		const fetchPosts = async () => {
			const allPosts: Post[] = [];
			for (const { file, route } of files) {
				try {
					const res = await fetch(`/data/${file}?v=${Date.now()}`);
					if (!res.ok) continue;
					const data: Post[] = await res.json();
					const postsWithRoute = data.map((post) => ({
						...post,
						route,
						jsonFile: file,
					}));
					allPosts.push(...postsWithRoute);
				} catch (err) {
					console.warn(`Error fetching ${file}`, err);
				}
			}
			setSearchResults(allPosts);
		};

		fetchPosts();
	}, []);

	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredPosts([]);
			return;
		}
		const filtered = searchResults.filter((post) =>
			post.headline.toLowerCase().includes(searchQuery.toLowerCase()),
		);
		setFilteredPosts(filtered);
	}, [searchQuery, searchResults]);

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
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handlePostClick = useCallback(
		(post: Post) => {
			setSearchOpen(false);
			setSearchQuery("");
			setFilteredPosts([]);

			const postRouteMap: Record<string, string> = {
				"budgetdata.json": `/extra-income/${post.id}`,
				"freelancejobs.json": `/extra-income/freelancers/${post.id}`,
				"moneymakingapps.json": `/extra-income/money-making-apps/${post.id}`,
				"remotejobs.json": `/extra-income/remote-jobs/${post.id}`,
				"startablogdata.json": `/start-a-blog/${post.id}`,
				"breakingnews.json": `/breaking-news/${post.id}`,
				"products.json": `/shopping-deals/${post.id}`,
			};

			if (postRouteMap[post.jsonFile]) {
				navigate(postRouteMap[post.jsonFile]);
			}
		},
		[navigate],
	);

	return (
		<nav className='nav'>
			{/* Logo */}
			<div className='logo'>
				<Link to='/' aria-label='Home'>
					<img src='/images/website-logo.webp' alt='Logo' className='logo' />
				</Link>
			</div>

			{/* Search + Hamburger Container */}
			<div className='right-controls'>
				{/* Menu Links */}
				<div
					ref={menuRef}
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
					].map((link, i) => (
						<Link
							key={i}
							to={link.to}
							className={`menu-item ${menuOpen ? "animate" : ""}`}
							onClick={(e) => {
								e.preventDefault();
								setIsClosing(true);
								setTimeout(() => {
									setMenuOpen(false);
									setIsClosing(false);
									navigate(link.to);
								}, 400); // Match animation timing
							}}
							style={{ animationDelay: `${i * 0.1}s` }}
						>
							{link.text}
						</Link>
					))}
				</div>

				<div
					className={`hamburger ${menuOpen ? "open" : ""}`}
					onClick={() => setMenuOpen((prev) => !prev)}
					aria-label='Toggle menu'
				>
					<div></div>
					<div></div>
					<div></div>
				</div>
				<div
					className='search-icon'
					onClick={() => setSearchOpen((prev) => !prev)}
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

			{/* Search Bar */}
			<div
				ref={searchRef}
				className={`search-bar-container ${searchOpen ? "open" : "closed"}`}
			>
				<input
					type='text'
					placeholder='Search posts...'
					value={searchQuery}
					onChange={(e) => setSearchQuery(e.target.value)}
					className='search-bar'
					aria-label='Search posts'
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
		</nav>
	);
};

export default memo(NavBar);
