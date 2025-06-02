// frontend/src/pages/forum/view-post/ViewPostPage.tsx
import React, { useEffect, useState } from "react";
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
	serverTimestamp, // Import serverTimestamp
	query, // Import query
	orderBy, // Import orderBy
} from "firebase/firestore";
import { db, auth } from "../../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./ViewPostPage.css";
import VoteButtons from "../voting/VoteButtons";
import { deleteForumPost } from "../services/forumService";
import toast from "react-hot-toast";
import tagColors from "../../../utils/tagColors";

interface PostData {
	id: string;
	title: string;
	content: string;
	authorDisplayName: string;
	authorId?: string;
	timestamp: any; // Keep as any for flexibility with Firestore Timestamp object
	tags: string[];
	helpfulVoteCount: number;
	notHelpfulVoteCount: number;
	answerCount: number;
}

interface AnswerData {
	id: string;
	content: string; // Changed from 'text'
	authorDisplayName: string;
	authorId: string;
	postId: string; // Added postId
	timestamp: any; // Keep as any
	helpfulVoteCount?: number; // Make these optional if not always present or not in rules
	notHelpfulVoteCount?: number; // Make these optional
	// Add any other fields your answer document might have
}

const ViewPostPage: React.FC = () => {
	const { postId } = useParams<{ postId: string }>(); // Ensure postId is always string
	const navigate = useNavigate();

	const [post, setPost] = useState<PostData | null>(null);
	const [answers, setAnswers] = useState<AnswerData[]>([]);
	const [newAnswerContent, setNewAnswerContent] = useState(""); // Renamed for clarity
	const [loading, setLoading] = useState(true);
	const [user, authLoading] = useAuthState(auth);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

	const isPostAuthor = user?.uid === post?.authorId;

	useEffect(() => {
		if (!postId) {
			console.error("Post ID is missing from URL parameters.");
			setLoading(false);
			setPost(null); // Explicitly set post to null if postId is missing
			return;
		}
		if (authLoading) return; // Wait for auth state to resolve

		const fetchPostAndAnswers = async () => {
			setLoading(true);
			try {
				const postDocRef = doc(db, "forumPosts", postId);
				const postSnapshot = await getDoc(postDocRef);

				if (postSnapshot.exists()) {
					setPost({ id: postSnapshot.id, ...postSnapshot.data() } as PostData);
				} else {
					console.log("Post not found with ID:", postId);
					toast.error("Post not found.");
					setPost(null);
				}

				// Fetch answers ordered by timestamp (most recent first)
				const answersCollectionRef = collection(
					db,
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
				console.error("Error loading post or answers:", err);
				toast.error("Error loading content. Please try again.");
				setPost(null); // Set post to null on error
			} finally {
				setLoading(false);
			}
		};

		fetchPostAndAnswers();
	}, [postId, authLoading]); // Depend on postId and authLoading

	const handleSubmitAnswer = async () => {
		if (!postId) {
			toast.error("Cannot submit answer: Post ID is missing.");
			return;
		}

		if (!user) {
			setShowAuthModal(true);
			return;
		}

		if (!newAnswerContent.trim()) {
			toast.error("Answer cannot be empty.");
			return;
		}

		setIsSubmittingAnswer(true);

		// --- CONSTRUCTING answerData TO MATCH FIRESTORE RULES ---
		const answerDataToSubmit = {
			content: newAnswerContent.trim(), // Field name: 'content'
			authorId: user.uid, // Field name: 'authorId'
			postId: postId, // Field name: 'postId' - CRUCIAL
			timestamp: serverTimestamp(), // Field name: 'timestamp' - Use serverTimestamp
			// Optional fields that must be in 'hasOnly' if sent,
			// and your rules must not disallow them implicitly by 'hasOnly'.
			authorDisplayName: user.displayName || "Anonymous User",
			// Initialize vote counts if your app logic expects them at creation
			// helpfulVoteCount: 0,
			// notHelpfulVoteCount: 0,
		};

		// --- DEBUG LOGGING (same as before, very important) ---
		console.log(
			"Attempting to create answer with data:",
			JSON.stringify(answerDataToSubmit, null, 2),
		);
		console.log("Current User UID:", user.uid);
		console.log("Target Post ID:", postId);
		// --- END DEBUG LOGGING ---

		try {
			const answersCollectionRef = collection(
				db,
				"forumPosts",
				postId,
				"answers",
			);
			const newAnswerDocRef = await addDoc(
				answersCollectionRef,
				answerDataToSubmit,
			);

			// Optimistically update UI or re-fetch answers.
			// For simplicity, adding to local state. Re-fetching ensures server data.
			// The 'id' comes from newAnswerDocRef.id.
			// The 'timestamp' will be a Firestore ServerTimestamp object initially,
			// it resolves to a Date object when read back from Firestore.
			// For immediate UI update, we can simulate or wait for a re-fetch.
			// Let's keep it simple and add locally, but know a re-fetch is more robust for the actual timestamp.

			// To get the actual data with resolved server timestamp, it's better to re-fetch or listen to changes.
			// For now, we'll add a client-side representation:
			const optimisticAnswer: AnswerData = {
				...answerDataToSubmit,
				id: newAnswerDocRef.id,
				timestamp: new Date(), // Approximate for immediate UI update
			};
			setAnswers((prevAnswers) => [optimisticAnswer, ...prevAnswers]); // Add to beginning if sorted by desc timestamp
			setNewAnswerContent("");

			// Update answer count on the post
			if (post) {
				const postDocRef = doc(db, "forumPosts", postId);
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
			console.error("Error posting answer:", error);
			if (error.code === "permission-denied") {
				toast.error(
					"Permission denied. Please ensure all data is correct or check Firestore rules.",
				);
			} else {
				toast.error("Failed to post answer. Please try again.");
			}
		} finally {
			setIsSubmittingAnswer(false);
		}
	};

	const handleDeletePost = async () => {
		if (!post?.id) return;
		if (!window.confirm("Are you sure you want to delete this post?")) return;

		try {
			await deleteForumPost(post.id);
			toast.success("Post deleted successfully!");
			navigate("/forum");
		} catch (err) {
			console.error("Error deleting post:", err);
			toast.error("Failed to delete post.");
		}
	};

	const handleDeleteAnswer = async (answerId: string) => {
		if (!postId || !answerId) return;
		if (!window.confirm("Are you sure you want to delete this answer?")) return;

		try {
			await deleteDoc(doc(db, "forumPosts", postId, "answers", answerId));
			setAnswers((prevAnswers) =>
				prevAnswers.filter((ans) => ans.id !== answerId),
			);

			if (
				post &&
				typeof post.answerCount === "number" &&
				post.answerCount > 0
			) {
				const postDocRef = doc(db, "forumPosts", postId);
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
			console.error("Error deleting answer:", e);
			if (e.code === "permission-denied") {
				toast.error("Permission denied to delete this answer.");
			} else {
				toast.error("Failed to delete answer.");
			}
		}
	};

	if (loading || authLoading) {
		return (
			<div className='page-loading-indicator'>Loading post content...</div>
		);
	}

	if (!post) {
		return (
			<div className='page-error-indicator'>
				Post not found or there was an error loading the post. Please try
				refreshing or go back to the forum.
			</div>
		);
	}

	return (
		<>
			<div className={`view-post-container ${showAuthModal ? "blurred" : ""}`}>
				<h1>{post.title}</h1>
				<div className='post-meta-row'>
					<span>By: {post.authorDisplayName || "Anonymous User"}</span>
					<span>
						{post.timestamp?.seconds
							? new Date(post.timestamp.seconds * 1000).toLocaleDateString()
							: "Date not available"}
					</span>
					<span>{post.answerCount || 0} Answers</span>
					{isPostAuthor && (
						<button className='delete-post-button' onClick={handleDeletePost}>
							Delete Post 🗑️
						</button>
					)}
				</div>

				<div
					className='post-content'
					dangerouslySetInnerHTML={{ __html: post.content }} // Ensure content is sanitized if user-generated HTML
				></div>

				{post.tags && post.tags.length > 0 && (
					<div className='post-tags'>
						{post.tags.map((tag) => {
							const T_color = tagColors[tag.toLowerCase()] || {
								bg: "var(--muted-bg-color, #e9ecef)",
								text: "var(--muted-text-color, #495057)",
							};
							return (
								<span
									key={tag}
									className='tag-pill'
									style={{
										backgroundColor: T_color.bg,
										color: T_color.text,
										borderColor:
											T_color.bg !== "var(--muted-bg-color, #e9ecef)"
												? T_color.bg
												: "var(--border-color, #dee2e6)",
									}}
								>
									{tag.replace(/\b\w/g, (l) => l.toUpperCase())}
								</span>
							);
						})}
					</div>
				)}

				{!isPostAuthor &&
					(user ? (
						<div className='vote-buttons-wrapper-viewpost'>
							<VoteButtons
								itemId={post.id}
								initialHelpfulVotes={post.helpfulVoteCount}
								initialNotHelpfulVotes={post.notHelpfulVoteCount}
								itemType='post'
							/>
						</div>
					) : (
						<button
							className='prompt-vote-button'
							onClick={() => setShowAuthModal(true)}
						>
							Login to Vote
						</button>
					))}

				<div className='answer-form'>
					<h3>Post Your Answer</h3>
					{user ? (
						<>
							<textarea
								placeholder='Share your knowledge or insights...'
								value={newAnswerContent}
								onChange={(e) => setNewAnswerContent(e.target.value)}
								rows={5}
								disabled={isSubmittingAnswer}
							/>
							<button
								onClick={handleSubmitAnswer}
								disabled={!newAnswerContent.trim() || isSubmittingAnswer}
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

				<div className='answers-section'>
					<h3>{(answers && answers.length) || 0} Answers</h3>
					{answers && answers.length > 0 ? (
						<div className='answers-list'>
							{answers.map((ans) => (
								<div key={ans.id} className='answer-card'>
									<div className='answer-text'>{ans.content}</div>{" "}
									{/* Changed from ans.text */}
									<div className='answer-meta'>
										<span>By: {ans.authorDisplayName || "Anonymous User"}</span>
										<span>
											{ans.timestamp?.seconds
												? new Date(
														ans.timestamp.seconds * 1000,
												  ).toLocaleDateString()
												: ans.timestamp instanceof Date // Handle optimistic client-side date
												? ans.timestamp.toLocaleDateString()
												: "A moment ago"}
										</span>
										{user?.uid === ans.authorId && (
											<button
												className='delete-answer-button'
												onClick={() => handleDeleteAnswer(ans.id)}
											>
												Delete ❌
											</button>
										)}
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
				<AuthPromptModal onClose={() => setShowAuthModal(false)} />
			)}
		</>
	);
};

export default ViewPostPage;
