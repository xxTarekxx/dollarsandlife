// frontend/src/pages/forum/post-form/CreatePostForm.tsx
import React, { useState, useEffect, useRef } from "react";
// import { auth } from "../../../firebase"; // REMOVE direct import
import { Auth } from "firebase/auth"; // Import Auth type
import { Firestore } from "firebase/firestore"; // Import Firestore type
import { useAuthState } from "react-firebase-hooks/auth";
import "./CreatePostForm.css";
import { createForumPost } from "../services/forumService";
import toast from "react-hot-toast";

interface CreatePostFormProps {
	onPostSuccess?: () => void;
	auth: Auth; // Expect auth instance as a prop
	db: Firestore; // Expect db instance as a prop
}

const availableTags = [
	"budgeting",
	"saving",
	"investing",
	"credit",
	"side hustles",
	"debt",
	"freelancing",
	"real estate",
	"taxes",
	"retirement",
];

const CreatePostForm: React.FC<CreatePostFormProps> = ({
	onPostSuccess,
	auth,
	db,
}) => {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const titleRef = useRef<HTMLInputElement>(null);
	const [user, loadingUser, errorUser] = useAuthState(auth); // Use passed auth instance

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			toast.error("You must be logged in to create a post.");
			// Optionally, trigger login modal if this form can appear for non-logged-in users
			return;
		}
		if (!db) {
			toast.error("Database service is not available. Cannot create post.");
			return;
		}

		try {
			await createForumPost(db, {
				// Pass db instance
				title,
				content,
				tags,
				authorId: user.uid,
				authorDisplayName: user.displayName || "Anonymous",
			});
			toast.success("✅ Post submitted successfully!");
			onPostSuccess?.();
			setTitle("");
			setContent("");
			setTags([]);
		} catch (error) {
			console.error("Failed to submit post", error);
			toast.error("Something went wrong. Try again.");
		}
	};

	useEffect(() => {
		titleRef.current?.focus();
	}, []);

	if (loadingUser) {
		return <p>Loading user information...</p>;
	}
	if (errorUser) {
		return <p>Error loading user: {errorUser.message}</p>;
	}

	return (
		<form className='create-post-form' onSubmit={handleSubmit}>
			<h2 className='form-heading'>Ask a New Question</h2>

			<label htmlFor='title'>Title</label>
			<input
				type='text'
				id='title'
				ref={titleRef}
				value={title}
				onChange={(e) => setTitle(e.target.value)}
				required
				placeholder='Enter your question title...'
				disabled={!user || !db}
			/>

			<label htmlFor='content'>Description</label>
			<textarea
				id='content'
				value={content}
				onChange={(e) => setContent(e.target.value)}
				required
				placeholder='Describe your question in detail...'
				disabled={!user || !db}
			/>

			<label>Choose Tags</label>
			<div className='form-tag-options'>
				{availableTags.map((tag) => (
					<span
						key={tag}
						className={`form-tag-pill ${tags.includes(tag) ? "selected" : ""}`}
						onClick={() =>
							setTags((prev) =>
								prev.includes(tag)
									? prev.filter((t) => t !== tag)
									: [...prev, tag],
							)
						}
					>
						{tag}
					</span>
				))}
			</div>

			<button
				type='submit'
				className='submit-post-button'
				disabled={!user || !db}
			>
				Submit Post
			</button>
		</form>
	);
};

export default CreatePostForm;
