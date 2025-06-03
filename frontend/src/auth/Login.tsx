// frontend/src/components/auth/Login.tsx (or your actual path)
import React, { useState, FormEvent, useEffect } from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
import {
	signInWithEmailAndPassword,
	GoogleAuthProvider,
	signInWithPopup,
	OAuthProvider,
	onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase"; // Adjust this path to your firebase.ts file
import "./Login.css"; // Your existing styles for Login.tsx
import GmailIcon from "../assets/icons/gmail-icon.svg"; // Adjust path if needed
import MicrosoftIcon from "../assets/icons/microsoft-icon.svg"; // Adjust path if needed

interface LoginProps {
	onSwitchToSignUp?: () => void; // For use within AuthPromptModal to switch views
}

const Login: React.FC<LoginProps> = ({ onSwitchToSignUp }) => {
	// Added opening brace
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const navigate = useNavigate();
	const location = useLocation();

	// Effect to redirect if user is already logged in and lands on the /login page
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user && location.pathname === "/login") {
				console.log(
					"User already logged in on /login page, redirecting to /forum",
				);
				navigate("/forum", { replace: true });
			}
		});
		return () => unsubscribe(); // Cleanup subscription on component unmount
	}, [navigate, location.pathname]);

	const handleLoginSuccess = () => {
		console.log("Login successful, preparing to navigate.");
		// Redirect to previous page or /forum after successful login if this is a standalone page
		const from =
			(location.state as { from?: { pathname?: string } })?.from?.pathname ||
			"/forum";
		navigate(from, { replace: true });
	};

	const handleEmailPasswordSubmit = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		setError("");
		setLoading(true);
		console.log("Attempting Firebase Email/Pass Log In:", { email, password });

		try {
			await signInWithEmailAndPassword(auth, email, password);
			// If this component is rendered as a standalone page (e.g., /login), navigate.
			// If it's in a modal, the parent component (ForumHomePage) will close the modal
			// due to auth state change, so direct navigation here might only be for the standalone page scenario.
			if (location.pathname === "/login") {
				// Only navigate if on the dedicated /login page
				handleLoginSuccess();
			}
			// If in a modal, the modal will close via parent's useEffect on auth state change.
			// setLoading(false) will be effectively handled when component unmounts or navigates.
		} catch (err: any) {
			console.error("Firebase Login Error:", err.code, err.message);
			let errorMessage = "Failed to log in. Please check your credentials.";
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
			setLoading(false); // Explicitly set loading false on error
		}
		// No finally block needed here if success leads to navigation/unmount
	};

	const handleGoogleSignIn = async () => {
		setError("");
		setLoading(true);
		const provider = new GoogleAuthProvider();
		try {
			await signInWithPopup(auth, provider);
			if (location.pathname === "/login") {
				handleLoginSuccess();
			}
			// If in modal, modal closes via parent
		} catch (err: any) {
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
		setError("");
		setLoading(true);
		const provider = new OAuthProvider("microsoft.com");
		try {
			await signInWithPopup(auth, provider);
			if (location.pathname === "/login") {
				handleLoginSuccess();
			}
			// If in modal, modal closes via parent
		} catch (err: any) {
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

	// This function is called when the "Don't have an account? Sign Up" link is clicked.
	const handleSwitchToSignUpClick = (
		e: React.MouseEvent<HTMLAnchorElement>,
	) => {
		e.preventDefault();
		if (onSwitchToSignUp) {
			// If onSwitchToSignUp prop is provided (i.e., component is used in AuthPromptModal),
			// call it to switch the modal's view to the SignUp form.
			onSwitchToSignUp();
		} else {
			// If onSwitchToSignUp is not provided (i.e., component is used as a standalone /login page),
			// navigate to the /signup page.
			navigate("/signup");
		}
	};

	return (
		// If this is a standalone page, you might want a different top-level container class
		// e.g., <div className='login-page-container'> for page-level centering etc.
		// The class 'login-container' might be more for the form itself.
		// For consistency with AuthPromptModal's content structure:
		<div className='login-content-wrapper auth-form-styles'>
			{" "}
			{/* This would be the equivalent of .auth-modal-content */}
			<form onSubmit={handleEmailPasswordSubmit} className='login-form'>
				<h3>Log In</h3>
				{error && <p className='error-message'>{error}</p>}
				<div className='form-group'>
					<label htmlFor='login-email'>Email</label>
					<input
						type='email'
						id='login-email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={loading}
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
						disabled={loading}
						placeholder='••••••••'
						autoComplete='current-password'
					/>
				</div>
				<button
					type='submit'
					className='submit-button primary-auth-button'
					disabled={loading}
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
						disabled={loading}
					>
						<img src={GmailIcon} alt='Google icon' />
						<span></span>
					</button>
					<button
						type='button'
						onClick={handleMicrosoftSignIn}
						className='social-button microsoft-button'
						disabled={loading}
					>
						<img src={MicrosoftIcon} alt='Microsoft icon' />
						{/* <span>Log in with</span> */}
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
}; // Added closing brace

export default Login;
