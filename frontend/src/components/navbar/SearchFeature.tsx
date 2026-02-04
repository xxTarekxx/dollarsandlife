import { useRouter } from "next/router";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";

interface SearchResult {
	id: string;
	headline: string;
	url: string;
	category: string;
	snippet: string;
}

interface SearchFeatureProps {
	isOpen: boolean;
	onClose: () => void;
}

const SearchFeature: React.FC<SearchFeatureProps> = ({ isOpen, onClose }) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
	const [isLoadingSearch, setIsLoadingSearch] = useState(false);

	const searchRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);
	const router = useRouter();
	const abortControllerRef = useRef<AbortController | null>(null);
	const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

	// Get search API base URL
	const getSearchApiBase = () => {
		return process.env.NEXT_PUBLIC_SEARCH_API_BASE || "https://api.dollarsandlife.com";
	};

	// Perform search API call
	const performSearch = useCallback(async (query: string) => {
		// Cancel previous request if exists
		if (abortControllerRef.current) {
			abortControllerRef.current.abort();
		}

		// Create new AbortController for this request
		const abortController = new AbortController();
		abortControllerRef.current = abortController;

		setIsLoadingSearch(true);

		try {
			const apiBase = getSearchApiBase();
			const encodedQuery = encodeURIComponent(query);
			const url = `${apiBase}/search?q=${encodedQuery}&limit=10`;

			const response = await fetch(url, {
				signal: abortController.signal,
			});

			// Check if request was aborted
			if (abortController.signal.aborted) {
				return;
			}

			if (!response.ok) {
				throw new Error(`Search API returned ${response.status}`);
			}

			const results = (await response.json()) as SearchResult[];
			setSearchResults(results);
		} catch (error) {
			// Ignore abort errors
			if (error instanceof Error && error.name === "AbortError") {
				return;
			}

			// Handle other errors
			console.error("Search API error:", error);
			setSearchResults([]);
		} finally {
			// Only update loading state if this request wasn't aborted
			if (!abortController.signal.aborted) {
				setIsLoadingSearch(false);
			}
		}
	}, []);

	// Debounced search effect
	useEffect(() => {
		// Clear previous debounce timer
		if (debounceTimerRef.current) {
			clearTimeout(debounceTimerRef.current);
		}

		const trimmedQuery = searchQuery.trim();

		// If query is less than 2 characters, clear results
		if (trimmedQuery.length < 2) {
			setSearchResults([]);
			setIsLoadingSearch(false);
			// Cancel any pending request
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
				abortControllerRef.current = null;
			}
			return;
		}

		// Debounce API call by 300ms
		debounceTimerRef.current = setTimeout(() => {
			performSearch(trimmedQuery);
		}, 300);

		// Cleanup function
		return () => {
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, [searchQuery, performSearch]);

	// Focus input when search opens
	useEffect(() => {
		if (isOpen && inputRef.current) {
			const timer = setTimeout(() => inputRef.current?.focus(), 50);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	// Click outside handler
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

	// Cleanup on unmount
	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
			if (debounceTimerRef.current) {
				clearTimeout(debounceTimerRef.current);
			}
		};
	}, []);

	const handleResultClick = useCallback(
		(result: SearchResult) => {
			onClose();
			setSearchQuery("");
			setSearchResults([]);

			// Use URL directly from API response
			if (result.url) {
				router.push(result.url);
			} else {
				console.warn(`No URL found for result:`, result);
			}
		},
		[router, onClose],
	);

	return (
		<div
			ref={searchRef}
			className={`search-bar-container ${isOpen ? "open" : "closed"}`}
		>
			<input
				ref={inputRef}
				type='text'
				placeholder={isLoadingSearch ? "Searching..." : "Search posts..."}
				value={searchQuery}
				onChange={(e) => setSearchQuery(e.target.value)}
				className='search-bar'
				aria-label='Search posts'
				disabled={isLoadingSearch}
			/>
			{isLoadingSearch && (
				<div className='search-loading'>Searching...</div>
			)}
			{!isLoadingSearch && searchResults.length > 0 && (
				<ul className='suggestions-list'>
					{searchResults.map((result) => (
						<li
							key={`${result.category}-${result.id}`}
							onClick={() => handleResultClick(result)}
						>
							<div className='search-result-headline'>{result.headline}</div>
							{result.snippet && (
								<div className='search-result-snippet'>{result.snippet}</div>
							)}
						</li>
					))}
				</ul>
			)}
			{!isLoadingSearch &&
				searchQuery.trim().length >= 2 &&
				searchResults.length === 0 && (
					<div className='search-no-results'>No results found.</div>
				)}
		</div>
	);
};

export default memo(SearchFeature);
