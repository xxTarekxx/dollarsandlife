import React, { useState, useEffect, useCallback } from "react";
import ReactDOM from "react-dom";
import {
	Firestore,
	collection,
	getDocs,
	query,
	orderBy,
	where,
} from "firebase/firestore";
import { Auth, signOut } from "firebase/auth"; // FirebaseUser not explicitly used by this component
import { initializeFirebaseAndGetServices } from "../../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./ForumHomePage.css"; // Stylesheet linked
import CreatePostForm from "../post-form/CreatePostForm";
import PostCard, { PostData } from "../Posts/PostCard";
import tagColors from "../../../utils/tagColors"; // Your tagColors import
import AuthPromptModal from "../../../auth/AuthPromptModal";

const DefaultProfileIcon = () => (
	// Using your original SVG structure
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		fill='currentColor'
		// width and height will be controlled by CSS via .profile-icon.default-icon svg
	>
		<path d='M0 0h24v24H0z' fill='none' />
		<path d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z' />
	</svg>
);

const modalRootElement =
	document.getElementById("modal-root") ||
	(() => {
		const el = document.createElement("div");
		el.id = "modal-root";
		document.body.appendChild(el);
		return el;
	})();

const AuthenticatedForumHomePageContent: React.FC<{
	firebaseAuth: Auth;
	firebaseDb: Firestore | null;
	// firebaseInitialized and firebaseError are handled by the parent, not directly used here for rendering logic
}> = ({ firebaseAuth, firebaseDb }) => {
	const [user, authLoadingHook, authErrorHook] = useAuthState(firebaseAuth);

	const [posts, setPosts] = useState<PostData[]>([]);
	const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
	const [showCreatePostModal, setShowCreatePostModal] = useState(false);
	const [isCreatePostModalInDom, setIsCreatePostModalInDom] = useState(false);
	const [formKey, setFormKey] = useState(0);
	const [sortBy, setSortBy] = useState<"timestamp" | "helpfulVoteCount">(
		"timestamp",
	);
	const [activeTag, setActiveTag] = useState<string | null>(null);
	const [isAuthModalInDom, setIsAuthModalInDom] = useState(false);

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

	const openCreatePostModal = () => {
		if (!user) {
			openAuthModal();
			return;
		}
		if (!firebaseDb) {
			console.error(
				"ForumHomePage: Cannot open create post modal, Firebase DB not ready.",
			);
			// Consider showing a user-facing message here (e.g., a toast notification)
			return;
		}
		setIsCreatePostModalInDom(true);
		setTimeout(() => setShowCreatePostModal(true), 10); // Small delay for CSS transition
	};

	const closeCreatePostModal = () => {
		setShowCreatePostModal(false); // Start fade-out animation
		const animationDurationString = getComputedStyle(document.documentElement)
			.getPropertyValue("--modal-animation-duration")
			.trim();
		const animationDuration =
			parseFloat(animationDurationString || "0.2") * 1000;
		setTimeout(() => {
			setIsCreatePostModalInDom(false); // Remove from DOM after animation
			setFormKey((prev) => prev + 1); // Reset form
		}, animationDuration);
	};

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
		const fetchPosts = async () => {
			if (!firebaseDb) {
				console.warn(
					"ForumHomePage: Firebase DB not available, cannot fetch posts.",
				);
				setLoadingPosts(false);
				setPosts([]); // Clear any existing posts
				return;
			}
			setLoadingPosts(true);
			const postsRef = collection(firebaseDb, "forumPosts");
			let q;
			const effectiveSortBy = sortBy; // To avoid issues with state in query
			if (activeTag) {
				q = query(
					postsRef,
					where("tags", "array-contains", activeTag.toLowerCase()), // Assuming tags are stored lowercase
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
				console.error("ForumHomePage: Error fetching posts: ", error);
				setPosts([]); // Clear posts on error
				// Optionally, set an error state to display a message to the user
			} finally {
				setLoadingPosts(false);
			}
		};

		// Fetch posts if firebaseDb is available.
		// firebaseInitialized check is handled by the parent component.
		fetchPosts();
	}, [sortBy, activeTag, firebaseDb]);

	if (authErrorHook) {
		// This error is from useAuthState
		return (
			<div className='page-error-indicator'>
				Authentication Error: {authErrorHook.message}. Please try refreshing.
			</div>
		);
	}

	// Modal component for creating a post
	// Only render if firebaseDb is available, as CreatePostForm depends on it.
	const createPostModalComponent = firebaseDb && (
		<div
			className={`modal-overlay ${
				// Manages overlay visibility and fade animation
				showCreatePostModal ? "fade-in" : "fade-out"
			}`}
			role='dialog'
			aria-modal='true'
			aria-labelledby='create-post-modal-title' // Assuming CreatePostForm has an h2 with this id
		>
			<div className='modal-content create-post-modal-content'>
				{" "}
				{/* Manages content pop-in animation */}
				<button
					type='button'
					className='close-modal'
					onClick={closeCreatePostModal}
					aria-label='Close create post dialog'
				>
					×
				</button>
				{/* CreatePostForm might need an id for aria-labelledby if it has a title */}
				<CreatePostForm
					key={formKey} // To reset the form state
					onPostSuccess={closeCreatePostModal}
					auth={firebaseAuth} // firebaseAuth is guaranteed non-null here
					db={firebaseDb} // firebaseDb is guaranteed non-null here
				/>
			</div>
		</div>
	);

	const isAnyModalEffectivelyOpen =
		(isCreatePostModalInDom && showCreatePostModal) || isAuthModalInDom;

	return (
		<>
			<div
				className={`forum-homepage-container ${
					isAnyModalEffectivelyOpen ? "blurred" : ""
				}`}
			>
				<header className='forum-header'>
					<h1>Welcome To Our Community!</h1>
					<div className='forum-header-interactive-area'>
						<button
							type='button'
							className='create-post-button-main header-ask-question'
							onClick={openCreatePostModal}
							disabled={!firebaseDb || authLoadingHook} // Disable if DB not ready or auth loading
						>
							Ask a Question
						</button>
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

			{isCreatePostModalInDom &&
				firebaseDb /* Conditional rendering for CreatePostModal */ &&
				ReactDOM.createPortal(createPostModalComponent, modalRootElement)}

			{isAuthModalInDom /* AuthPromptModal doesn't strictly need firebaseDb */ && (
				<AuthPromptModal
					onClose={closeAuthModal}
					auth={firebaseAuth} // firebaseAuth is guaranteed
				/>
			)}
		</>
	);
};

const ForumHomePage: React.FC = () => {
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

	// firebaseDb can be null, AuthenticatedForumHomePageContent is designed to handle this
	return (
		<AuthenticatedForumHomePageContent
			firebaseAuth={firebaseAuth}
			firebaseDb={firebaseDb}
			// firebaseInitialized and firebaseError are handled above, no need to pass them here
			// unless AuthenticatedForumHomePageContent has specific logic for them beyond what's already covered.
		/>
	);
};

export default ForumHomePage;
