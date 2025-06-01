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

const ViewPostPage: React.FC = () => {
	const { postId } = useParams();
	const navigate = useNavigate();

	const [post, setPost] = useState<PostData | null>(null);
	const [answers, setAnswers] = useState<any[]>([]);
	const [newAnswer, setNewAnswer] = useState("");
	const [loading, setLoading] = useState(true);
	const [user, authLoading] = useAuthState(auth);
	const [showAuthModal, setShowAuthModal] = useState(false);

	const isPostAuthor = user?.uid === post?.authorId;

	useEffect(() => {
		if (!postId || authLoading) return;

		const fetchPostAndAnswers = async () => {
			setLoading(true);
			try {
				const docRef = doc(db, "forumPosts", postId);
				const snapshot = await getDoc(docRef);

				if (snapshot.exists()) {
					setPost({ ...snapshot.data(), id: snapshot.id } as PostData);
				} else {
					console.log("Post not found with ID:", postId);
					setPost(null);
				}

				const answersRef = collection(db, "forumPosts", postId, "answers");
				const snap = await getDocs(answersRef);
				setAnswers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
			} catch (err) {
				console.error("Error loading post", err);
				setPost(null);
			} finally {
				setLoading(false);
			}
		};

		fetchPostAndAnswers();
	}, [postId, authLoading]);

	const handleSubmitAnswer = async () => {
		if (!postId || !auth) return;

		// If user is not logged in, show auth modal and stop processing
		if (!user) {
			setShowAuthModal(true);
			return;
		}

		if (!newAnswer.trim()) {
			toast.error("Answer cannot be empty.");
			return;
		}

		const answerData = {
			text: newAnswer.trim(),
			authorDisplayName: user.displayName || "Anonymous",
			authorId: user.uid,
			timestamp: new Date(),
			helpfulVoteCount: 0,
			notHelpfulVoteCount: 0,
		};

		const answerDocRef = await addDoc(
			collection(db, "forumPosts", postId, "answers"),
			answerData,
		);

		setAnswers((prev) => [...prev, { ...answerData, id: answerDocRef.id }]);
		setNewAnswer("");

		if (post) {
			const postRef = doc(db, "forumPosts", postId);
			await updateDoc(postRef, {
				answerCount: (post.answerCount || 0) + 1,
			});
			setPost((prevPost) =>
				prevPost
					? { ...prevPost, answerCount: (prevPost.answerCount || 0) + 1 }
					: null,
			);
		}
		toast.success("Answer posted!");
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
			setAnswers((prev) => prev.filter((a) => a.id !== answerId));

			if (post && post.answerCount > 0) {
				const postRef = doc(db, "forumPosts", postId);
				await updateDoc(postRef, {
					answerCount: post.answerCount - 1,
				});
				setPost((prevPost) =>
					prevPost
						? { ...prevPost, answerCount: prevPost.answerCount - 1 }
						: null,
				);
			}
			toast.success("Answer deleted.");
		} catch (e) {
			console.error("Error deleting answer:", e);
			toast.error("Failed to delete answer.");
		}
	};

	if (loading || authLoading)
		return <div className='page-loading-indicator'>Loading post...</div>;
	if (!post)
		return (
			<div className='page-error-indicator'>
				Post not found or an error occurred.
			</div>
		);

	return (
		<>
			<div className={`view-post-container ${showAuthModal ? "blurred" : ""}`}>
				<h1>{post.title}</h1>
				<div className='post-meta-row'>
					<span>By: {post.authorDisplayName || "Anonymous"}</span>
					<span>
						{post.timestamp?.seconds
							? new Date(post.timestamp.seconds * 1000).toLocaleDateString()
							: "Date unknown"}
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
							Vote on this post
						</button>
					))}

				{/* --- MODIFIED SECTION FOR ANSWER FORM --- */}
				<div className='answer-form'>
					<h3>Post Your Answer</h3>
					<textarea
						placeholder='Share your knowledge or insights...'
						value={newAnswer}
						onChange={(e) => setNewAnswer(e.target.value)}
						rows={5}
					/>
					<button
						onClick={handleSubmitAnswer}
						disabled={!newAnswer.trim() && !!user}
					>
						{/* Button is disabled if answer is empty AND user is logged in.
						    If user is not logged in, button is active to trigger auth modal.
						    Or simplify to: disabled={!newAnswer.trim()}
						    and let handleSubmitAnswer handle the user check for modal.
							Let's go with the simpler: disabled={!newAnswer.trim()}
						*/}
						Post Answer
					</button>
				</div>
				<div className='answers-section'>
					<h3>{post.answerCount || 0} Answers</h3>
					{answers.length > 0 ? (
						<div className='answers-list'>
							{answers
								.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
								.map((ans) => (
									<div key={ans.id} className='answer-card'>
										<div className='answer-text'>{ans.text}</div>
										<div className='answer-meta'>
											<span>By: {ans.authorDisplayName || "Anonymous"}</span>
											<span>
												{ans.timestamp?.seconds
													? new Date(
															ans.timestamp.seconds * 1000,
													  ).toLocaleDateString()
													: "Date unknown"}
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
