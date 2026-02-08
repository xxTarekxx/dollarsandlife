"use client"; // Stays client component due to heavy client-side logic, auth state, modals, etc.
import { Auth, onAuthStateChanged, User } from "firebase/auth"; // Add onAuthStateChanged and User
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
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
// Remove useAuthState import
import PostCard, { PostData } from "../../src/components/forum/PostCard";
import ForumHeader from "../../src/components/forum/ForumHeader";
import AuthPromptModal from "../../src/auth/AuthPromptModal";
import { initializeFirebaseAndGetServices, verifyFirebaseInDev } from "../../src/firebase";
import tagColors from "../../src/utils/tagColors";

const PINNED_POST_TITLE = "Welcome To Our Community! Please Read The Rules Before Asking A Question.";

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

	// Dev-only: log Firebase status once on forum load
	useEffect(() => {
		verifyFirebaseInDev();
	}, []);

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
	const [sidebarExpanded, setSidebarExpanded] = useState(true);

	const handleAuthModalChange = useCallback((open: boolean) => {
		setIsAuthModalInDom(open);
	}, []);

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

	// Clear blur/modal state when user logs in (modal may unmount without calling onClose)
	useEffect(() => {
		if (user) {
			setIsAuthModalInDom(false);
		}
	}, [user]);

	const isAnyModalEffectivelyOpen = isAuthModalInDom;
	const showLoginGate = !user;

	// Pinned welcome post always first, then the rest in current sort order (must be before any conditional return)
	const displayPosts = React.useMemo(() => {
		const pinned = posts.find((p) => p.title === PINNED_POST_TITLE);
		const rest = posts.filter((p) => p.title !== PINNED_POST_TITLE);
		return pinned ? [pinned, ...rest] : posts;
	}, [posts]);

	const canonicalUrl = "https://www.dollarsandlife.com/forum";

	if (authErrorHook) {
		return (
			<div className='page-error-indicator'>
				Authentication Error: {authErrorHook.message}. Please try refreshing.
			</div>
		);
	}

	// Not logged in: show only "Log in or Sign up" CTA; no header, no questions
	if (showLoginGate) {
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
				<div className={`forum-homepage-container ${isAuthModalInDom ? "blurred" : ""}`}>
					<div className="forum-login-gate">
						<div className="forum-login-gate-card">
							{authLoadingHook ? (
								<p className="forum-login-gate-text">Loading…</p>
							) : (
								<>
									<h1 className="forum-login-gate-title">
										Ask questions. Share ideas. Get answers.
									</h1>
									<p className="forum-login-gate-text">
										Join the Dollars &amp; Life forum to discuss budgeting, saving, investing, and more with others who get it.
									</p>
									<button
										type="button"
										onClick={() => setIsAuthModalInDom(true)}
										className="forum-login-gate-button"
									>
										Log in or Sign up
									</button>
								</>
							)}
						</div>
					</div>
				</div>
				{isAuthModalInDom && (
					<AuthPromptModal
						onClose={() => setIsAuthModalInDom(false)}
						auth={firebaseAuth}
					/>
				)}
			</>
		);
	}

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
			<ForumHeader
				firebaseAuth={firebaseAuth}
				firebaseDb={firebaseDb}
				user={user}
				authLoading={authLoadingHook}
				onAuthModalChange={handleAuthModalChange}
			/>
			<div
				className={`forum-homepage-container ${
					isAnyModalEffectivelyOpen ? "blurred" : ""
				}`}
			>
				<div className='forum-content'>
					{/* --- Sidebar --- */}
					<aside className={`forum-sidebar${sidebarExpanded ? " expanded" : " collapsed"}`}>
						<div className="forum-sidebar-header">
							<h3>Popular Tags</h3>
							<button
								type="button"
								className="forum-sidebar-toggle"
								aria-label={sidebarExpanded ? "Collapse tags" : "Expand tags"}
								aria-expanded={sidebarExpanded}
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
							<div className="forum-sidebar-tagged-section">
								<h4 className="forum-sidebar-tagged-title">Questions tagged &ldquo;{activeTag.charAt(0).toUpperCase() + activeTag.slice(1)}&rdquo;</h4>
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
						<div className='forum-feed-header'>
							<h2>Recent Questions</h2>
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
						</div>
						<main className='post-feed-area' aria-label='Forum questions'>
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
									{displayPosts.map((post) => (
										<PostCard
											key={post.id}
											post={post}
											auth={firebaseAuth}
											db={firebaseDb}
										/>
									))}
								</div>
							)}
						</main>
					</div>
				</div>
			</div>

			{/* createPostModalComponent and its portal removed */}

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
	}, [router]);

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
