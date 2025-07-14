// frontend/pages/forum/create-post.tsx - Adapted to be a page
"use client";
import Head from "next/head";
import { useRouter } from "next/router"; // Added for navigation
import React, { useEffect, useRef, useState } from "react";
// import { auth } from "../../../firebase"; // REMOVE direct import - Auth is passed as prop or obtained via context
import { Auth, onAuthStateChanged, User } from "firebase/auth"; // Import Auth type
import { Firestore } from "firebase/firestore"; // Import Firestore type
import { GetServerSideProps } from "next";
import toast from "react-hot-toast";
import { getFirebaseAuth, getFirebaseDb } from "../../src/firebase"; // Add this import
import { createForumPost } from "../../src/services/forum/forumService"; // Adjusted path
import styles from "./CreatePostForm.module.css";

// If this is a standalone page, onPostSuccess might not be passed as a prop.
// Instead, navigation might occur directly in handleSubmit.
interface CreatePostFormProps {
	authInput?: Auth; // Renamed to avoid conflict if initialized locally
	dbInput?: Firestore; // Renamed to avoid conflict if initialized locally
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

const CreatePostFormPage: React.FC<CreatePostFormProps> = ({
	authInput,
	dbInput,
}) => {
	const router = useRouter();
	const [title, setTitle] = useState("");
	const [content, setContent] = useState("");
	const [tags, setTags] = useState<string[]>([]);
	const titleRef = useRef<HTMLInputElement>(null);

	// Firebase services state - for standalone page behavior
	const [auth, setAuth] = useState<Auth | null>(authInput || null);
	const [db, setDb] = useState<Firestore | null>(dbInput || null);
	const [user, setUser] = useState<User | null>(null);
	const [loadingUser, setLoadingUser] = useState(true);
	const [errorUser, setErrorUser] = useState<Error | null>(null);

	useEffect(() => {
		if (!auth) {
			getFirebaseAuth().then(setAuth);
		}
		if (!db) {
			getFirebaseDb().then(setDb);
		}
	}, [auth, db]);

	// Manual auth state listener to avoid useAuthState with null auth
	useEffect(() => {
		if (!auth) return;

		const unsubscribe = onAuthStateChanged(
			auth,
			(user) => {
				setUser(user);
				setLoadingUser(false);
			},
			(error) => {
				setErrorUser(error);
				setLoadingUser(false);
			}
		);

		return () => unsubscribe();
	}, [auth]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!user) {
			toast.error("You must be logged in to create a post.");
			return;
		}
		if (!db) {
			toast.error("Database service is not available. Cannot create post.");
			return;
		}

		try {
			await createForumPost(db, {
				title,
				content,
				tags,
				authorId: user.uid,
				authorDisplayName: user.displayName || "Anonymous",
			});
			toast.success("✅ Post submitted successfully!");
			// onPostSuccess?.(); // Replaced with router push
			router.push("/forum"); // Navigate to forum index after successful post
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

	useEffect(() => {
		if (auth) {
			// Only focus if services (specifically auth for user check) are ready
			titleRef.current?.focus();
		}
	}, [auth]);

	// Show loading state while Firebase services are initializing
	if (!auth || !db) {
		return <div>Loading authentication...</div>;
	}

	// Show loading state while user auth state is being determined
	if (loadingUser) {
		return <p>Loading page...</p>;
	}

	if (errorUser) {
		return (
			<p>Error loading user: {errorUser.message}. Please try refreshing.</p>
		);
	}
	if (!auth || !db) {
		return (
			<p>Error: Firebase services not available. Please try refreshing.</p>
		);
	}

	return (
		<div>
			<Head>
				<title>Create New Forum Post | Dollars & Life</title>
				<meta
					name='description'
					content='Ask a question or start a new discussion in the Dollars & Life community forum.'
				/>
				{/* Add other relevant meta tags like noindex if this page shouldn't be indexed directly without auth */}
			</Head>
			<form className={styles["create-post-form"]} onSubmit={handleSubmit}>
				<h1 className={styles["form-heading"]}>Ask a New Question</h1>{" "}
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
				<label>Choose Tags (up to 3 recommended)</label>
				<div className={styles["form-tag-options"]}>
					{availableTags.map((tag) => (
						<span
							key={tag}
							className={`${styles["form-tag-pill"]} ${tags.includes(tag) ? styles["selected"] : ""}`}
							onClick={() => {
								if (tags.includes(tag)) {
									setTags((prev) => prev.filter((t) => t !== tag));
								} else if (tags.length < 3) {
									setTags((prev) => [...prev, tag]);
								} else {
									toast.error("You can select up to 3 tags.");
								}
							}}
						>
							{tag}
						</span>
					))}
				</div>
				<button
					type='submit'
					className={styles["submit-post-button"]}
					disabled={!user || !db || !title.trim() || !content.trim()} // Basic validation
				>
					Submit Post
				</button>
			</form>
		</div>
	);
};

// Prevent server-side rendering since this page requires Firebase auth
export const getServerSideProps: GetServerSideProps = async () => {
	return {
		props: {}, // Return empty props to prevent SSR
	};
};

export default CreatePostFormPage;
