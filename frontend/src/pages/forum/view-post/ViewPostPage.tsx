import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
	collection,
	doc,
	getDoc,
	getDocs,
	addDoc,
	updateDoc,
} from "firebase/firestore";
import { db } from "../../../firebase";
import "./ViewPostPage.css";
import VoteButtons from "../voting/VoteButtons";
import { deleteForumPost } from "../services/forumService";
import toast from "react-hot-toast";

interface PostData {
	id: string;
	title: string;
	content: string;
	authorDisplayName: string;
	timestamp: any;
	tags: string[];
	helpfulVoteCount: number;
	notHelpfulVoteCount: number;
	answerCount: number;
}

const ViewPostPage: React.FC = () => {
	const { postId } = useParams();
	const [post, setPost] = useState<PostData | null>(null);
	const [loading, setLoading] = useState(true);
	const [answers, setAnswers] = useState<any[]>([]);
	const [newAnswer, setNewAnswer] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		const fetchPostAndAnswers = async () => {
			if (!postId) return;

			// Fetch post
			const docRef = doc(db, "forumPosts", postId);
			const snapshot = await getDoc(docRef);
			if (snapshot.exists()) {
				const data = snapshot.data() as Omit<PostData, "id">;
				setPost({ id: snapshot.id, ...data });
			}

			// Fetch answers
			const answersRef = collection(db, "forumPosts", postId, "answers");
			const answersSnapshot = await getDocs(answersRef);
			const answersData = answersSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data(),
			}));
			setAnswers(answersData);

			setLoading(false);
		};

		fetchPostAndAnswers();
	}, [postId]);

	const handleSubmitAnswer = async () => {
		if (!newAnswer.trim() || !postId) return;

		const answerData = {
			text: newAnswer.trim(),
			authorDisplayName: "Anonymous", // Update if you have user auth
			timestamp: new Date(),
		};

		await addDoc(collection(db, "forumPosts", postId, "answers"), answerData);

		setAnswers((prev) => [
			...prev,
			{ ...answerData, id: Date.now().toString() },
		]);
		setNewAnswer("");

		// Optional: update answerCount in post doc
		const postRef = doc(db, "forumPosts", postId);
		await updateDoc(postRef, {
			answerCount: answers.length + 1,
		});
	};

	const handleDeletePost = async () => {
		if (!post?.id) return;

		const confirmDelete = window.confirm(
			"Are you sure you want to delete this post?",
		);
		if (!confirmDelete) return;

		try {
			await deleteForumPost(post.id);
			toast.success("Post deleted successfully!");
			navigate("/forum"); // redirect to forum homepage
		} catch (error) {
			console.error("Error deleting post:", error);
			toast.error("Failed to delete post.");
		}
	};

	if (loading) return <p>Loading post...</p>;
	if (!post) return <p>Post not found.</p>;

	return (
		<div className='view-post-container'>
			<h1>{post.title}</h1>
			<div className='post-meta'>
				<span>By: {post.authorDisplayName}</span>
				<span>
					{new Date(post.timestamp?.seconds * 1000).toLocaleDateString()}
					<span className='answers-heading'>{answers.length} Answers </span>
				</span>
			</div>

			<p className='post-content'>{post.content}</p>
			<div className='post-actions'>
				<VoteButtons
					itemId={post.id}
					initialHelpfulVotes={post.helpfulVoteCount}
					initialNotHelpfulVotes={post.notHelpfulVoteCount}
					itemType='post'
				/>
				<button className='delete-post-button' onClick={handleDeletePost}>
					Delete Post 🗑️
				</button>
			</div>
			<div className='post-tags'>
				{post.tags.map((tag) => (
					<span key={tag} className='tag-pill'>
						{tag.replace(/\b\w/g, (l) => l.toUpperCase())}
					</span>
				))}
			</div>

			<div className='answers-list'>
				{answers.map((ans) => (
					<div key={ans.id} className='answer-card'>
						<p className='answer-text'>{ans.text}</p>
						<div className='answer-meta'>
							<span>By: {ans.authorDisplayName || "Anonymous"}</span>
							<span>
								{ans.timestamp?.seconds &&
									new Date(ans.timestamp.seconds * 1000).toLocaleDateString()}
							</span>
						</div>
					</div>
				))}
			</div>
			<div className='answer-form'>
				<h3>Your Answer</h3>
				<textarea
					placeholder='Type your answer here...'
					value={newAnswer}
					onChange={(e) => setNewAnswer(e.target.value)}
				/>
				<button onClick={handleSubmitAnswer}>Post Answer</button>
			</div>
		</div>
	);
};

export default ViewPostPage;
