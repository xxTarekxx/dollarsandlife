"use client"; // Stays client component due to heavy client-side logic, auth state, modals, etc.
import { Auth, onAuthStateChanged, signOut, User } from "firebase/auth"; // Add onAuthStateChanged and User
import {
	collection,
	Firestore,
	getDocs,
	orderBy,
	query,
	where,
} from "firebase/firestore";
import { GetStaticProps } from "next"; // Added
import Head from "next/head";
import Link from "next/link"; // Added for "Ask a Question" button
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
// Remove useAuthState import
import AuthPromptModal from "../../src/auth/AuthPromptModal";
import PostCard, { PostData } from "../../src/components/forum/PostCard";
import { initializeFirebaseAndGetServices } from "../../src/firebase";
import tagColors from "../../src/utils/tagColors";

// DefaultProfileIcon and modalRootElement remain the same

const DefaultProfileIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 24 24'
		fill='currentColor'
		className='default-profile-icon'
	>
		<path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
	</svg>
);

const AuthenticatedForumHomePageContent: React.FC<{
	firebaseAuth: Auth;
	firebaseDb: Firestore | null;
	initialPosts?: PostData[]; // Added
	staticGenError?: string; // Added
}> = ({ firebaseAuth, firebaseDb, initialPosts, staticGenError }) => {
	// Replace useAuthState with manual state management
	const [user, setUser] = useState<User | null>(null);
	const [authLoadingHook, setAuthLoadingHook] = useState(true);
	const [authErrorHook, setAuthErrorHook] = useState<Error | null>(null);

	// Manual auth state listener
	useEffect(() => {
		if (!firebaseAuth) return;

		const unsubscribe = onAuthStateChanged(
			firebaseAuth,
			(user) => {
				setUser(user);
				setAuthLoadingHook(false);
				setAuthErrorHook(null);
			},
			(error) => {
				setAuthErrorHook(error);
				setAuthLoadingHook(false);
			}
		);

		return () => unsubscribe();
	}, [firebaseAuth]);

	const [posts, setPosts] = useState<PostData[]>(initialPosts || []); // Initialize with static props
	const [loadingPosts, setLoadingPosts] = useState<boolean>(!initialPosts); // Don't load if initialPosts exist
	const [sortBy, setSortBy] = useState<"timestamp" | "helpfulVoteCount">(
		"timestamp",
	);
	const [activeTag, setActiveTag] = useState<string | null>(null);
	const [isAuthModalInDom, setIsAuthModalInDom] = useState(false);
	// --- New state for sidebar expansion ---
	const [sidebarExpanded, setSidebarExpanded] = useState(false);

	// Move modalRootElement creation inside component and add browser check
	const closeAuthModal = useCallback(() => {
		setIsAuthModalInDom(false);
	}, []);

	const openAuthModal = () => {
		setIsAuthModalInDom(true);
	};

	// openCreatePostModal and closeCreatePostModal removed

	const handleLogout = async () => {
		try {
			await signOut(firebaseAuth);
		} catch (error) {
			console.error("ForumHomePage: Error signing out: ", error);
		}
	};

	useEffect(() => {
		const fetchPostsClientSide = async () => {
			if (!firebaseDb) {
				setLoadingPosts(false);
				if (!initialPosts || initialPosts.length === 0) setPosts([]); // Clear only if no initial posts
				return;
			}
			setLoadingPosts(true); // Indicate loading for client-side specific fetches (sort/filter)
			const postsRef = collection(firebaseDb, "forumPosts");
			let q;
			const effectiveSortBy = sortBy;
			if (activeTag) {
				q = query(
					postsRef,
					where("tags", "array-contains", activeTag.toLowerCase()),
					orderBy(effectiveSortBy, "desc"),
				);
			} else {
				q = query(postsRef, orderBy(effectiveSortBy, "desc"));
			}
			try {
				const snapshot = await getDocs(q);
				const fetchedPosts = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as PostData[];
				setPosts(fetchedPosts);
			} catch (error) {
				console.error(
					"ForumHomePage: Error fetching posts client-side: ",
					error,
				);
				if (!initialPosts || initialPosts.length === 0) setPosts([]);
			} finally {
				setLoadingPosts(false);
			}
		};

		// If initialPosts are provided from getStaticProps, use them.
		if (
			initialPosts &&
			initialPosts.length > 0 &&
			!activeTag &&
			sortBy === "timestamp"
		) {
			setPosts(initialPosts);
			setLoadingPosts(false);
		} else {
			fetchPostsClientSide();
		}
		if (staticGenError) {
			console.error("Error from getStaticProps:", staticGenError);
			// Optionally show a toast or message to the user
		}
	}, [sortBy, activeTag, firebaseDb, initialPosts, staticGenError]);

	useEffect(() => {
		if (activeTag) {
			setSidebarExpanded(true);
		}
	}, [activeTag]);

	if (authErrorHook) {
		return (
			<div className='page-error-indicator'>
				Authentication Error: {authErrorHook.message}. Please try refreshing.
			</div>
		);
	}

	const isAnyModalEffectivelyOpen = isAuthModalInDom; // Only auth modal can blur now

	// Always use clean canonical URL without query params
	const canonicalUrl = "https://www.dollarsandlife.com/forum";

	return (
		<>
			<Head>
				<title>Community Forum | Dollars & Life</title>
				<meta
					name="description"
					content="Join our community forum to ask questions and share insights about budgeting, saving, investing, and more."
				/>
				<link rel="canonical" href={canonicalUrl} />
			</Head>
			<div
				className={`forum-homepage-container ${
					isAnyModalEffectivelyOpen ? "blurred" : ""
				}`}
			>
				<header className='forum-header'>
					<h1>Welcome To Our Community!</h1>
					<div className='forum-header-interactive-area'>
						<Link
							href='/forum/create-post'
							className={`create-post-button-main header-ask-question ${
								!firebaseDb || authLoadingHook || !user ? "disabled-link" : ""
							}`}
							aria-disabled={!firebaseDb || authLoadingHook || !user}
							onClick={(e) => {
								if (!user) {
									e.preventDefault(); // Prevent navigation
									openAuthModal();
								} else if (!firebaseDb || authLoadingHook) {
									e.preventDefault();
								}
							}}
						>
							Ask a Question
						</Link>
						<div className='user-section'>
							{authLoadingHook ? ( // Check authLoadingHook from useAuthState
								<span className='auth-loading-text'>Loading user...</span>
							) : user ? (
								<div className='user-actions-area'>
									<div className='user-profile-info'>
										{user.photoURL ? (
											<img
												src={user.photoURL}
												alt={`${user.displayName || "User"}'s profile`}
												className='profile-icon'
											/>
										) : (
											<span
												className='profile-icon default-icon'
												aria-label='Default user profile icon'
											>
												<DefaultProfileIcon />
											</span>
										)}
										<span
											className='display-name'
											title={user.displayName || "User"}
										>
											{user.displayName || "User"}
										</span>
									</div>
									<button
										type='button'
										onClick={handleLogout}
										className='logout-button header-logout-button'
									>
										Logout
									</button>
								</div>
							) : (
								<button
									type='button'
									onClick={openAuthModal}
									className='login-signup-button header-login-button' // Ensure this class is styled
									disabled={authLoadingHook} // Disable while auth is loading
								>
									Login / Sign Up
								</button>
							)}
						</div>
					</div>
				</header>
				<div className='forum-content'>
					{/* --- Sidebar --- */}
					<aside className={`forum-sidebar${sidebarExpanded ? " expanded" : " collapsed"}`} style={{ marginBottom: "0.5rem" }}>
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
							<h3 style={{ marginBottom: 0 }}>Popular Tags</h3>
							<button
								style={{ fontSize: "1.2em", background: "none", border: "none", cursor: "pointer", padding: 0, marginLeft: "0.5em" }}
								aria-label={sidebarExpanded ? "Collapse tags" : "Expand tags"}
								onClick={() => setSidebarExpanded((prev) => !prev)}
							>
								{sidebarExpanded ? "−" : "+"}
							</button>
						</div>
						<ul className='tag-filter-list'>
							{[
								"Budgeting",
								"Saving",
								"Investing",
								"Credit",
								"Side Hustles",
								"Debt",
								"Freelancing",
								"Real Estate",
								"Taxes",
								"Retirement",
							].map((tag) => {
								const tagKey = tag.toLowerCase();
								const T_color = tagColors[tagKey] || {
									bg: "var(--muted-bg-color)",
									text: "var(--secondary-text-color)",
								};
								return (
									<li
										key={tag}
										style={{
											backgroundColor: T_color.bg,
											color: T_color.text,
											// Border color can be dynamic or based on active state in CSS
											borderColor:
												T_color.bg !== "var(--muted-bg-color)"
													? T_color.bg
													: "var(--border-color)",
										}}
										className={`tag-pill ${
											// Original class name
											activeTag === tagKey ? "active-tag" : ""
										}`}
										onClick={() =>
											setActiveTag((prevTag) =>
												prevTag === tagKey ? null : tagKey,
											)
										}
										role='button' // Make it behave like a button
										tabIndex={0} // Make it focusable
										onKeyPress={(e) => {
											if (e.key === "Enter" || e.key === " ")
												setActiveTag(tagKey === activeTag ? null : tagKey);
										}}
										aria-pressed={activeTag === tagKey}
										aria-label={`Filter by tag: ${tag}`}
									>
										{tag}
									</li>
								);
							})}
							{activeTag && (
								<li
									className='clear-tag' // Original class name
									onClick={() => setActiveTag(null)}
									role='button'
									tabIndex={0}
									onKeyPress={(e) => {
										if (e.key === "Enter" || e.key === " ") setActiveTag(null);
									}}
									aria-label='Clear active tag filter'
								>
									Clear Filter <span className='clear-tag-icon'>✕</span>
								</li>
							)}
						</ul>
						{/* --- Show filtered posts below tags when expanded and a tag is active --- */}
						{sidebarExpanded && activeTag && (
							<div style={{ marginTop: "1rem" }}>
								<h4 style={{ margin: "0 0 0.5rem 0" }}>Questions tagged "{activeTag.charAt(0).toUpperCase() + activeTag.slice(1)}"</h4>
								{loadingPosts ? (
									<p className='no-posts-message'>Loading posts...</p>
								) : posts.length === 0 ? (
									<p className='no-posts-message'>No posts found for this tag.</p>
								) : (
									<div className='post-list'>
										{posts.map((post) => (
											<PostCard
												key={post.id}
												post={post}
												auth={firebaseAuth} // firebaseAuth is guaranteed
												db={firebaseDb} // db can be null, PostCard should handle
											/>
										))}
									</div>
								)}
							</div>
						)}
					</aside>
					{/* --- Main Content --- */}
					<div className='forum-content-main' style={{ flex: 1 }}>
						<div className='sort-controls'>
							<label htmlFor='sort-select'>Sort by:</label>
							<select
								id='sort-select'
								value={sortBy}
								onChange={(e) =>
									setSortBy(e.target.value as "timestamp" | "helpfulVoteCount")
								}
								aria-label='Sort forum posts'
							>
								<option value='timestamp'>Newest</option>
								<option value='helpfulVoteCount'>Most Helpful</option>
							</select>
						</div>
						<main className='post-feed-area'>
							<h2>Recent Questions</h2>
							{loadingPosts && (
								<p className='no-posts-message'>Loading posts...</p>
							)}
							{!loadingPosts && posts.length === 0 && firebaseDb && (
								<p className='no-posts-message'>
									No posts yet. Be the first to ask a question!
								</p>
							)}
							{!loadingPosts && posts.length === 0 && !firebaseDb && (
								<p className='no-posts-message'>
									Could not load posts. The forum database might be temporarily
									unavailable.
								</p>
							)}
							{!loadingPosts && posts.length > 0 && (
								<div className='post-list'>
									{posts.map((post) => (
										<PostCard
											key={post.id}
											post={post}
											auth={firebaseAuth} // firebaseAuth is guaranteed
											db={firebaseDb} // db can be null, PostCard should handle
										/>
									))}
								</div>
							)}
						</main>
					</div>
				</div>
			</div>

			{/* createPostModalComponent and its portal removed */}

			{isAuthModalInDom && (
				<AuthPromptModal onClose={closeAuthModal} auth={firebaseAuth} />
			)}
		</>
	);
};

export const getStaticProps: GetStaticProps = async () => {
	// Remove the API call that's causing 404 errors
	// The forum posts will be loaded client-side from Firestore
	return {
		props: {
			initialPosts: [],
		},
		revalidate: 60,
	};
};

interface ForumHomePageProps {
	initialPosts?: PostData[];
	error?: string;
}

const ForumHomePage: React.FC<ForumHomePageProps> = ({
	initialPosts,
	error: staticGenError,
}) => {
	const router = useRouter();
	const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);
	const [firebaseDb, setFirebaseDb] = useState<Firestore | null>(null);
	const [firebaseInitialized, setFirebaseInitialized] = useState(false);
	const [firebaseError, setFirebaseError] = useState<Error | null>(null);
	
	// Redirect to /auth/action if Firebase auth callback params are present
	useEffect(() => {
		if (router.isReady) {
			const { mode, oobCode, apiKey } = router.query;
			if (mode && oobCode) {
				// Firebase auth callback - redirect to proper handler
				const params = new URLSearchParams();
				if (mode) params.set("mode", mode as string);
				if (oobCode) params.set("oobCode", oobCode as string);
				if (apiKey) params.set("apiKey", apiKey as string);
				if (router.query.continueUrl) params.set("continueUrl", router.query.continueUrl as string);
				if (router.query.lang) params.set("lang", router.query.lang as string);
				router.replace(`/auth/action?${params.toString()}`);
			}
		}
	}, [router.isReady, router.query]);

	useEffect(() => {
		// This console log is helpful for debugging mount timing
		initializeFirebaseAndGetServices()
			.then(({ auth: initializedAuth, db: initializedDb }) => {
				setFirebaseAuth(initializedAuth);
				setFirebaseDb(initializedDb); // This can be null if Firestore is not enabled/configured
				setFirebaseInitialized(true);
			})
			.catch((error) => {
				console.error(
					"ForumHomePage Wrapper: Firebase initialization failed:",
					error,
				);
				setFirebaseError(error);
				setFirebaseInitialized(true); // Still mark as initialized to show the error state
			});
	}, []);

	if (!firebaseInitialized) {
		return (
			<div className='page-loading-indicator'>
				Initializing forum services...
			</div>
		);
	}

	if (firebaseError) {
		return (
			<div className='page-error-indicator'>
				<strong>Error initializing Firebase:</strong> {firebaseError.message}.
				<br />
				Please try refreshing the page.
			</div>
		);
	}

	if (!firebaseAuth) {
		// This is a critical failure if initialization finished without error but auth is still null
		return (
			<div className='page-error-indicator'>
				<strong>Critical Error:</strong> Authentication service could not be
				loaded.
				<br />
				The forum cannot operate correctly. Please try refreshing.
			</div>
		);
	}

	return (
		<AuthenticatedForumHomePageContent
			firebaseAuth={firebaseAuth}
			firebaseDb={firebaseDb}
			initialPosts={initialPosts}
			staticGenError={staticGenError}
		/>
	);
};

export default ForumHomePage;
