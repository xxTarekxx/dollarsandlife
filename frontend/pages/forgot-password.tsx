import { sendPasswordResetEmail } from "firebase/auth";
import Head from "next/head";
import Link from "next/link";
import React, { FormEvent, useEffect, useState } from "react";
import { getFirebaseAuth } from "../src/firebase";
import styles from "../src/auth/Login.module.css";

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
				<div className={styles.loginContentWrapper} style={{ padding: "40px 20px" }}>
					<p>Loading...</p>
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
			<div className={styles.loginContainer} style={{ padding: "40px 20px", minHeight: "40vh" }}>
				<div className={styles.loginContentWrapper}>
					{success ? (
						<div
							className={styles.loginForm}
							style={{ textAlign: "center", padding: "24px" }}
						>
							<h3>Check your email</h3>
							<p style={{ color: "#333", marginBottom: "16px" }}>
								If an account exists for <strong>{email}</strong>, we&apos;ve sent a link to reset your password.
							</p>
							<p style={{ color: "#666", fontSize: "13px", marginBottom: "16px" }}>
								Click the link in the email to set a new password. The link may take a few minutes to arrive and can expire after a short time.
							</p>
							<Link href="/forum" style={{ color: "#007bff", marginRight: "12px" }}>
								Back to Forum
							</Link>
							<span style={{ marginLeft: "8px" }}>
								<Link href="/forum" className={styles.submitButton} style={{ display: "inline-block", padding: "8px 16px", textDecoration: "none" }}>
									Continue
								</Link>
							</span>
						</div>
					) : (
						<form onSubmit={handleSubmit} className={styles.loginForm}>
							<h3>Forgot Password</h3>
							<p style={{ color: "#555", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>
								Enter your email and we&apos;ll send you a link to reset your password.
							</p>
							{error && <p className={styles.errorMessage}>{error}</p>}
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
								/>
							</div>
							<button
								type="submit"
								className={styles.submitButton}
								disabled={loading}
							>
								{loading ? "Sending..." : "Send reset link"}
							</button>
							<div className={styles.authLinks} style={{ marginTop: "16px" }}>
								<Link href="/forum">Back to Forum</Link>
								<span> | </span>
								<Link href="/forum">Log in</Link>
							</div>
						</form>
					)}
				</div>
			</div>
		</>
	);
};

export default ForgotPasswordPage;
