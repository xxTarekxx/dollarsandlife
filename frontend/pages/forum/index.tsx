"use client"; // Stays client component due to heavy client-side logic, auth state, modals, etc.
import { Auth, signOut } from "firebase/auth"; // FirebaseUser not explicitly used by this component
import {
	Firestore,
	collection,
	getDocs,
	orderBy,
	query,
	where,
} from "firebase/firestore";
import { GetStaticProps } from "next"; // Added
import Link from "next/link"; // Added for "Ask a Question" button
import React, { useCallback, useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
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
	const [user, authLoadingHook, authErrorHook] = useAuthState(firebaseAuth);

	const [posts, setPosts] = useState<PostData[]>(initialPosts || []); // Initialize with static props
	const [loadingPosts, setLoadingPosts] = useState<boolean>(!initialPosts); // Don't load if initialPosts exist
	// const [showCreatePostModal, setShowCreatePostModal] = useState(false); // Removed
	// const [isCreatePostModalInDom, setIsCreatePostModalInDom] = useState(false); // Removed
	// const [formKey, setFormKey] = useState(0); // Removed, related to modal
	const [sortBy, setSortBy] = useState<"timestamp" | "helpfulVoteCount">(
		"timestamp",
	);
	const [activeTag, setActiveTag] = useState<string | null>(null);
	const [isAuthModalInDom, setIsAuthModalInDom] = useState(false);

	// Move modalRootElement creation inside component and add browser check
	const closeAuthModal = useCallback(() => {
		setIsAuthModalInDom(false);
	}, []);

	// This useEffect is primarily for logging; AuthPromptModal should handle its own closure on successful auth
	useEffect(() => {
		if (!authLoadingHook && user && isAuthModalInDom) {
			console.log(
				"ForumHomePage: User logged in, auth modal was open. AuthPromptModal's logic should close it.",
			);
		}
	}, [user, authLoadingHook, isAuthModalInDom]);

	const openAuthModal = () => {
		setIsAuthModalInDom(true);
	};

	// openCreatePostModal and closeCreatePostModal removed

	const handleLogout = async () => {
		try {
			await signOut(firebaseAuth);
			// No need to manually close AuthModal here if it's open,
			// as logout means the condition for it being open (no user) is met.
			// If it was open due to an action, user navigating away or logging out should implicitly close it.
			console.log("ForumHomePage: User logged out.");
		} catch (error) {
			console.error("ForumHomePage: Error signing out: ", error);
		}
	};

	useEffect(() => {
		const fetchPostsClientSide = async () => {
			if (!firebaseDb) {
				console.warn(
					"ForumHomePage: Firebase DB not available, cannot fetch posts client-side.",
				);
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
		// Otherwise, or if sorting/filtering changes, fetch client-side.
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

	if (authErrorHook) {
		return (
			<div className='page-error-indicator'>
				Authentication Error: {authErrorHook.message}. Please try refreshing.
			</div>
		);
	}

	// Modal component for creating a post
	// Only render if firebaseDb is available, as CreatePostForm depends on it.
	// createPostModalComponent and related states/functions removed

	const isAnyModalEffectivelyOpen = isAuthModalInDom; // Only auth modal can blur now

	return (
		<>
			{/* Head component should be added here if this component is meant to control page metadata */}
			{/* For now, assuming metadata is minimal or handled by _app.tsx for the forum index */}
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
									openAuthModal(); // Open auth modal instead
								} else if (!firebaseDb || authLoadingHook) {
									e.preventDefault(); // Prevent navigation if db not ready or auth loading
									// Optionally, show a toast message here
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
				<aside className='forum-sidebar'>
					<h3>Popular Tags</h3>
					<ul className='tag-filter-list'>
						{[
							// Ensure these tags have entries in your tagColors.ts or provide defaults
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
							const tagKey = tag.toLowerCase(); // Use lowercase key for tagColors
							const T_color = tagColors[tagKey] || {
								bg: "var(--muted-bg-color)", // Fallback background
								text: "var(--secondary-text-color)", // Fallback text color
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
				</aside>

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

				<div className='forum-content'>
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
		revalidate: 60 
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
	const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);
	const [firebaseDb, setFirebaseDb] = useState<Firestore | null>(null);
	const [firebaseInitialized, setFirebaseInitialized] = useState(false);
	const [firebaseError, setFirebaseError] = useState<Error | null>(null);

	useEffect(() => {
		// This console log is helpful for debugging mount timing
		// console.log("ForumHomePage Wrapper: Mounting. Attempting Firebase initialization.");
		initializeFirebaseAndGetServices()
			.then(({ auth: initializedAuth, db: initializedDb }) => {
				// console.log("ForumHomePage Wrapper: Firebase initialized successfully.");
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
