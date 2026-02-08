// frontend/pages/forum/create-post.tsx - Adapted to be a page
"use client";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Auth, onAuthStateChanged, User } from "firebase/auth";
import { Firestore } from "firebase/firestore";
import { GetServerSideProps } from "next";
import toast from "react-hot-toast";
import { getFirebaseAuth, getFirebaseDb } from "../../src/firebase";
import ForumHeader from "../../src/components/forum/ForumHeader";
import { createForumPost } from "../../src/services/forum/forumService";
import { COUNTRY_NAMES } from "../../src/data/countries";
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
	const [country, setCountry] = useState("");
	const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
	const [countrySearch, setCountrySearch] = useState("");
	const [countryHighlightIndex, setCountryHighlightIndex] = useState(0);
	const titleRef = useRef<HTMLInputElement>(null);
	const countryWrapRef = useRef<HTMLDivElement>(null);

	const filteredCountries = useMemo(() => {
		const q = countrySearch.trim().toLowerCase();
		if (!q) return COUNTRY_NAMES;
		return COUNTRY_NAMES.filter((name) =>
			name.toLowerCase().includes(q)
		);
	}, [countrySearch]);

	const closeCountryDropdown = useCallback(() => {
		setCountryDropdownOpen(false);
		setCountrySearch("");
		setCountryHighlightIndex(0);
	}, []);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (countryWrapRef.current && !countryWrapRef.current.contains(e.target as Node)) {
				closeCountryDropdown();
			}
		}
		if (countryDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [countryDropdownOpen, closeCountryDropdown]);

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

		const missing: string[] = [];
		if (!title.trim()) missing.push("Title");
		if (!content.trim()) missing.push("Description");
		if (!country.trim()) missing.push("Country");
		if (tags.length === 0) missing.push("Tags (select at least one)");
		if (missing.length > 0) {
			toast.error(`Please fill in: ${missing.join(", ")}.`);
			return;
		}

		try {
			await createForumPost(db, {
				title,
				content,
				tags,
				country: country.trim(),
				authorId: user.uid,
				authorDisplayName: user.displayName || "Anonymous",
			});
			toast.success("✅ Post submitted successfully!");
			router.push("/forum");
			setTitle("");
			setContent("");
			setTags([]);
			setCountry("");
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
		<>
			<ForumHeader />
			<div className="forum-homepage-container">
				<div>
					<Head>
						<title>Create New Forum Post | Dollars & Life</title>
						<meta
							name='description'
							content='Ask a question or start a new discussion in the Dollars & Life community forum.'
						/>
						<meta name="robots" content="noindex, nofollow" />
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
				<label htmlFor='country-select'>
					Country <span className={styles["country-hint"]}>(Each country has its own finance rules and laws.)</span>
				</label>
				<div
					className={styles["country-dropdown-wrap"]}
					ref={countryWrapRef}
				>
					<input
						id='country-select'
						type='text'
						className={styles["country-input"]}
						placeholder='Search or select country...'
						value={countryDropdownOpen ? countrySearch : country}
						onChange={(e) => {
							setCountrySearch(e.target.value);
							setCountryDropdownOpen(true);
							setCountryHighlightIndex(0);
						}}
						onFocus={() => setCountryDropdownOpen(true)}
						onKeyDown={(e) => {
							if (!countryDropdownOpen) {
								if (e.key === "ArrowDown" || e.key === "Enter") setCountryDropdownOpen(true);
								return;
							}
							if (e.key === "ArrowDown") {
								e.preventDefault();
								setCountryHighlightIndex((i) => Math.min(i + 1, filteredCountries.length - 1));
								return;
							}
							if (e.key === "ArrowUp") {
								e.preventDefault();
								setCountryHighlightIndex((i) => Math.max(i - 1, 0));
								return;
							}
							if (e.key === "Enter") {
								e.preventDefault();
								const selected = filteredCountries[countryHighlightIndex];
								if (selected) {
									setCountry(selected);
									closeCountryDropdown();
								}
								return;
							}
							if (e.key === "Escape") {
								e.preventDefault();
								closeCountryDropdown();
							}
						}}
						disabled={!user || !db}
						autoComplete='off'
					/>
					{countryDropdownOpen && (
						<ul
							className={styles["country-dropdown-list"]}
							role='listbox'
							id='country-listbox'
							aria-label='Countries'
						>
							{filteredCountries.length === 0 ? (
								<li className={styles["country-dropdown-empty"]}>No countries match</li>
							) : (
								filteredCountries.map((name, idx) => (
									<li
										key={name}
										role='option'
										aria-selected={country === name}
										className={`${styles["country-dropdown-item"]} ${idx === countryHighlightIndex ? styles["highlighted"] : ""}`}
										onClick={() => {
											setCountry(name);
											closeCountryDropdown();
										}}
										onMouseEnter={() => setCountryHighlightIndex(idx)}
									>
										{name}
									</li>
								))
							)}
						</ul>
					)}
				</div>
				<label>Choose Tags (select at least one, up to 3)</label>
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
					disabled={!user || !db}
				>
					Submit Post
				</button>
				</form>
				</div>
			</div>
		</>
	);
};

// Prevent server-side rendering since this page requires Firebase auth
export const getServerSideProps: GetServerSideProps = async () => {
	return {
		props: {}, // Return empty props to prevent SSR
	};
};

export default CreatePostFormPage;
