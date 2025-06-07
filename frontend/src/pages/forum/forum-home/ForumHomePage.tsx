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
import { Auth, signOut, User as FirebaseUser } from "firebase/auth"; // Added FirebaseUser
import { initializeFirebaseAndGetServices } from "../../../firebase";
import { useAuthState, AuthStateHook } from "react-firebase-hooks/auth"; // Import AuthStateHook
import "./ForumHomePage.css";
import CreatePostForm from "../post-form/CreatePostForm";
import PostCard, { PostData } from "../Posts/PostCard";
import tagColors from "../../../utils/tagColors";
import AuthPromptModal from "../../../auth/AuthPromptModal";

// ... DefaultProfileIcon and modalRootElement ...
const DefaultProfileIcon = () => (
	<svg
		xmlns='http://www.w3.org/2000/svg'
		viewBox='0 0 24 24'
		fill='currentColor'
		width='24px'
		height='24px'
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

// Define a component that uses the hook once firebaseAuth is ready
const AuthenticatedForumHomePageContent: React.FC<{
	firebaseAuth: Auth;
	firebaseDb: Firestore | null;
	firebaseInitialized: boolean;
	firebaseError: Error | null;
}> = ({ firebaseAuth, firebaseDb, firebaseInitialized, firebaseError }) => {
	// Hook is now called conditionally based on firebaseAuth being ready
	const [user, authLoadingHook, authErrorHook] = useAuthState(firebaseAuth); // No '?? undefined' needed if type def is strict

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

	useEffect(() => {
		if (!authLoadingHook && user && isAuthModalInDom && firebaseAuth) {
			console.log(
				"ForumHomePage: User logged in, auth modal was open. AuthPromptModal's logic should close it.",
			);
		}
	}, [user, authLoadingHook, isAuthModalInDom, firebaseAuth]);

	const openAuthModal = () => {
		setIsAuthModalInDom(true);
	};

	const openCreatePostModal = () => {
		if (!user) {
			openAuthModal();
			return;
		}
		if (!firebaseDb) {
			// firebaseAuth is guaranteed here by component structure
			console.error(
				"ForumHomePage: Cannot open create post modal, Firebase DB not ready.",
			);
			return;
		}
		setIsCreatePostModalInDom(true);
		setTimeout(() => setShowCreatePostModal(true), 10);
	};

	const closeCreatePostModal = () => {
		setShowCreatePostModal(false);
		setTimeout(() => {
			setIsCreatePostModalInDom(false);
			setFormKey((prev) => prev + 1);
		}, 300);
	};

	const handleLogout = async () => {
		try {
			await signOut(firebaseAuth);
			if (isAuthModalInDom) {
				closeAuthModal();
			}
			console.log("ForumHomePage: User logged out.");
		} catch (error) {
			console.error("ForumHomePage: Error signing out: ", error);
		}
	};

	useEffect(() => {
		const fetchPosts = async () => {
			if (!firebaseDb) {
				setLoadingPosts(false);
				return;
			}
			setLoadingPosts(true);
			const postsRef = collection(firebaseDb, "forumPosts");
			let q;
			if (activeTag) {
				q = query(
					postsRef,
					where("tags", "array-contains", activeTag.toLowerCase()),
					orderBy(sortBy, "desc"),
				);
			} else {
				q = query(postsRef, orderBy(sortBy, "desc"));
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
			} finally {
				setLoadingPosts(false);
			}
		};

		if (firebaseInitialized && firebaseDb) {
			// firebaseInitialized is from parent now
			fetchPosts();
		} else if (firebaseInitialized && !firebaseDb) {
			console.warn(
				"ForumHomePage: Firebase init attempted, but DB not available for fetching posts.",
			);
			setLoadingPosts(false);
		}
	}, [sortBy, activeTag, firebaseDb, firebaseInitialized]);

	if (authErrorHook && firebaseInitialized) {
		return (
			<div className='page-error-indicator'>
				Error with authentication: {authErrorHook.message}
			</div>
		);
	}

	const authActuallyLoading = authLoadingHook; // firebaseAuth is present, so authLoadingHook is relevant

	const createPostModalComponent = firebaseDb && ( // firebaseAuth is already checked by parent
		<div
			className={`modal-overlay ${
				showCreatePostModal ? "fade-in" : "fade-out"
			}`}
		>
			<div className='modal-content create-post-modal-content'>
				<button className='close-modal' onClick={closeCreatePostModal}>
					×
				</button>
				<CreatePostForm
					key={formKey}
					onPostSuccess={closeCreatePostModal}
					auth={firebaseAuth}
					db={firebaseDb}
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
					<h1>Welcome to the Forum!</h1>
					<div className='forum-header-interactive-area'>
						<button
							className='create-post-button-main header-ask-question'
							onClick={openCreatePostModal}
							disabled={!firebaseInitialized || !firebaseDb}
						>
							Ask a Question
						</button>
						<div className='user-section'>
							{authActuallyLoading ? (
								<span className='auth-loading-text'>Loading user...</span>
							) : user ? (
								<div className='user-actions-area'>
									{/* ... user display ... */}
									<div className='user-profile-info'>
										{user.photoURL ? (
											<img
												src={user.photoURL}
												alt={user.displayName || "User"}
												className='profile-icon'
											/>
										) : (
											<span className='profile-icon default-icon'>
												<DefaultProfileIcon />
											</span>
										)}
										<span className='display-name'>
											{user.displayName || "User"}
										</span>
									</div>
									<button
										onClick={handleLogout}
										className='logout-button header-logout-button'
									>
										Logout
									</button>
								</div>
							) : (
								<button
									onClick={openAuthModal}
									className='login-signup-button header-login-button'
									disabled={!firebaseInitialized}
								>
									Login / Sign Up
								</button>
							)}
						</div>
					</div>
				</header>

				{/* ... sort controls and main content ... */}
				<div className='sort-controls'>
					<label htmlFor='sort-select'>Sort by:</label>
					<select
						id='sort-select'
						value={sortBy}
						onChange={(e) =>
							setSortBy(e.target.value as "timestamp" | "helpfulVoteCount")
						}
					>
						<option value='timestamp'>Newest</option>
						<option value='helpfulVoteCount'>Most Helpful</option>
					</select>
				</div>

				<div className='forum-content'>
					<main className='post-feed-area'>
						<h2>Recent Questions</h2>
						{loadingPosts && <p>Loading posts...</p>}
						{!loadingPosts && posts.length === 0 && firebaseDb && (
							<p className='no-posts-message'>
								No posts yet. Be the first to ask a question!
							</p>
						)}
						{!loadingPosts &&
							posts.length === 0 &&
							!firebaseDb &&
							firebaseInitialized && (
								<p className='no-posts-message'>
									Could not load posts. Database service might not be available.
								</p>
							)}
						{!loadingPosts && posts.length > 0 && (
							<div className='post-list'>
								{posts.map((post) => (
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

					<aside className='forum-sidebar'>
						{/* ... sidebar content ... */}
						<h3>Popular Tags</h3>
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
								const T_color = tagColors[tag.toLowerCase()] || {
									bg: "var(--muted-bg-color, #e9ecef)",
									text: "var(--muted-text-color, #495057)",
								};
								return (
									<li
										key={tag}
										style={{
											backgroundColor: T_color.bg,
											color: T_color.text,
											borderColor:
												T_color.bg !== "var(--muted-bg-color, #e9ecef)"
													? T_color.bg
													: "var(--border-color, #dee2e6)",
										}}
										className={`tag-pill ${
											activeTag === tag.toLowerCase() ? "active-tag" : ""
										}`}
										onClick={() =>
											setActiveTag((prevTag) =>
												prevTag === tag.toLowerCase()
													? null
													: tag.toLowerCase(),
											)
										}
									>
										{tag}
									</li>
								);
							})}
							{activeTag && (
								<li className='clear-tag' onClick={() => setActiveTag(null)}>
									Clear Filter <span className='clear-tag-icon'>✕</span>
								</li>
							)}
						</ul>
					</aside>
				</div>
			</div>

			{isCreatePostModalInDom &&
				firebaseDb &&
				ReactDOM.createPortal(createPostModalComponent, modalRootElement)}

			{isAuthModalInDom && (
				<AuthPromptModal onClose={closeAuthModal} auth={firebaseAuth} />
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
		console.log("ForumHomePage: Mounting. Attempting Firebase initialization.");
		initializeFirebaseAndGetServices()
			.then(({ auth: initializedAuth, db: initializedDb }) => {
				console.log("ForumHomePage: Firebase initialized successfully.");
				setFirebaseAuth(initializedAuth);
				setFirebaseDb(initializedDb);
				setFirebaseInitialized(true);
			})
			.catch((error) => {
				console.error("ForumHomePage: Firebase initialization failed:", error);
				setFirebaseError(error);
				setFirebaseInitialized(true); // Mark as attempted
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
				Error initializing Firebase: {firebaseError.message}. Please try
				refreshing.
			</div>
		);
	}

	if (!firebaseAuth) {
		// This case should ideally be covered by firebaseError if init failed,
		// but as a safeguard if init completes but auth is still null without an error.
		return (
			<div className='page-error-indicator'>
				Authentication service could not be loaded. Please try refreshing.
			</div>
		);
	}

	// Render the main content component only when firebaseAuth is available
	return (
		<AuthenticatedForumHomePageContent
			firebaseAuth={firebaseAuth}
			firebaseDb={firebaseDb}
			firebaseInitialized={firebaseInitialized}
			firebaseError={firebaseError}
		/>
	);
};

export default ForumHomePage;
