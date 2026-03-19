import { confirmPasswordReset } from "firebase/auth";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";
import { getFirebaseAuth } from "../src/firebase";
import styles from "../src/auth/Login.module.css";

const NewPasswordPage: React.FC = () => {
	const router = useRouter();
	const oobCode = router.query.oobCode as string | undefined;
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState(false);
	const [loading, setLoading] = useState(false);
	const [authReady, setAuthReady] = useState(false);

	useEffect(() => {
		getFirebaseAuth()
			.then(() => setAuthReady(true))
			.catch(() => {
				setError("Authentication service failed to load. Please try again.");
				setAuthReady(true);
			});
	}, []);

	useEffect(() => {
		if (router.isReady && !oobCode) {
			setError("Invalid or missing reset link. Please request a new password reset.");
		}
	}, [router.isReady, oobCode]);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!authReady || !oobCode) return;
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}
		if (password.length < 6) {
			setError("Password must be at least 6 characters.");
			return;
		}
		setError("");
		setLoading(true);
		try {
			const auth = await getFirebaseAuth();
			await confirmPasswordReset(auth, oobCode, password);
			setSuccess(true);
			setTimeout(() => {
				router.replace("/forum");
			}, 2000);
		} catch (err: unknown) {
			let message = "Failed to reset password. The link may be invalid or expired.";
			if (typeof err === "object" && err !== null && "code" in err) {
				const code = (err as { code: string }).code;
				if (code === "auth/invalid-action-code" || code === "auth/expired-action-code") {
					message = "This reset link is invalid or has expired. Please request a new one.";
				} else if (code === "auth/weak-password") {
					message = "Please choose a stronger password (at least 6 characters).";
				}
			}
			setError(message);
		} finally {
			setLoading(false);
		}
	};

	const invalidLink = router.isReady && !oobCode;
	const showForm = authReady && oobCode && !success && !invalidLink;

	if (!authReady && !error) {
		return (
			<>
				<Head>
					<title>Set New Password | Dollars &amp; Life</title>
					<meta name="robots" content="noindex, nofollow" />
					<link rel="canonical" href="https://www.dollarsandlife.com/new-password" />
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
				<title>Set New Password | Dollars &amp; Life</title>
				<meta name="robots" content="noindex, nofollow" />
					<link rel="canonical" href="https://www.dollarsandlife.com/new-password" />
			</Head>
			<div className={styles.loginContainer} style={{ padding: "40px 20px", minHeight: "40vh" }}>
				<div className={styles.loginContentWrapper}>
					{success ? (
						<div
							className={styles.loginForm}
							style={{ textAlign: "center", padding: "24px" }}
						>
							<h3>Password updated</h3>
							<p style={{ color: "#333", marginBottom: "16px" }}>
								Your password has been reset. Redirecting you to the forum...
							</p>
							<Link href="/forum" className={styles.submitButton} style={{ display: "inline-block", padding: "8px 16px", textDecoration: "none" }}>
								Go to Forum
							</Link>
						</div>
					) : invalidLink ? (
						<div
							className={styles.loginForm}
							style={{ textAlign: "center", padding: "24px" }}
						>
							<h3>Invalid reset link</h3>
							<p className={styles.errorMessage} style={{ marginTop: "12px" }}>{error}</p>
							<Link href="/forgot-password" style={{ color: "#007bff", marginTop: "16px", display: "inline-block" }}>
								Request a new reset link
							</Link>
						</div>
					) : showForm ? (
						<form onSubmit={handleSubmit} className={styles.loginForm}>
							<h3>Set new password</h3>
							<p style={{ color: "#555", fontSize: "13px", marginBottom: "12px", textAlign: "center" }}>
								Enter your new password below.
							</p>
							{error && <p className={styles.errorMessage}>{error}</p>}
							<div className={styles.formGroup}>
								<label htmlFor="new-password">New password</label>
								<input
									type="password"
									id="new-password"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									required
									minLength={6}
									disabled={loading}
									placeholder="••••••••"
									autoComplete="new-password"
								/>
							</div>
							<div className={styles.formGroup}>
								<label htmlFor="confirm-password">Confirm password</label>
								<input
									type="password"
									id="confirm-password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									minLength={6}
									disabled={loading}
									placeholder="••••••••"
									autoComplete="new-password"
								/>
							</div>
							<button
								type="submit"
								className={styles.submitButton}
								disabled={loading}
							>
								{loading ? "Updating..." : "Update password"}
							</button>
							<div className={styles.authLinks} style={{ marginTop: "16px" }}>
								<Link href="/forgot-password">Request new link</Link>
								<span> | </span>
								<Link href="/forum">Back to Forum</Link>
							</div>
						</form>
					) : (
						<div className={styles.loginContentWrapper} style={{ padding: "40px 20px" }}>
							<p>Loading...</p>
						</div>
					)}
				</div>
			</div>
		</>
	);
};

export default NewPasswordPage;
