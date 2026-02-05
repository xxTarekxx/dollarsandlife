"use client";

import { Auth, onAuthStateChanged, signOut, User } from "firebase/auth";
import { Firestore } from "firebase/firestore";
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
							Ask a Question
						</Link>
					</div>
					<div className="forum-header-right">
						<div className="user-section">
							{authLoading ? (
								<span className="auth-loading-text">Loading user…</span>
							) : user ? (
								<div className="user-actions-area">
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
