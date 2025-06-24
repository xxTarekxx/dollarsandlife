// frontend/src/components/auth/Login.tsx
import {
	Auth,
	GoogleAuthProvider,
	OAuthProvider,
	onAuthStateChanged, // Import Auth type
	signInWithEmailAndPassword,
	signInWithPopup,
} from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";
// import { auth } from "../firebase"; // REMOVE direct import
import { getFirebaseAuth } from "../firebase"; // Import the getter
import styles from "./Login.module.css";

// Import SVGs as React components
const GmailIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 98.38 24.76'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path
			fill='#e94235'
			d='M0,3.38v3l3.44,3.33,4.06,2.3.75-5.05-.75-4.7-2.1-1.57C3.17-.99,0,.6,0,3.38Z'
		/>
		<path
			fill='#ffba00'
			d='M25.5,2.26l-.75,4.76.75,4.99,3.68-1.82,3.82-3.8v-3c0-2.78-3.17-4.37-5.4-2.7l-2.1,1.57Z'
		/>
		<path
			fill='#2684fc'
			d='M2.25,24.76h5.25v-12.75L0,6.38v16.12c0,1.24,1.01,2.25,2.25,2.25Z'
		/>
		<path
			fill='#00ac47'
			d='M25.5,24.76h5.25c1.24,0,2.25-1.01,2.25-2.25V6.38l-7.5,5.62v12.75Z'
		/>
		<path
			fill='#c5221f'
			d='M16.5,9.01L7.5,2.26v9.75l9,6.75,9-6.75V2.26l-9,6.75Z'
		/>
	</svg>
);

const MicrosoftIcon = () => (
	<svg
		width='24'
		height='24'
		viewBox='0 0 1033.7455 220.69501'
		xmlns='http://www.w3.org/2000/svg'
	>
		<path d='m104.87 104.87h-104.87v-104.87h104.87v104.87z' fill='#f1511b' />
		<path d='m220.65 104.87h-104.87v-104.87h104.87v104.87z' fill='#80cc28' />
		<path d='m104.86 220.7h-104.86v-104.87h104.86v104.87z' fill='#00adef' />
		<path d='m220.65 220.7h-104.87v-104.87h104.87v104.87z' fill='#fbbc09' />
	</svg>
);

interface LoginProps {
	onSwitchToSignUp?: () => void;
	auth?: Auth; // Auth prop is optional; will be provided by AuthPromptModal
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
		// If auth is not provided via props (e.g., standalone /login page), initialize it.
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
					setAuthInitializedFromGetter(true); // Mark as attempted
				});
		} else if (propAuth && currentAuth !== propAuth) {
			// Prop updated
			setCurrentAuth(propAuth);
		}
	}, [propAuth, authInitializedFromGetter, currentAuth]);

	// Effect to redirect if user is already logged in
	useEffect(() => {
		if (!currentAuth) return; // Wait for auth to be available

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
		// Show minimal UI or loader if auth is being fetched for standalone page
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
				{/* ... rest of the form ... */}
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
				<div>Log In Using</div>
				<div className={styles.socialLoginButtons}>
					<button
						type='button'
						onClick={handleGoogleSignIn}
						className={`${styles.socialButton} ${styles.googleButton}`}
						disabled={loading || !currentAuth}
						title='Sign in with Google'
					>
						<GmailIcon />
					</button>
					<button
						type='button'
						onClick={handleMicrosoftSignIn}
						className={`${styles.socialButton} ${styles.microsoftButton}`}
						disabled={loading || !currentAuth}
						title='Sign in with Microsoft'
					>
						<MicrosoftIcon />
					</button>
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
