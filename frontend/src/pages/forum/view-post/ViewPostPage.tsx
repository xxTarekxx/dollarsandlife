// frontend/src/pages/forum/view-post/ViewPostPage.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AuthPromptModal from "../../../auth/AuthPromptModal";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	addDoc,
	updateDoc,
	deleteDoc,
	serverTimestamp,
	query,
	orderBy,
	Firestore,
} from "firebase/firestore";
import { Auth, User as FirebaseUser } from "firebase/auth"; // Added FirebaseUser
import { initializeFirebaseAndGetServices } from "../../../firebase";
import { useAuthState, AuthStateHook } from "react-firebase-hooks/auth"; // Import AuthStateHook
import "./ViewPostPage.css";
import VoteButtons from "../voting/VoteButtons";
import { deleteForumPost as deleteForumPostService } from "../services/forumService";
import toast from "react-hot-toast";
import tagColors from "../../../utils/tagColors";

// ... PostData and AnswerData interfaces ...
interface PostData {
	id: string;
	title: string;
	content: string;
	authorDisplayName: string;
	authorId?: string;
	timestamp: any;
	tags: string[];
	helpfulVoteCount: number;
	notHelpfulVoteCount: number;
	answerCount: number;
}
interface AnswerData {
	id: string;
	content: string;
	authorDisplayName: string;
	authorId: string;
	postId: string;
	timestamp: any;
	helpfulVoteCount: number;
	notHelpfulVoteCount: number;
}

const AuthenticatedViewPostPageContent: React.FC<{
	postId: string;
	firebaseAuth: Auth;
	firebaseDb: Firestore | null;
	firebaseInitialized: boolean;
	firebaseError: Error | null;
}> = ({
	postId,
	firebaseAuth,
	firebaseDb,
	firebaseInitialized,
	firebaseError,
}) => {
	const navigate = useNavigate();
	const [post, setPost] = useState<PostData | null>(null);
	const [answers, setAnswers] = useState<AnswerData[]>([]);
	const [newAnswerContent, setNewAnswerContent] = useState("");
	const [loadingData, setLoadingData] = useState(true);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

	const [user, authLoadingHook, authErrorHook] = useAuthState(firebaseAuth); // No '?? undefined'

	const isPostAuthor = user?.uid === post?.authorId;

	useEffect(() => {
		if (!firebaseDb) {
			// Wait for Firebase DB (firebaseAuth is guaranteed by parent)
			if (firebaseInitialized && !firebaseDb && firebaseError) {
				setLoadingData(false);
			}
			return;
		}

		const fetchPostAndAnswers = async () => {
			setLoadingData(true);
			try {
				const postDocRef = doc(firebaseDb, "forumPosts", postId);
				const postSnapshot = await getDoc(postDocRef);

				if (postSnapshot.exists()) {
					setPost({ id: postSnapshot.id, ...postSnapshot.data() } as PostData);
				} else {
					toast.error("Post not found.");
					setPost(null);
				}

				const answersCollectionRef = collection(
					firebaseDb,
					"forumPosts",
					postId,
					"answers",
				);
				const answersQuery = query(
					answersCollectionRef,
					orderBy("timestamp", "desc"),
				);
				const answersSnapshot = await getDocs(answersQuery);
				setAnswers(
					answersSnapshot.docs.map((d) => ({
						id: d.id,
						...d.data(),
					})) as AnswerData[],
				);
			} catch (err) {
				console.error("ViewPostPage: Error loading post or answers:", err);
				toast.error("Error loading content.");
				setPost(null);
			} finally {
				setLoadingData(false);
			}
		};

		fetchPostAndAnswers();
	}, [postId, firebaseDb, firebaseInitialized, firebaseError]); // firebaseAuth removed as it's stable from prop

	const handleSubmitAnswer = async () => {
		// firebaseAuth and firebaseDb are guaranteed by parent structure
		if (!postId || !firebaseDb) {
			toast.error(
				"Cannot submit answer: Services not ready or Post ID is missing.",
			);
			return;
		}
		if (!user) {
			setShowAuthModal(true);
			return;
		}
		// ... rest of handleSubmitAnswer logic is fine
		if (!newAnswerContent.trim()) {
			toast.error("Answer cannot be empty.");
			return;
		}
		setIsSubmittingAnswer(true);

		const answerDataToSubmit = {
			content: newAnswerContent.trim(),
			authorId: user.uid,
			postId: postId,
			timestamp: serverTimestamp(),
			authorDisplayName: user.displayName || "Anonymous User",
			helpfulVoteCount: 0,
			notHelpfulVoteCount: 0,
		};

		try {
			const answersCollectionRef = collection(
				firebaseDb,
				"forumPosts",
				postId,
				"answers",
			);
			const newAnswerDocRef = await addDoc(
				answersCollectionRef,
				answerDataToSubmit,
			);

			const optimisticAnswer: AnswerData = {
				...answerDataToSubmit,
				id: newAnswerDocRef.id,
				timestamp: new Date(),
			};
			setAnswers((prevAnswers) => [optimisticAnswer, ...prevAnswers]);
			setNewAnswerContent("");

			if (post) {
				const postDocRef = doc(firebaseDb, "forumPosts", postId);
				await updateDoc(postDocRef, {
					answerCount: (post.answerCount || 0) + 1,
				});
				setPost((prevPost) =>
					prevPost
						? { ...prevPost, answerCount: (prevPost.answerCount || 0) + 1 }
						: null,
				);
			}
			toast.success("Answer posted successfully!");
		} catch (error: any) {
			console.error("ViewPostPage: Error posting answer:", error);
			if (error.code === "permission-denied") {
				toast.error(
					"Permission denied. Check Firestore rules and ensure data is correct.",
				);
			} else {
				toast.error("Failed to post answer.");
			}
		} finally {
			setIsSubmittingAnswer(false);
		}
	};

	const handleDeletePost = async () => {
		if (!post?.id || !firebaseDb) return;
		if (!window.confirm("Are you sure you want to delete this post?")) return;
		try {
			await deleteForumPostService(firebaseDb, post.id);
			toast.success("Post deleted successfully!");
			navigate("/forum");
		} catch (err) {
			toast.error("Failed to delete post.");
		}
	};

	const handleDeleteAnswer = async (answerId: string) => {
		if (!postId || !answerId || !firebaseDb) return;
		// ... rest of handleDeleteAnswer is fine
		if (!window.confirm("Are you sure you want to delete this answer?")) return;
		try {
			await deleteDoc(
				doc(firebaseDb, "forumPosts", postId, "answers", answerId),
			);
			setAnswers((prevAnswers) =>
				prevAnswers.filter((ans) => ans.id !== answerId),
			);
			if (
				post &&
				typeof post.answerCount === "number" &&
				post.answerCount > 0
			) {
				const postDocRef = doc(firebaseDb, "forumPosts", postId);
				await updateDoc(postDocRef, {
					answerCount: post.answerCount - 1,
				});
				setPost((prevPost) =>
					prevPost
						? { ...prevPost, answerCount: prevPost.answerCount - 1 }
						: null,
				);
			}
			toast.success("Answer deleted successfully.");
		} catch (e: any) {
			if (e.code === "permission-denied") {
				toast.error("Permission denied to delete this answer.");
			} else {
				toast.error("Failed to delete answer.");
			}
		}
	};

	// Combined loading state for this authenticated content
	const isLoadingPageContent = authLoadingHook || loadingData;

	if (isLoadingPageContent) {
		// Simpler loading check here as parent handles firebase init
		return (
			<div className='page-loading-indicator'>Loading post details...</div>
		);
	}
	if (authErrorHook) {
		return (
			<div className='page-error-indicator'>
				Authentication error: {authErrorHook.message}
			</div>
		);
	}
	if (!post && !loadingData) {
		// Ensure data loading done
		return (
			<div className='page-error-indicator'>
				Post not found or error loading data.
			</div>
		);
	}
	if (!post) {
		// General fallback if post is still null
		return <div className='page-error-indicator'>Post data unavailable.</div>;
	}

	// ... JSX for rendering the post, answer form, answers list ...
	// This is the same JSX as before, starting from the <div className="view-post-container">
	// Ensure all uses of firebaseAuth and firebaseDb are from props if needed, or directly.
	return (
		<>
			<div className={`view-post-container ${showAuthModal ? "blurred" : ""}`}>
				<h1>{post.title}</h1>
				{/* ... post meta, content, tags ... */}
				<div className='post-meta-row'>
					<div className='post-meta-info-group'>
						<span>By: {post.authorDisplayName || "Anonymous User"}</span>
						<span className='post-meta-separator-mobile'> • </span>
						<span>
							{post.timestamp?.seconds
								? new Date(post.timestamp.seconds * 1000).toLocaleDateString()
								: "Date unavailable"}
						</span>
						<span className='post-meta-separator-mobile'> • </span>
						<span>{post.answerCount || 0} Answers</span>
					</div>
					{isPostAuthor && (
						<button
							className='delete-post-button'
							onClick={handleDeletePost}
							disabled={!firebaseDb}
						>
							Delete Post 🗑️
						</button>
					)}
				</div>

				<div
					className='post-content'
					dangerouslySetInnerHTML={{ __html: post.content }}
				></div>

				{post.tags && post.tags.length > 0 && (
					<div className='post-tags'>
						{post.tags.map((tag) => {
							const T_color = tagColors[tag.toLowerCase()] || {
								bg: "#e9ecef",
								text: "#495057",
							};
							return (
								<span
									key={tag}
									className='tag-pill'
									style={{
										backgroundColor: T_color.bg,
										color: T_color.text,
										borderColor:
											T_color.bg !== "#e9ecef" ? T_color.bg : "#dee2e6",
									}}
								>
									{tag.replace(/\b\w/g, (l) => l.toUpperCase())}
								</span>
							);
						})}
					</div>
				)}

				{/* Vote buttons for the POST itself - firebaseAuth and firebaseDb are from props now */}
				<div className='vote-buttons-wrapper-viewpost'>
					<VoteButtons
						itemId={post.id}
						initialHelpfulVotes={post.helpfulVoteCount}
						initialNotHelpfulVotes={post.notHelpfulVoteCount}
						itemType='post'
						itemAuthorId={post.authorId}
						auth={firebaseAuth} // from prop
						db={firebaseDb!} // from prop, assert not null as parent checks
					/>
				</div>

				<div className='answer-form'>
					<h3>Post Your Answer</h3>
					{user ? (
						<>
							<textarea
								placeholder='Share your knowledge...'
								value={newAnswerContent}
								onChange={(e) => setNewAnswerContent(e.target.value)}
								rows={5}
								disabled={isSubmittingAnswer || !firebaseDb}
							/>
							<button
								onClick={handleSubmitAnswer}
								disabled={
									!newAnswerContent.trim() || isSubmittingAnswer || !firebaseDb
								}
							>
								{isSubmittingAnswer ? "Submitting..." : "Post Answer"}
							</button>
						</>
					) : (
						<div className='answer-form-prompt'>
							<p>
								Please{" "}
								<button
									className='link-button'
									onClick={() => setShowAuthModal(true)}
								>
									log in
								</button>{" "}
								or{" "}
								<button
									className='link-button'
									onClick={() => setShowAuthModal(true)}
								>
									sign up
								</button>{" "}
								to post an answer.
							</p>
						</div>
					)}
				</div>

				<div className='answers-section' id='answers'>
					<h3>{(answers && answers.length) || 0} Answers</h3>
					{answers && answers.length > 0 ? (
						<div className='answers-list'>
							{answers.map((ans) => (
								<div key={ans.id} className='answer-card'>
									<div className='answer-text'>{ans.content}</div>
									<div className='answer-meta'>
										<span>By: {ans.authorDisplayName || "Anonymous User"}</span>
										<span>
											{ans.timestamp?.seconds
												? new Date(
														ans.timestamp.seconds * 1000,
												  ).toLocaleDateString()
												: ans.timestamp instanceof Date
												? ans.timestamp.toLocaleDateString()
												: "A moment ago"}
										</span>
										{user?.uid === ans.authorId && (
											<button
												className='delete-answer-button'
												onClick={() => handleDeleteAnswer(ans.id)}
												disabled={!firebaseDb}
											>
												Delete ❌
											</button>
										)}
									</div>
									{/* Vote buttons for each ANSWER - firebaseAuth and firebaseDb from props */}
									<div className='vote-buttons-wrapper-answer'>
										<VoteButtons
											itemId={ans.id}
											initialHelpfulVotes={ans.helpfulVoteCount || 0}
											initialNotHelpfulVotes={ans.notHelpfulVoteCount || 0}
											itemType='answer'
											itemAuthorId={ans.authorId}
											postIdForItem={postId}
											auth={firebaseAuth} // from prop
											db={firebaseDb!} // from prop, assert not null
										/>
									</div>
								</div>
							))}
						</div>
					) : (
						<p className='no-answers-yet'>
							No answers yet. Be the first to respond!
						</p>
					)}
				</div>
			</div>
			{showAuthModal && (
				<AuthPromptModal
					onClose={() => setShowAuthModal(false)}
					auth={firebaseAuth}
				/>
			)}
		</>
	);
};

const ViewPostPage: React.FC = () => {
	const { postId } = useParams<{ postId: string }>();
	const [firebaseAuth, setFirebaseAuth] = useState<Auth | null>(null);
	const [firebaseDb, setFirebaseDb] = useState<Firestore | null>(null);
	const [firebaseInitialized, setFirebaseInitialized] = useState(false);
	const [firebaseError, setFirebaseError] = useState<Error | null>(null);

	useEffect(() => {
		console.log("ViewPostPage: Mounting. Attempting Firebase initialization.");
		initializeFirebaseAndGetServices()
			.then(({ auth: initializedAuth, db: initializedDb }) => {
				console.log("ViewPostPage: Firebase initialized successfully.");
				setFirebaseAuth(initializedAuth);
				setFirebaseDb(initializedDb);
				setFirebaseInitialized(true);
			})
			.catch((error) => {
				console.error("ViewPostPage: Firebase initialization failed:", error);
				setFirebaseError(error);
				setFirebaseInitialized(true); // Mark as attempted
			});
	}, []);

	if (!postId) {
		// Handle missing postId early
		return (
			<div className='page-error-indicator'>Error: Post ID is missing.</div>
		);
	}

	if (!firebaseInitialized) {
		return (
			<div className='page-loading-indicator'>Initializing services...</div>
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
		return (
			<div className='page-error-indicator'>
				Authentication service could not be loaded. Please try refreshing.
			</div>
		);
	}

	// Render the main content component only when firebaseAuth and postId are available
	return (
		<AuthenticatedViewPostPageContent
			postId={postId}
			firebaseAuth={firebaseAuth}
			firebaseDb={firebaseDb}
			firebaseInitialized={firebaseInitialized} // Pass these down if needed by child
			firebaseError={firebaseError} // or if child has its own loading
		/>
	);
};

export default ViewPostPage;
