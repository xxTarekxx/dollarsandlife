"use client";

import { Auth, onAuthStateChanged, User } from "firebase/auth";
import {
	collection,
	Firestore,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import PostCard, { PostData } from "../../src/components/forum/PostCard";
import ForumHeader from "../../src/components/forum/ForumHeader";
import { initializeFirebaseAndGetServices } from "../../src/firebase";

const UNCATEGORIZED = "__uncategorized__";

function getPostTags(post: PostData): string[] {
	const tags = post.tags?.filter(Boolean).map((t) => String(t).toLowerCase()) ?? [];
	return tags;
}

function postMatchesFilter(post: PostData, selectedTags: Set<string>): boolean {
	if (selectedTags.size === 0) return true;
	const postTags = getPostTags(post);
	const hasNoTags = postTags.length === 0;
	if (hasNoTags) return selectedTags.has(UNCATEGORIZED);
	return postTags.some((t) => selectedTags.has(t));
}

function toMillis(ts: unknown): number {
	if (!ts) return 0;
	if (typeof ts === "object" && "seconds" in ts && typeof (ts as { seconds: number }).seconds === "number") {
		return (ts as { seconds: number; nanoseconds?: number }).seconds * 1000;
	}
	if (typeof ts === "object" && typeof (ts as { toDate?: () => Date }).toDate === "function") {
		return (ts as { toDate: () => Date }).toDate().getTime();
	}
	if (typeof ts === "number") return ts;
	const d = new Date(ts as string | number | Date);
	return isNaN(d.getTime()) ? 0 : d.getTime();
}

const MyPostsPageContent: React.FC<{
	firebaseAuth: Auth;
	firebaseDb: Firestore | null;
	user: User;
}> = ({ firebaseAuth, firebaseDb, user }) => {
	const [posts, setPosts] = useState<PostData[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
	const [filterOpen, setFilterOpen] = useState(false);
	const [pendingTags, setPendingTags] = useState<Set<string>>(new Set());
	const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
	const filterRef = useRef<HTMLDivElement>(null);

	// All tags present in user's posts (sorted), plus Uncategorized if any post has no tags
	const allTagOptions = React.useMemo(() => {
		const tagSet = new Set<string>();
		let hasUntagged = false;
		for (const post of posts) {
			const tags = getPostTags(post);
			if (tags.length === 0) hasUntagged = true;
			else tags.forEach((t) => tagSet.add(t));
		}
		const list = Array.from(tagSet).sort((a, b) => a.localeCompare(b));
		if (hasUntagged) list.unshift(UNCATEGORIZED);
		return list;
	}, [posts]);

	const filteredPosts = React.useMemo(() => {
		const list = posts.filter((p) => postMatchesFilter(p, selectedTags));
		const order = sortOrder === "newest" ? -1 : 1;
		return [...list].sort((a, b) => order * (toMillis(b.timestamp) - toMillis(a.timestamp)));
	}, [posts, selectedTags, sortOrder]);

	const openFilter = useCallback(() => {
		setPendingTags(new Set(selectedTags));
		setFilterOpen(true);
	}, [selectedTags]);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
				setFilterOpen(false);
			}
		}
		if (filterOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [filterOpen]);

	const togglePendingTag = useCallback((tag: string) => {
		setPendingTags((prev) => {
			const next = new Set(prev);
			if (next.has(tag)) next.delete(tag);
			else next.add(tag);
			return next;
		});
	}, []);

	const applyFilter = useCallback(() => {
		setSelectedTags(new Set(pendingTags));
		setFilterOpen(false);
	}, [pendingTags]);

	const clearFilter = useCallback(() => {
		setPendingTags(new Set());
	}, []);

	useEffect(() => {
		if (!firebaseDb || !user?.uid) {
			setLoading(false);
			return;
		}
		const q = query(
			collection(firebaseDb, "forumPosts"),
			where("authorId", "==", user.uid)
		);
		getDocs(q)
			.then((snapshot) => {
				const list = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				})) as PostData[];
				// Sort by timestamp descending (no composite index needed)
				list.sort((a, b) => {
					const tsA = toMillis(a.timestamp);
					const tsB = toMillis(b.timestamp);
					return tsB - tsA;
				});
				setPosts(list);
			})
			.catch(() => setPosts([]))
			.finally(() => setLoading(false));
	}, [firebaseDb, user?.uid]);

	return (
		<>
			<Head>
				<title>My Posts | Forum | Dollars &amp; Life</title>
				<meta
					name="description"
					content="View all posts you created in the Dollars & Life forum."
				/>
				<meta name="robots" content="noindex, nofollow" />
			</Head>
			<ForumHeader
				firebaseAuth={firebaseAuth}
				firebaseDb={firebaseDb}
				user={user}
				authLoading={false}
			/>
			<div className="forum-homepage-container">
				<div className="forum-content">
					<div className="forum-content-main" style={{ flex: 1 }}>
						<h1 className="forum-my-posts-title">My Posts</h1>
						{loading && (
							<p className="no-posts-message">Loading your posts…</p>
						)}
						{!loading && posts.length === 0 && (
							<p className="no-posts-message">
								You haven&apos;t created any posts yet.
							</p>
						)}
						{!loading && posts.length > 0 && (
							<>
								<div className="forum-my-posts-toolbar" ref={filterRef}>
									<div className="forum-my-posts-controls">
										<div className="forum-my-posts-filter-wrap">
											<button
												type="button"
												className="forum-my-posts-filter-trigger"
												onClick={openFilter}
												aria-expanded={filterOpen}
												aria-haspopup="true"
											>
												<svg className="forum-my-posts-filter-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
													<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
												</svg>
												<span>Filter by tag</span>
												{selectedTags.size > 0 && (
													<span className="forum-my-posts-filter-badge">
														{selectedTags.size}
													</span>
												)}
												<svg className="forum-my-posts-filter-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
													<polyline points="6 9 12 15 18 9" />
												</svg>
											</button>
											{filterOpen && (
												<div className="forum-my-posts-filter-dropdown" role="dialog" aria-label="Filter by tag">
													<div className="forum-my-posts-filter-dropdown-header">Select tags</div>
													<div className="forum-my-posts-filter-options">
														{allTagOptions.map((tagKey) => {
															const label =
																tagKey === UNCATEGORIZED
																	? "Uncategorized"
																	: tagKey.charAt(0).toUpperCase() + tagKey.slice(1);
															return (
																<label key={tagKey} className="forum-my-posts-filter-option">
																	<input
																		type="checkbox"
																		checked={pendingTags.has(tagKey)}
																		onChange={() => togglePendingTag(tagKey)}
																	/>
																	<span className="forum-my-posts-filter-option-check"></span>
																	<span className="forum-my-posts-filter-option-label">{label}</span>
																</label>
															);
														})}
													</div>
													<div className="forum-my-posts-filter-actions">
														<button
															type="button"
															className="forum-my-posts-filter-clear"
															onClick={clearFilter}
														>
															Clear
														</button>
														<button
															type="button"
															className="forum-my-posts-filter-apply"
															onClick={applyFilter}
														>
															Apply
														</button>
													</div>
												</div>
											)}
										</div>
										<div className="forum-my-posts-sort-wrap">
											<label htmlFor="forum-my-posts-sort" className="forum-my-posts-sort-label">Sort by date</label>
											<select
												id="forum-my-posts-sort"
												className="forum-my-posts-sort-select"
												value={sortOrder}
												onChange={(e) => setSortOrder(e.target.value as "newest" | "oldest")}
											>
												<option value="newest">Newest first</option>
												<option value="oldest">Oldest first</option>
											</select>
										</div>
									</div>
									{selectedTags.size > 0 && (
										<p className="forum-my-posts-filter-summary">
											Showing {filteredPosts.length} of {posts.length} posts
										</p>
									)}
								</div>
								<div className="post-list">
									{filteredPosts.map((post) => (
										<PostCard
											key={post.id}
											post={post}
											auth={firebaseAuth}
											db={firebaseDb}
										/>
									))}
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</>
	);
};

const MyPostsPage: React.FC = () => {
	const router = useRouter();
	const [auth, setAuth] = useState<Auth | null>(null);
	const [db, setDb] = useState<Firestore | null>(null);
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		initializeFirebaseAndGetServices()
			.then(({ auth: a, db: d }) => {
				setAuth(a);
				setDb(d);
			})
			.catch(() => setLoading(false));
	}, []);

	useEffect(() => {
		if (!auth) return;
		const unsubscribe = onAuthStateChanged(auth, (u) => {
			setUser(u);
			setLoading(false);
		});
		return () => unsubscribe();
	}, [auth]);

	useEffect(() => {
		if (!loading && !user) {
			router.replace("/forum");
		}
	}, [loading, user, router]);

	if (loading || !auth) {
		return (
			<div className="page-loading-indicator">
				Loading…
			</div>
		);
	}

	if (!user) {
		return null;
	}

	return (
		<MyPostsPageContent
			firebaseAuth={auth}
			firebaseDb={db}
			user={user}
		/>
	);
};

export default MyPostsPage;
