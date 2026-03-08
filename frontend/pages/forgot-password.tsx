import { sendPasswordResetEmail } from "firebase/auth";
import Head from "next/head";
import Link from "next/link";
import React, { FormEvent, useEffect, useState } from "react";
import { getFirebaseAuth } from "../src/firebase";
import styles from "./forgot-password.module.css";

const ForgotPasswordPage: React.FC = () => {
	const [email, setEmail] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const [authReady, setAuthReady] = useState(false);

	useEffect(() => {
		getFirebaseAuth()
			.then(() => setAuthReady(true))
			.catch(() => {
				setError("Authentication service failed to load. Please try again later.");
				setAuthReady(true);
			});
	}, []);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!authReady) return;
		setError("");
		setLoading(true);
		try {
			const auth = await getFirebaseAuth();
			const continueUrl =
				typeof window !== "undefined"
					? `${window.location.origin}/auth/action`
					: "https://www.dollarsandlife.com/auth/action";
			await sendPasswordResetEmail(auth, email.trim(), {
				url: continueUrl,
				handleCodeInApp: true,
			});
			setSuccess(true);
		} catch (err: unknown) {
			let message = "Failed to send reset email. Please try again.";
			if (typeof err === "object" && err !== null && "code" in err) {
				const code = (err as { code: string }).code;
				if (code === "auth/user-not-found") {
					message = "No account found with this email address.";
				} else if (code === "auth/invalid-email") {
					message = "Please enter a valid email address.";
				} else if (code === "auth/too-many-requests") {
					message = "Too many attempts. Please try again later.";
				}
			}
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	if (!authReady && !error) {
		return (
			<>
				<Head>
					<title>Forgot Password | Dollars &amp; Life</title>
					<meta name="robots" content="noindex, nofollow" />
				</Head>
				<div className={styles.loadingWrap}>
					<div style={{ textAlign: "center" }}>
						<div className={styles.spinner} aria-hidden />
						<p className={styles.loadingText}>Loading…</p>
					</div>
				</div>
			</>
		);
	}

	return (
		<>
			<Head>
				<title>Forgot Password | Dollars &amp; Life</title>
				<meta name="robots" content="noindex, nofollow" />
			</Head>
			<section className={styles.wrapper} aria-labelledby="forgot-password-title">
				<div className={styles.card}>
					{success ? (
						<div className={styles.successCard}>
							<div className={styles.successIcon} aria-hidden>✓</div>
							<h1 id="forgot-password-title" className={styles.successTitle}>
								Check your email
							</h1>
							<p className={styles.successText}>
								If an account exists for <span className={styles.successEmail}>{email}</span>, we&apos;ve sent a link to reset your password.
							</p>
							<p className={styles.successHint}>
								Click the link in the email to set a new password. The link may take a few minutes to arrive and can expire after a short time.
							</p>
							<div className={styles.successActions}>
								<Link href="/forum" className={styles.primaryLink}>
									Continue to Forum
								</Link>
								<Link href="/forum" className={styles.secondaryLink}>
									Back to Forum
								</Link>
							</div>
						</div>
					) : (
						<>
							<h1 id="forgot-password-title" className={styles.title}>
								Forgot password?
							</h1>
							<p className={styles.subtitle}>
								Enter your email and we&apos;ll send you a link to reset your password.
							</p>
							<form onSubmit={handleSubmit} noValidate>
								{error && (
									<div id="forgot-error" className={styles.errorBox} role="alert">
										{error}
									</div>
								)}
								<div className={styles.formGroup}>
									<label htmlFor="forgot-email">Email</label>
									<input
										type="email"
										id="forgot-email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
										disabled={loading}
										placeholder="you@example.com"
										autoComplete="email"
										className={styles.input}
										aria-invalid={!!error}
										aria-describedby={error ? "forgot-error" : undefined}
									/>
								</div>
								<button
									type="submit"
									className={styles.submitBtn}
									disabled={loading}
									aria-busy={loading}
								>
									{loading ? "Sending…" : "Send reset link"}
								</button>
								<nav className={styles.links} aria-label="Account links">
									<Link href="/forum">Back to Forum</Link>
									<span className={styles.sep}>·</span>
									<Link href="/forum">Log in</Link>
								</nav>
							</form>
						</>
					)}
				</div>
			</section>
		</>
	);
};

export default ForgotPasswordPage;
