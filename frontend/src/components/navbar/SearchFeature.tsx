import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./NavBar.css";

interface Post {
	id: string;
	headline: string;
	// 'identifier' is used to know the source/type of the post (e.g., "budget-data", "shopping-deals")
	identifier: string;
	// 'baseClientRoute' is the root path for this type of content (e.g., "/extra-income/budget")
	baseClientRoute: string;
	// Optional: For products, the API might provide a direct slug or full canonical URL
	slug?: string;
	canonicalUrl?: string;
}

interface SearchFeatureProps {
	isOpen: boolean;
	onClose: () => void;
}

const SearchFeature: React.FC<SearchFeatureProps> = ({ isOpen, onClose }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<Post[]>([]);
	const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
	const [searchDataLoaded, setSearchDataLoaded] = useState(false);
	const [isLoadingSearch, setIsLoadingSearch] = useState(false);

	const searchRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const navigate = useNavigate();

	const loadSearchData = useCallback(async () => {
		if (searchDataLoaded || isLoadingSearch) return;
		setIsLoadingSearch(true);

		const API_BASE = import.meta.env.VITE_REACT_APP_API_BASE || "/api";

		const endpointsToFetch = [
			{
				apiPath: "budget-data",
				baseClientRoute: "/extra-income/budget",
				identifier: "budget-data",
			},
			{
				apiPath: "freelance-jobs",
				baseClientRoute: "/extra-income/freelancers",
				identifier: "freelance-jobs",
			},
			{
				apiPath: "money-making-apps",
				baseClientRoute: "/extra-income/money-making-apps",
				identifier: "money-making-apps",
			},
			{
				apiPath: "shopping-deals",
				baseClientRoute: "/shopping-deals",
				identifier: "shopping-deals",
			},
			{
				apiPath: "remote-jobs",
				baseClientRoute: "/extra-income/remote-jobs",
				identifier: "remote-jobs",
			},
			{
				apiPath: "start-blog",
				baseClientRoute: "/start-a-blog",
				identifier: "start-blog",
			},
			{
				apiPath: "breaking-news",
				baseClientRoute: "/breaking-news",
				identifier: "breaking-news",
			},
		];

		const allPostsPromises = endpointsToFetch.map(
			async ({ apiPath, baseClientRoute, identifier }) => {
				try {
					const res = await fetch(`${API_BASE}/${apiPath}`);
					if (!res.ok) {
						console.warn(`Failed to fetch ${apiPath}: ${res.statusText}`);
						return [];
					}
					const items: any[] = await res.json();
					return items.map((item) => ({
						id: item.id,
						headline: item.headline,
						identifier: identifier,
						baseClientRoute: baseClientRoute,
						slug: item.slug, // Expecting API to provide slug for products
						canonicalUrl: item.canonicalUrl, // Or a full canonical URL
					}));
				} catch (err) {
					console.warn(`Error processing or fetching ${apiPath}`, err);
					return [];
				}
			},
		);

		const results = await Promise.all(allPostsPromises);
		setSearchResults(results.flat());
		setSearchDataLoaded(true);
		setIsLoadingSearch(false);
	}, [searchDataLoaded, isLoadingSearch]);

	useEffect(() => {
		if (isOpen && !searchDataLoaded) {
			loadSearchData();
		}
		if (isOpen && inputRef.current) {
			const timer = setTimeout(() => inputRef.current?.focus(), 50);
			return () => clearTimeout(timer);
		}
	}, [isOpen, searchDataLoaded, loadSearchData]);

	useEffect(() => {
		if (searchQuery.trim() === "") {
			setFilteredPosts([]);
			return;
		}
		if (searchDataLoaded) {
			const lowerCaseQuery = searchQuery.toLowerCase();
			const filtered = searchResults.filter((post) =>
				post.headline.toLowerCase().includes(lowerCaseQuery),
			);
			setFilteredPosts(filtered);
		}
	}, [searchQuery, searchResults, searchDataLoaded]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				searchRef.current &&
				!searchRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};
		if (isOpen) document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [isOpen, onClose]);

	const handlePostClick = useCallback(
		(post: Post) => {
			onClose();
			setSearchQuery("");
			setFilteredPosts([]);

			let targetRoute = "";

			if (post.identifier === "shopping-deals") {
				if (post.canonicalUrl) {
					// Prefer canonicalUrl if provided by API
					targetRoute = post.canonicalUrl;
				} else if (post.slug) {
					// Then try slug if provided
					targetRoute = `/shopping-deals/products/${post.slug}`;
				} else {
					// Fallback: attempt to create a basic slug if API doesn't provide one
					// This requires post.id to be the numeric part for products.
					const generatedSlug = `${post.id}-${post.headline
						.toLowerCase()
						.replace(/\s+/g, "-")
						.replace(/[^a-z0-9-]/g, "")}`;
					targetRoute = `/shopping-deals/products/${generatedSlug}`;
					console.warn(
						"Shopping deal slug generated on client, API should ideally provide it.",
						post,
					);
				}
			} else {
				targetRoute = `${post.baseClientRoute}/${post.id}`;
			}

			if (targetRoute) {
				navigate(targetRoute);
			} else {
				console.warn(`Could not determine route for post:`, post);
			}
		},
		[navigate, onClose],
	);

	return (
		<div
			ref={searchRef}
			className={`search-bar-container ${isOpen ? "open" : "closed"}`}
		>
			<input
				ref={inputRef}
				type='text'
				placeholder={isLoadingSearch ? "Loading data..." : "Search posts..."}
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className='search-bar'
				aria-label='Search posts'
				disabled={isLoadingSearch || !searchDataLoaded}
			/>
			{!isLoadingSearch && searchDataLoaded && filteredPosts.length > 0 && (
				<ul className='suggestions-list'>
					{filteredPosts.map((post) => (
						<li
							key={`${post.identifier}-${post.id}`} // Use identifier and id for a unique key
							onClick={() => handlePostClick(post)}
						>
							{post.headline}
						</li>
					))}
				</ul>
			)}
			{isLoadingSearch && (
				<div className='search-loading'>Loading search data...</div>
			)}
			{!isLoadingSearch &&
				searchDataLoaded &&
				searchQuery.trim() !== "" &&
				filteredPosts.length === 0 && (
					<div className='search-no-results'>No matches found.</div>
				)}
		</div>
	);
};

export default memo(SearchFeature);
