// frontend/src/components/auth/Login.tsx
import {
	Auth,
	GoogleAuthProvider,
	OAuthProvider,
	FacebookAuthProvider, // Added FacebookAuthProvider
	onAuthStateChanged,
	signInWithEmailAndPassword,
	signInWithPopup,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";
import { getFirebaseAuth } from "../firebase";
import styles from "./Login.module.css";
import googleLogo from "../assets/images/google-logo.png";
import facebookLogo from "../assets/facebook-logo.svg"; // Changed to SVG

const GmailIcon = () => <img src={googleLogo.src} alt='Google logo' style={{ width: '24px', height: '24px', marginRight: '10px' }} />; // Added style for consistency

const FacebookIcon = () => (
	<img src={facebookLogo.src} alt='Facebook logo' style={{ width: '24px', height: '24px', marginRight: '10px' }} /> // Using SVG and consistent styling
);

// const MicrosoftButtonContent = () => (
// 	<img src={microsoftLogo.src} alt='Microsoft logo' />
// ); // Removed MicrosoftButtonContent

interface LoginProps {
	onSwitchToSignUp?: () => void;
	auth?: Auth;
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignUp, auth: propAuth }) => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const router = useRouter();

	const [currentAuth, setCurrentAuth] = useState<Auth | null>(propAuth || null);
	const [authInitializedFromGetter, setAuthInitializedFromGetter] = useState(
		!!propAuth,
	);

	useEffect(() => {
		if (!propAuth && !authInitializedFromGetter) {
			console.log(
				"Login.tsx: Auth not provided via prop, attempting to get/initialize.",
			);
			getFirebaseAuth()
				.then((initializedAuth) => {
					console.log(
						"Login.tsx: Auth initialized/retrieved via getFirebaseAuth.",
					);
					setCurrentAuth(initializedAuth);
					setAuthInitializedFromGetter(true);
				})
				.catch((err) => {
					console.error("Login.tsx: Failed to initialize Firebase Auth:", err);
					setError(
						"Authentication service failed to load. Please try again later.",
					);
					setAuthInitializedFromGetter(true);
				});
		} else if (propAuth && currentAuth !== propAuth) {
			setCurrentAuth(propAuth);
		}
	}, [propAuth, authInitializedFromGetter, currentAuth]);

	useEffect(() => {
		if (!currentAuth) return;

		const unsubscribe = onAuthStateChanged(currentAuth, (user) => {
			if (user && router.pathname === "/login") {
				console.log(
					"User already logged in on /login page, redirecting to /forum",
				);
				router.replace("/forum");
			}
		});
		return () => unsubscribe();
	}, [router, currentAuth]);

	const handleLoginSuccess = () => {
		console.log("Login successful, preparing to navigate.");
		const from = (router.query.from as string) || "/forum";
		router.replace(from);
	};

	const handleEmailPasswordSubmit = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		if (!currentAuth) {
			setError("Authentication service is not ready. Please try again.");
			return;
		}
		setError("");
		setLoading(true);
		console.log("Attempting Firebase Email/Pass Log In:", { email, password });
		try {
			await signInWithEmailAndPassword(currentAuth, email, password);
			if (router.pathname === "/login") {
				handleLoginSuccess();
			}
		} catch (err: unknown) {
			let errorMessage = "Failed to log in. Please check your credentials.";
			if (typeof err === "object" && err && "code" in err) {
				const code = (err as { code?: string }).code;
				if (
					code === "auth/user-not-found" ||
					code === "auth/invalid-credential" ||
					code === "auth/wrong-password"
				) {
					errorMessage = "Invalid email or password. Please try again.";
				} else if (code === "auth/invalid-email") {
					errorMessage = "The email address is not valid.";
				} else if (code === "auth/too-many-requests") {
					errorMessage =
						"Access to this account has been temporarily disabled. Please reset your password or try again later.";
				}
			}
			setError(errorMessage);
			setLoading(false);
		}
	};

	const handleGoogleSignIn = async () => {
		if (!currentAuth) {
			setError("Authentication service is not ready. Please try again.");
			return;
		}
		setError("");
		setLoading(true);
		const provider = new GoogleAuthProvider();
		try {
			await signInWithPopup(currentAuth, provider);
			if (router.pathname === "/login") {
				handleLoginSuccess();
			}
		} catch (err: unknown) {
			let errorMessage = "Failed to sign in with Google.";
			if (typeof err === "object" && err && "code" in err) {
				const code = (err as { code?: string }).code;
				if (code === "auth/popup-closed-by-user") {
					errorMessage = "Sign-in popup was closed. Please try again.";
				} else if (code === "auth/account-exists-with-different-credential") {
					errorMessage =
						"An account with this email already exists with a different sign-in method.";
				}
			}
			setError(errorMessage);
			setLoading(false);
		}
	};

	const handleMicrosoftSignIn = async () => {
		if (!currentAuth) {
			setError("Authentication service is not ready. Please try again.");
			return;
		}
		setError("");
		setLoading(true);
		const provider = new OAuthProvider("microsoft.com");
		try {
			await signInWithPopup(currentAuth, provider);
			if (router.pathname === "/login") {
				handleLoginSuccess();
			}
		} catch (err: unknown) {
			let errorMessage = "Failed to sign in with Microsoft.";
			if (typeof err === "object" && err && "code" in err) {
				const code = (err as { code?: string }).code;
				if (code === "auth/popup-closed-by-user") {
					errorMessage = "Sign-in popup was closed. Please try again.";
				} else if (code === "auth/account-exists-with-different-credential") {
					errorMessage =
						"An account with this email already exists with a different sign-in method.";
				}
			}
			setError(errorMessage);
			setLoading(false);
		}
	};

	const handleSwitchToSignUpClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
	) => {
		e.preventDefault();
		if (onSwitchToSignUp) {
			onSwitchToSignUp();
		} else {
			router.push("/signup");
		}
	};

	if (!currentAuth && !authInitializedFromGetter && !propAuth) {
		return (
			<div className={styles.loginContentWrapper}>
				<p>Loading login...</p>
			</div>
		);
	}

	return (
		<div className={styles.loginContentWrapper}>
			<form onSubmit={handleEmailPasswordSubmit} className={styles.loginForm}>
				<h3>Log In</h3>
				{error && <p className={styles.errorMessage}>{error}</p>}
				<div className={styles.formGroup}>
					<label htmlFor='login-email'>Email</label>
					<input
						type='email'
						id='login-email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={loading || !currentAuth}
						placeholder='you@example.com'
						autoComplete='email'
					/>
				</div>
				<div className={styles.formGroup}>
					<label htmlFor='login-password'>Password</label>
					<input
						type='password'
						id='login-password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={loading || !currentAuth}
						placeholder='••••••••'
						autoComplete='current-password'
					/>
				</div>
				<button
					type='submit'
					className={styles.submitButton}
					disabled={loading || !currentAuth}
				>
					{loading ? "Logging In..." : "Log In"}
				</button>

				<div className={styles.socialLoginDivider}>OR</div>
				<p> Log In With</p>
				<div className={styles.socialLoginButtons}>
					<button
						type='button'
						onClick={handleGoogleSignIn}
						className={`${styles.socialButton} ${styles.googleButton}`}
						disabled={loading || !currentAuth}
					>
						<GmailIcon />
						<span className={styles.socialText}>Gmail</span>
					</button>
					<button
						type='button'
						onClick={handleFacebookSignIn} // Changed to handleFacebookSignIn
						className={`${styles.socialButton} ${styles.facebookButton}`} // Added facebookButton class for styling (optional)
						disabled={loading || !currentAuth}
					>
						<FacebookIcon />
						<span className={styles.socialText}>Facebook</span>
					</button>
					{/* <button
						type='button'
						onClick={handleMicrosoftSignIn} // Removed Microsoft Button
						className={`${styles.socialButton} ${styles.microsoftButton}`}
						disabled={loading || !currentAuth}
					>
						<MicrosoftButtonContent />
						<span className={styles.socialText}>Microsoft</span>
					</button> */}
				</div>

				<div className={styles.authLinks}>
					<Link href='/forgot-password'>Forgot Password?</Link>
					<span> | </span>
					<a
						href='#'
						onClick={handleSwitchToSignUpClick}
						className={styles.authSwitchLink}
					>
						Don't have an account? Sign Up
					</a>
				</div>
			</form>
		</div>
	);
};

export default Login;
