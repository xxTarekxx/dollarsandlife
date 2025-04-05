import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
// Ensure NavBar.css (or a dedicated CSS file) is imported if styles are needed
import "./NavBar.css";

// Define the Post interface (can be shared in a types file if used elsewhere)
interface Post {
	id: string;
	headline: string;
	jsonFile: string;
	route: string;
}

// Props expected by this component
interface SearchFeatureProps {
	isOpen: boolean;
	onClose: () => void; // Callback to tell the parent NavBar to close the search
}

const SearchFeature: React.FC<SearchFeatureProps> = ({ isOpen, onClose }) => {
	// --- State specific to Search ---
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Post[]>([]); // All fetched posts
	const [filteredPosts, setFilteredPosts] = useState<Post[]>([]); // Posts matching query
	const [searchDataLoaded, setSearchDataLoaded] = useState(false); // Data fetch status
	const [isLoadingSearch, setIsLoadingSearch] = useState(false); // Fetch in progress

	// --- Refs and Hooks ---
	const searchRef = useRef<HTMLDivElement>(null); // Ref for the container div
	const inputRef = useRef<HTMLInputElement>(null); // Ref for the input field
	const navigate = useNavigate();

	// --- Data Fetching Logic ---
	const loadSearchData = useCallback(async () => {
		if (searchDataLoaded || isLoadingSearch) return; // Prevent redundant fetches

		setIsLoadingSearch(true);

		// List of JSON files to fetch for search data
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
		for (const { file, route } of files) {
			try {
				const res = await fetch(`/data/${file}?v=${Date.now()}`); // Cache bust
				if (!res.ok) {
					console.warn(`Failed to fetch ${file}: ${res.statusText}`);
					continue;
				}
				const data: Post[] = await res.json();
				// Add metadata to each post
				const postsWithRoute = data.map((post) => ({
					...post,
					route,
					jsonFile: file,
				}));
				allPosts.push(...postsWithRoute);
			} catch (err) {
				console.warn(`Error processing or fetching ${file}`, err);
			}
		}
		setSearchResults(allPosts);
		setSearchDataLoaded(true);
		setIsLoadingSearch(false);
	}, [searchDataLoaded, isLoadingSearch]); // Dependencies for useCallback

	// --- Effect to Load Data and Focus Input ---
	useEffect(() => {
		if (isOpen && !searchDataLoaded) {
			loadSearchData(); // Fetch data when search becomes open
		}
		// Focus the input field when the search bar opens
		if (isOpen && inputRef.current) {
			// Use a slight delay to ensure the element is rendered and visible
			const timer = setTimeout(() => inputRef.current?.focus(), 50); // 50ms delay
			return () => clearTimeout(timer); // Cleanup timeout on unmount or if isOpen changes
		}
	}, [isOpen, searchDataLoaded, loadSearchData]);

	// --- Effect for Filtering Search Results ---
	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredPosts([]);
			return;
		}
		if (searchDataLoaded) {
			// Only filter if data is available
			const lowerCaseQuery = searchQuery.toLowerCase();
			const filtered = searchResults.filter((post) =>
				post.headline.toLowerCase().includes(lowerCaseQuery),
			);
			setFilteredPosts(filtered);
		}
	}, [searchQuery, searchResults, searchDataLoaded]); // Depend on query, results, and loaded status

	// --- Effect for Handling Clicks Outside ---
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// If the click is outside the searchRef container, call onClose
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		// Add listener only when the search component is open
		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		// Cleanup listener when component unmounts or isOpen becomes false
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isOpen, onClose]); // Depend on isOpen and the onClose callback

	// --- Handler for Clicking a Suggestion ---
	const handlePostClick = useCallback(
		(post: Post) => {
			onClose(); // Close the search bar via the callback
			setSearchQuery(""); // Reset internal state
			setFilteredPosts([]);

			// Map JSON file names to specific routes
			const postRouteMap: Record<string, string> = {
				"budgetdata.json": `/extra-income/${post.id}`,
				"freelancejobs.json": `/extra-income/freelancers/${post.id}`,
				"moneymakingapps.json": `/extra-income/money-making-apps/${post.id}`,
				"remotejobs.json": `/extra-income/remote-jobs/${post.id}`,
				"startablogdata.json": `/start-a-blog/${post.id}`,
				"breakingnews.json": `/breaking-news/${post.id}`,
				"products.json": `/shopping-deals/${post.id}`,
			};

			const targetRoute = postRouteMap[post.jsonFile];
			if (targetRoute) {
				navigate(targetRoute); // Navigate to the specific post route
			} else {
				console.warn(`No route defined for jsonFile: ${post.jsonFile}`);
				// Optionally add fallback navigation here if needed
			}
		},
		[navigate, onClose], // Include navigate and onClose in dependencies
	);

	// --- Render the Search UI ---
	return (
		<div
			ref={searchRef} // Attach ref to the container
			className={`search-bar-container ${isOpen ? "open" : "closed"}`} // Control visibility via className
		>
			<input
				ref={inputRef} // Attach ref to the input for focusing
				type='text'
				placeholder={isLoadingSearch ? "Loading..." : "Search posts..."}
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className='search-bar'
				aria-label='Search posts'
				disabled={isLoadingSearch} // Disable input while fetching data
			/>
			{/* Show suggestions only if loaded, not loading, and results exist */}
			{searchDataLoaded && !isLoadingSearch && filteredPosts.length > 0 && (
				<ul className='suggestions-list'>
					{filteredPosts.map((post) => (
						<li
							key={`${post.jsonFile}-${post.id}`}
							onClick={() => handlePostClick(post)}
						>
							{post.headline}
						</li>
					))}
				</ul>
			)}
			{/* Optional loading indicator */}
			{isLoadingSearch && (
				<div className='search-loading'>Loading posts...</div>
			)}
			{/* Optional 'no results' message */}
			{searchDataLoaded &&
				!isLoadingSearch &&
				searchQuery.trim() !== "" &&
				filteredPosts.length === 0 && (
					<div className='search-no-results'>No matches found.</div>
				)}
		</div>
	);
};

// Use memo to prevent unnecessary re-renders if props haven't changed
export default memo(SearchFeature);
