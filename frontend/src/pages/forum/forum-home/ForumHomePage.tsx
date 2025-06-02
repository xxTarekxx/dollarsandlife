import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom"; // <<--- IMPORT ReactDOM
import { collection, getDocs, query, orderBy, where } from "firebase/firestore";
import { db, auth } from "../../../firebase"; // Ensure auth is exported from firebase.ts
import { signOut } from "firebase/auth"; // Import signOut
import { useAuthState } from "react-firebase-hooks/auth"; // Import useAuthState
import "./ForumHomePage.css";
import CreatePostForm from "../post-form/CreatePostForm";
import PostCard, { PostData } from "../Posts/PostCard";
import tagColors from "../../../utils/tagColors";
import AuthPromptModal from "../../../auth/AuthPromptModal"; // Path to your AuthPromptModal

// A simple default profile icon (SVG)
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

// Get the modal root element, or create it if it doesn't exist
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
	const [showAuthModal, setShowAuthModal] = useState(false); // Still used to control visibility intent from FHP
	const [isAuthModalInDom, setIsAuthModalInDom] = useState(false); // Controls if AuthPromptModal is rendered

	useEffect(() => {
		if (user && (showAuthModal || isAuthModalInDom)) {
			setShowAuthModal(false);
			setTimeout(() => setIsAuthModalInDom(false), 300);
		}
	}, [user, showAuthModal, isAuthModalInDom]);

	const openAuthModal = () => {
		setIsAuthModalInDom(true);
		setTimeout(() => setShowAuthModal(true), 10); // showAuthModal can be used by AuthPromptModal if needed, or just for FHP logic
	};

	const closeAuthModal = () => {
		setShowAuthModal(false); // Signal intent to close
		setTimeout(() => setIsAuthModalInDom(false), 300); // Remove AuthPromptModal from DOM
	};

	const openCreatePostModal = () => {
		if (!user) {
			openAuthModal();
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

	// Determine if any modal is active for blurring the background
	const isAnyModalEffectivelyOpen =
		(isCreatePostModalInDom && showCreatePostModal) ||
		(isAuthModalInDom && showAuthModal);

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

			{/* --- Render Modals --- */}
			{/* CreatePostModal is portalized here as its JSX includes the necessary overlay/content structure */}
			{isCreatePostModalInDom &&
				ReactDOM.createPortal(createPostModalComponent, modalRootElement)}

			{/* AuthPromptModal handles its own portal internally.
                We just need to ensure it's rendered when needed.
                It will append itself to the modalRootElement.
                The `showAuthModal` state can be passed if AuthPromptModal needs an external trigger
                for its internal `isVisible` state, or ForumHomePage can rely on `isAuthModalInDom`
                for its own logic (like the .blurred class).
                AuthPromptModal's own useEffect for visibility will handle its fade-in/out.
            */}
			{isAuthModalInDom && (
				<AuthPromptModal
					onClose={closeAuthModal}
					// Optional: pass showAuthModal if AuthPromptModal's internal visibility depends on it
					// isInitiallyVisible={showAuthModal}
				/>
			)}
		</>
	);
};

export default ForumHomePage;
