import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import ReactDOM from "react-dom";
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import "./ForumHomePage.css";
import CreatePostForm from "../post-form/CreatePostForm";
import PostCard, { PostData } from "../Posts/PostCard";
import tagColors from "../../../utils/tagColors";
import AuthPromptModal from "../../../auth/AuthPromptModal";

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

const ForumHomePage: React.FC = () => {
	const [posts, setPosts] = useState<PostData[]>([]);
	const [loadingPosts, setLoadingPosts] = useState<boolean>(true);
	const [showCreatePostModal, setShowCreatePostModal] = useState(false);
	const [isCreatePostModalInDom, setIsCreatePostModalInDom] = useState(false);
	const [formKey, setFormKey] = useState(0);
	const [sortBy, setSortBy] = useState<"timestamp" | "helpfulVoteCount">(
		"timestamp",
	);
	const [activeTag, setActiveTag] = useState<string | null>(null);

	const [user, authLoading, authError] = useAuthState(auth);
	// Auth Modal States
	const [isAuthModalInDom, setIsAuthModalInDom] = useState(false); // Controls DOM presence
	// const [showAuthModal, setShowAuthModal] = useState(false); // This was for internal modal visibility, now less critical
	const [isAuthModalEmailPending, setIsAuthModalEmailPending] = useState(false); // New state

	const closeAuthModal = useCallback(() => {
		// setShowAuthModal(false); // Not strictly needed if isAuthModalInDom controls everything
		setIsAuthModalEmailPending(false); // Reset pending state when modal is intentionally closed
		setIsAuthModalInDom(false); // Remove from DOM after animation (AuthPromptModal handles its own fade out)
	}, []); // No dependencies needed if it only sets state

	// Effect to close Auth Modal if user logs in, UNLESS email verification is pending
	useEffect(() => {
		if (user && isAuthModalInDom && !isAuthModalEmailPending) {
			console.log(
				"ForumHomePage: User session detected, modal was open, and NOT email pending. Closing auth modal.",
			);
			closeAuthModal();
		}
		// If user logs out and the "email pending" flag was set (e.g. modal was closed by X), clear it
		if (!user && isAuthModalEmailPending) {
			setIsAuthModalEmailPending(false);
		}
	}, [user, isAuthModalInDom, isAuthModalEmailPending, closeAuthModal]);

	const openAuthModal = () => {
		setIsAuthModalEmailPending(false); // Reset on open
		setIsAuthModalInDom(true); // Add to DOM
		// AuthPromptModal handles its own internal isVisible state for fade-in
	};

	const openCreatePostModal = () => {
		if (!user) {
			openAuthModal();
			return;
		}
		setIsCreatePostModalInDom(true);
		setTimeout(() => setShowCreatePostModal(true), 10); // For fade-in animation
	};

	const closeCreatePostModal = () => {
		setShowCreatePostModal(false);
		setTimeout(() => {
			setIsCreatePostModalInDom(false);
			setFormKey((prev) => prev + 1);
		}, 300); // Match CSS animation
	};

	const handleLogout = async () => {
		try {
			setIsAuthModalEmailPending(false); // Clear pending state on logout
			await signOut(auth);
		} catch (error) {
			console.error("Error signing out: ", error);
		}
	};

	useEffect(() => {
		const fetchPosts = async () => {
			setLoadingPosts(true);
			const postsRef = collection(db, "forumPosts");
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
				console.error("Error fetching posts: ", error);
			} finally {
				setLoadingPosts(false);
			}
		};
		fetchPosts();
	}, [sortBy, activeTag]);

	if (authError) {
		return <p>Error initializing authentication: {authError.message}</p>;
	}

	const createPostModalComponent = (
		<div
			className={`modal-overlay ${
				showCreatePostModal ? "fade-in" : "fade-out"
			}`}
		>
			<div className='modal-content create-post-modal-content'>
				<button className='close-modal' onClick={closeCreatePostModal}>
					×
				</button>
				<CreatePostForm key={formKey} onPostSuccess={closeCreatePostModal} />
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
					<div className='forum-header-actions'>
						<button
							className='create-post-button-main'
							onClick={openCreatePostModal}
						>
							Ask a Question
						</button>
						<div className='user-status-widget'>
							{authLoading ? (
								<span className='auth-loading-text'>Loading...</span>
							) : user ? (
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
									<button onClick={handleLogout} className='logout-button'>
										Logout
									</button>
								</div>
							) : (
								<button onClick={openAuthModal} className='login-signup-button'>
									Login / Sign Up
								</button>
							)}
						</div>
					</div>
				</header>

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
						{!loadingPosts && posts.length === 0 && (
							<p className='no-posts-message'>
								No posts yet. Be the first to ask a question!
							</p>
						)}
						{!loadingPosts && posts.length > 0 && (
							<div className='post-list'>
								{posts.map((post) => (
									<PostCard key={post.id} post={post} />
								))}
							</div>
						)}
					</main>

					<aside className='forum-sidebar'>
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
				ReactDOM.createPortal(createPostModalComponent, modalRootElement)}

			{isAuthModalInDom && (
				<AuthPromptModal
					onClose={closeAuthModal}
					onSetEmailPending={setIsAuthModalEmailPending} // Pass the setter for the pending state
				/>
			)}
		</>
	);
};

export default ForumHomePage;
