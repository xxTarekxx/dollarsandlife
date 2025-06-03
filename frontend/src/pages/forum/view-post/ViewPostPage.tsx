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
	serverTimestamp,
	query,
	orderBy,
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
	helpfulVoteCount: number; // Ensure this is initialized
	notHelpfulVoteCount: number; // Ensure this is initialized
}
const ViewPostPage: React.FC = () => {
	const { postId } = useParams<{ postId: string }>();
	const navigate = useNavigate();
	const [post, setPost] = useState<PostData | null>(null);
	const [answers, setAnswers] = useState<AnswerData[]>([]);
	const [newAnswerContent, setNewAnswerContent] = useState("");
	const [loading, setLoading] = useState(true);
	const [user, authLoading] = useAuthState(auth);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [isSubmittingAnswer, setIsSubmittingAnswer] = useState(false);

	const isPostAuthor = user?.uid === post?.authorId;

	useEffect(() => {
		if (!postId) {
			console.error("Post ID is missing");
			setLoading(false);
			setPost(null);
			return;
		}
		if (authLoading) return;

		const fetchPostAndAnswers = async () => {
			setLoading(true);
			try {
				const postDocRef = doc(db, "forumPosts", postId);
				const postSnapshot = await getDoc(postDocRef);

				if (postSnapshot.exists()) {
					setPost({ id: postSnapshot.id, ...postSnapshot.data() } as PostData);
				} else {
					toast.error("Post not found.");
					setPost(null);
				}

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
				toast.error("Error loading content.");
				setPost(null);
			} finally {
				setLoading(false);
			}
		};

		fetchPostAndAnswers();
	}, [postId, authLoading]);

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

		const answerDataToSubmit = {
			content: newAnswerContent.trim(),
			authorId: user.uid,
			postId: postId,
			timestamp: serverTimestamp(),
			authorDisplayName: user.displayName || "Anonymous User",
			helpfulVoteCount: 0, // <-- FIXED: Initialize vote count
			notHelpfulVoteCount: 0, // <-- FIXED: Initialize vote count
		};

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

			const optimisticAnswer: AnswerData = {
				...answerDataToSubmit,
				id: newAnswerDocRef.id,
				timestamp: new Date(), // Approximate for UI
			};
			setAnswers((prevAnswers) => [optimisticAnswer, ...prevAnswers]);
			setNewAnswerContent("");

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
		if (!post?.id) return;
		if (!window.confirm("Are you sure you want to delete this post?")) return;
		try {
			await deleteForumPost(post.id);
			toast.success("Post deleted successfully!");
			navigate("/forum");
		} catch (err) {
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
				Post not found or error loading.
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
							: "Date unavailable"}
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

				{/* Vote buttons for the POST itself */}
				<div className='vote-buttons-wrapper-viewpost'>
					<VoteButtons
						itemId={post.id}
						initialHelpfulVotes={post.helpfulVoteCount}
						initialNotHelpfulVotes={post.notHelpfulVoteCount}
						itemType='post'
						itemAuthorId={post.authorId} // <-- FIXED: Pass authorId for the post
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
											>
												Delete ❌
											</button>
										)}
									</div>
									{/* Vote buttons for each ANSWER */}
									<div className='vote-buttons-wrapper-answer'>
										<VoteButtons
											itemId={ans.id}
											initialHelpfulVotes={ans.helpfulVoteCount || 0}
											initialNotHelpfulVotes={ans.notHelpfulVoteCount || 0}
											itemType='answer'
											itemAuthorId={ans.authorId} // <-- FIXED: Pass answer's authorId
											postIdForItem={postId} // Pass parent post ID for context if needed by castVote
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
				<AuthPromptModal onClose={() => setShowAuthModal(false)} />
			)}
		</>
	);
};

export default ViewPostPage;
