"use client";

import { Auth, onAuthStateChanged, signOut, User } from "firebase/auth";
import {
	collection,
	doc,
	Firestore,
	getDoc,
	getDocs,
	query,
	where,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useCallback, useEffect, useState } from "react";
import AuthPromptModal from "../../auth/AuthPromptModal";
import { initializeFirebaseAndGetServices } from "../../firebase";

const DefaultProfileIcon = () => (
	<svg
		width="24"
		height="24"
		viewBox="0 0 24 24"
		fill="currentColor"
		className="default-profile-icon"
		aria-hidden
	>
		<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
	</svg>
);

interface ForumHeaderProps {
	/** When provided, use these instead of initializing Firebase (e.g. from forum index). */
	firebaseAuth?: Auth | null;
	firebaseDb?: Firestore | null;
	user?: User | null;
	authLoading?: boolean;
	/** When using internal auth, call this when modal opens so parent can blur. */
	onAuthModalChange?: (open: boolean) => void;
}

const ForumHeader: React.FC<ForumHeaderProps> = ({
	firebaseAuth: authProp,
	firebaseDb: dbProp,
	user: userProp,
	authLoading: authLoadingProp,
	onAuthModalChange,
}) => {
	const [internalAuth, setInternalAuth] = useState<Auth | null>(null);
	const [internalDb, setInternalDb] = useState<Firestore | null>(null);
	const [internalUser, setInternalUser] = useState<User | null>(null);
	const [internalAuthLoading, setInternalAuthLoading] = useState(true);
	const [showAuthModal, setShowAuthModal] = useState(false);
	const [postCount, setPostCount] = useState<number | null>(null);
	const [voteHelpful, setVoteHelpful] = useState<number | null>(null);
	const [voteNotHelpful, setVoteNotHelpful] = useState<number | null>(null);

	const router = useRouter();
	const auth = authProp ?? internalAuth;
	const db = dbProp ?? internalDb;
	const user = userProp ?? internalUser;
	const authLoading = authLoadingProp ?? internalAuthLoading;
	const isForumHomeCurrent =
		router.pathname === "/forum" || router.pathname.startsWith("/forum/post");
	const isAskQuestionCurrent = router.pathname === "/forum/create-post";

	// Initialize Firebase when not provided by parent
	useEffect(() => {
		if (authProp != null) return;
		initializeFirebaseAndGetServices()
			.then(({ auth: a, db: d }) => {
				setInternalAuth(a);
				setInternalDb(d);
			})
			.catch(() => {
				setInternalAuthLoading(false);
			});
	}, [authProp]);

	// Auth state when using internal auth
	useEffect(() => {
		if (authProp != null || !internalAuth) return;
		const unsubscribe = onAuthStateChanged(
			internalAuth,
			(u) => {
				setInternalUser(u);
				setInternalAuthLoading(false);
			},
			() => setInternalAuthLoading(false),
		);
		return () => unsubscribe();
	}, [internalAuth, authProp]);

	// Fetch post count and vote counts when user and db are available
	useEffect(() => {
		if (!db || !user?.uid) {
			setPostCount(null);
			setVoteHelpful(null);
			setVoteNotHelpful(null);
			return;
		}
		let cancelled = false;
		Promise.all([
			getDocs(
				query(
					collection(db, "forumPosts"),
					where("authorId", "==", user.uid)
				)
			).then((snap) => (cancelled ? null : snap.size)),
			getDoc(doc(db, "users", user.uid)).then((snap) => {
				if (cancelled) return null;
				const d = snap.data();
				return {
					helpful: d?.totalHelpfulVotes ?? 0,
					notHelpful: d?.totalNotHelpfulVotes ?? 0,
				};
			}),
		])
			.then(([posts, votes]) => {
				if (!cancelled) {
					setPostCount(posts ?? 0);
					if (votes && typeof votes === "object" && "helpful" in votes) {
						setVoteHelpful(votes.helpful);
						setVoteNotHelpful(votes.notHelpful);
					} else {
						setVoteHelpful(0);
						setVoteNotHelpful(0);
					}
				}
			})
			.catch(() => {
				if (!cancelled) {
					setPostCount(0);
					setVoteHelpful(0);
					setVoteNotHelpful(0);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [db, user?.uid]);

	const openAuthModal = useCallback(() => {
		setShowAuthModal(true);
		onAuthModalChange?.(true);
	}, [onAuthModalChange]);

	const closeAuthModal = useCallback(() => {
		setShowAuthModal(false);
		onAuthModalChange?.(false);
	}, [onAuthModalChange]);

	const handleLogout = async () => {
		if (!auth) return;
		try {
			await signOut(auth);
			router.push("/forum");
		} catch {
			// ignore
		}
	};

	if (!auth) {
		return (
			<div className="forum-header-wrapper">
				<header className="forum-header">
					<div className="forum-header-left">
						<span className="auth-loading-text">Loading…</span>
					</div>
					<div className="forum-header-right">
						<span className="auth-loading-text">Loading…</span>
					</div>
				</header>
			</div>
		);
	}

	return (
		<>
			<div className="forum-header-wrapper">
				<header className="forum-header">
					<div className="forum-header-left">
						<Link
							href="/forum"
							className={`forum-header-home-link ${isForumHomeCurrent ? "forum-header-link--current" : ""}`}
						>
							Forum Home
						</Link>
						<Link
							href="/forum/create-post"
							className={`create-post-button-main header-ask-question ${
								!db || authLoading || !user ? "disabled-link" : ""
							} ${isAskQuestionCurrent ? "forum-header-link--current" : ""}`}
							aria-disabled={!db || authLoading || !user}
							onClick={(e) => {
								if (!user) {
									e.preventDefault();
									openAuthModal();
								} else if (!db || authLoading) {
									e.preventDefault();
								}
							}}
						>
							Create A Post
						</Link>
					</div>
					<div className="forum-header-right">
						<div className="user-section">
							{authLoading ? (
								<span className="auth-loading-text">Loading user…</span>
							) : user ? (
								<div className="user-actions-area">
									<Link
										href="/forum/my-posts"
										className="forum-header-stat-link"
									>
										Created Posts: {postCount !== null ? postCount : "…"}
									</Link>
									<span className="forum-header-stat">
										Your Helpful Posts: {voteHelpful !== null ? voteHelpful : "…"}
									</span>
									<span className="forum-header-stat">
										Not Helpful Posts: {voteNotHelpful !== null ? voteNotHelpful : "…"}
									</span>
									<button
										type="button"
										onClick={handleLogout}
										className="logout-button header-logout-button"
									>
										Log Out
									</button>
									<div className="user-profile-info">
										{user.photoURL ? (
											<img
												src={user.photoURL}
												alt=""
												className="profile-icon"
											/>
										) : (
											<span
												className="profile-icon default-icon"
												aria-hidden
											>
												<DefaultProfileIcon />
											</span>
										)}
										<span
											className="display-name"
											title={user.displayName || undefined}
										>
											{user.displayName || "User"}
										</span>
									</div>
								</div>
							) : (
								<button
									type="button"
									onClick={openAuthModal}
									className="login-signup-button header-login-button"
									disabled={authLoading}
								>
									Login / Sign Up
								</button>
							)}
						</div>
					</div>
				</header>
			</div>
			{showAuthModal && (
				<AuthPromptModal onClose={closeAuthModal} auth={auth} />
			)}
		</>
	);
};

export default ForumHeader;
