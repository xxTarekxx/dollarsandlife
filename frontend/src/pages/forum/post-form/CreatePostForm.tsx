// frontend/src/pages/forum/post-form/CreatePostForm.tsx
import React, { useState, useEffect, useRef } from "react";
import { auth } from "../../../firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import "./CreatePostForm.css";
import { createForumPost } from "../services/forumService";
import toast from "react-hot-toast";

interface CreatePostFormProps {
	onPostSuccess?: () => void;
}

// ✅ Predefined finance-related tags
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

const CreatePostForm: React.FC<CreatePostFormProps> = ({ onPostSuccess }) => {
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [tags, setTags] = useState<string[]>([]); // ✅ tags as array, not string
	const titleRef = useRef<HTMLInputElement>(null);
	const [user] = useAuthState(auth);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			await createForumPost({
				title,
				content,
				tags,
				authorId: user?.uid || "", // ✅ save logged-in user ID
				authorDisplayName: user?.displayName || "Anonymous",
			});
			toast.success("✅ Post submitted successfully!");
			onPostSuccess?.();
			setTitle("");
			setContent("");
			setTags([]); // ✅ reset tags as array
		} catch (error) {
			console.error("Failed to submit post", error);
			alert("Something went wrong. Try again.");
		}
	};

	useEffect(() => {
		titleRef.current?.focus();
	}, []);

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
			/>

			<label htmlFor='content'>Description</label>
			<textarea
				id='content'
				value={content}
				onChange={(e) => setContent(e.target.value)}
				required
				placeholder='Describe your question in detail...'
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

			<button type='submit' className='submit-post-button'>
				Submit Post
			</button>
		</form>
	);
};

export default CreatePostForm;
