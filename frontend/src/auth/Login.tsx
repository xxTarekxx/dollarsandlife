// frontend/src/components/auth/Login.tsx
import React, { useState, FormEvent, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
	Auth, // Import Auth type
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	OAuthProvider,
	onAuthStateChanged,
} from "firebase/auth";
// import { auth } from "../firebase"; // REMOVE direct import
import { getFirebaseAuth } from "../firebase"; // Import the getter
import "./Login.css";
import GmailIcon from "../assets/images/gmail-icon.svg";
import MicrosoftIcon from "../assets/images/microsoft-icon.svg";

interface LoginProps {
	onSwitchToSignUp?: () => void;
	auth?: Auth; // Auth prop is optional; will be provided by AuthPromptModal
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignUp, auth: propAuth }) => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const navigate = useNavigate();
	const location = useLocation();

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
			if (user && location.pathname === "/login") {
				console.log(
					"User already logged in on /login page, redirecting to /forum",
				);
				navigate("/forum", { replace: true });
			}
		});
		return () => unsubscribe();
	}, [navigate, location.pathname, currentAuth]);

	const handleLoginSuccess = () => {
		console.log("Login successful, preparing to navigate.");
		const from =
			(location.state as { from?: { pathname?: string } })?.from?.pathname ||
			"/forum";
		navigate(from, { replace: true });
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
			if (location.pathname === "/login") {
				handleLoginSuccess();
			}
		} catch (err: any) {
			console.error("Firebase Login Error:", err.code, err.message);
			let errorMessage = "Failed to log in. Please check your credentials.";
			// ... (error handling as before)
			if (
				err.code === "auth/user-not-found" ||
				err.code === "auth/invalid-credential" ||
				err.code === "auth/wrong-password"
			) {
				errorMessage = "Invalid email or password. Please try again.";
			} else if (err.code === "auth/invalid-email") {
				errorMessage = "The email address is not valid.";
			} else if (err.code === "auth/too-many-requests") {
				errorMessage =
					"Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.";
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
			if (location.pathname === "/login") {
				handleLoginSuccess();
			}
		} catch (err: any) {
			// ... (error handling as before)
			console.error("Firebase Google Sign-In Error:", err.code, err.message);
			let errorMessage = "Failed to sign in with Google.";
			if (err.code === "auth/popup-closed-by-user") {
				errorMessage = "Sign-in popup was closed. Please try again.";
			} else if (err.code === "auth/account-exists-with-different-credential") {
				errorMessage =
					"An account with this email already exists using a different sign-in method.";
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
			if (location.pathname === "/login") {
				handleLoginSuccess();
			}
		} catch (err: any) {
			// ... (error handling as before)
			console.error("Firebase Microsoft Sign-In Error:", err.code, err.message);
			let errorMessage = "Failed to sign in with Microsoft.";
			if (err.code === "auth/popup-closed-by-user") {
				errorMessage = "Sign-in popup was closed. Please try again.";
			} else if (err.code === "auth/account-exists-with-different-credential") {
				errorMessage =
					"An account with this email already exists using a different sign-in method.";
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
			navigate("/signup");
		}
	};

	if (!currentAuth && !authInitializedFromGetter && !propAuth) {
		// Show minimal UI or loader if auth is being fetched for standalone page
		return (
			<div className='login-content-wrapper auth-form-styles'>
				<p>Loading login...</p>
			</div>
		);
	}

	return (
		<div className='login-content-wrapper auth-form-styles'>
			<form onSubmit={handleEmailPasswordSubmit} className='login-form'>
				<h3>Log In</h3>
				{error && <p className='error-message'>{error}</p>}
				{/* ... rest of the form ... */}
				<div className='form-group'>
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
				<div className='form-group'>
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
					className='submit-button primary-auth-button'
					disabled={loading || !currentAuth}
				>
					{loading ? "Logging In..." : "Log In"}
				</button>

				<div className='social-login-divider'>OR</div>
				<div>Log In Using</div>
				<div className='social-login-buttons'>
					<button
						type='button'
						onClick={handleGoogleSignIn}
						className='social-button google-button'
						disabled={loading || !currentAuth}
					>
						<img src={GmailIcon} alt='Google icon' />
						<span></span>
					</button>
					<button
						type='button'
						onClick={handleMicrosoftSignIn}
						className='social-button microsoft-button'
						disabled={loading || !currentAuth}
					>
						<img src={MicrosoftIcon} alt='Microsoft icon' />
					</button>
				</div>

				<div className='auth-links'>
					<RouterLink to='/forgot-password'>Forgot Password?</RouterLink>
					<span> | </span>
					<a
						href='#'
						onClick={handleSwitchToSignUpClick}
						className='auth-switch-link'
					>
						Don't have an account? Sign Up
					</a>
				</div>
			</form>
		</div>
	);
};

export default Login;
