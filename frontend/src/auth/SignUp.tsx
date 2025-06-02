// frontend/src/components/auth/SignUp.tsx
import React, { useState, FormEvent, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom"; // Added useNavigate
import "./SignUp.css"; // Your SignUp CSS
import { auth } from "../firebase"; // Ensure this path is correct for firebase.ts
import {
	createUserWithEmailAndPassword,
	updateProfile,
	sendEmailVerification,
	signInWithPopup,
	GoogleAuthProvider,
	OAuthProvider,
	UserCredential,
	AuthError,
	User,
	onAuthStateChanged, // For redirecting if already logged in
} from "firebase/auth";

// Import your local SVG logos
import GmailIcon from "../assets/icons/gmail-icon.svg";
import MicrosoftIcon from "../assets/icons/microsoft-icon.svg";

// Define the props interface
interface SignUpProps {
	onSwitchToLogin?: () => void; // For use within AuthPromptModal to switch views
}

const SignUp: React.FC<SignUpProps> = ({ onSwitchToLogin }) => {
	const [displayName, setDisplayName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [successMessage, setSuccessMessage] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [passwordMessage, setPasswordMessage] = useState<string>("");
	const navigate = useNavigate(); // For standalone page navigation

	const validatePassword = (pass: string): string[] => {
		const errors: string[] = [];
		if (pass.length < 8) errors.push("At least 8 characters");
		if (!/[A-Z]/.test(pass)) errors.push("An uppercase letter");
		if (!/[a-z]/.test(pass)) errors.push("A lowercase letter");
		if (!/[0-9]/.test(pass)) errors.push("A number");
		if (!/[^A-Za-z0-9]/.test(pass)) errors.push("A special character");
		return errors;
	};

	useEffect(() => {
		if (password) {
			const validationErrors = validatePassword(password);
			if (validationErrors.length > 0) {
				setPasswordMessage(`Needs: ${validationErrors.join(", ")}.`);
			} else {
				setPasswordMessage("Password strength: Good");
			}
		} else {
			setPasswordMessage("");
		}
	}, [password]);

	// Effect to redirect if user is already logged in and lands on the /signup page
	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user && window.location.pathname === "/signup") {
				// Check current path
				console.log(
					"User already logged in on /signup page, redirecting to /forum",
				);
				navigate("/forum", { replace: true });
			}
		});
		return () => unsubscribe();
	}, [navigate]);

	const handleSuccessfulSignUpOrSocialLogin = (user: User) => {
		// Common logic after any sign-up/sign-in method
		// If this component is used as a standalone page (e.g., /signup route),
		// we might want to redirect.
		// If it's in a modal, the modal will close automatically due to auth state change
		// handled by the parent component (e.g., ForumHomePage).

		// Check if we are on the dedicated /signup page.
		if (window.location.pathname === "/signup") {
			setSuccessMessage(
				`Welcome, ${user.displayName || "User"}! Redirecting...`,
			);
			setTimeout(() => {
				navigate("/forum", { replace: true }); // Or to a profile completion page, etc.
			}, 2000); // Short delay to show success message
		} else {
			// If in a modal, just show success; parent will handle modal close.
			setSuccessMessage(`Welcome, ${user.displayName || "User"}!`);
		}
	};

	const handleEmailPasswordSubmit = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		setError("");
		setSuccessMessage("");
		// setPasswordMessage(""); // Keep password message for reference or clear it

		if (!displayName.trim()) {
			setError("Display Name cannot be empty.");
			return;
		}
		const passwordValidationErrors = validatePassword(password);
		if (passwordValidationErrors.length > 0) {
			setError(`Password issues: ${passwordValidationErrors.join(", ")}.`);
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setLoading(true);
		try {
			const userCredential: UserCredential =
				await createUserWithEmailAndPassword(auth, email, password);
			const user: User = userCredential.user;
			await updateProfile(user, { displayName: displayName.trim() });
			await sendEmailVerification(user);

			console.log(
				"User signed up via email, profile updated, verification email sent:",
				user,
			);
			setDisplayName(""); // Clear form on success
			setEmail("");
			setPassword("");
			setConfirmPassword("");
			setPasswordMessage("");
			setSuccessMessage(
				"Sign up successful! A verification email has been sent. Please check your inbox (and spam folder).",
			);
			// Firebase automatically signs in the user. The parent component (ForumHomePage)
			// using useAuthState will detect this and close the AuthPromptModal.
			// If this is a standalone page, we might navigate after a delay,
			// but Firebase's auto-login handles the auth state.
		} catch (err) {
			const authError = err as AuthError;
			console.error(
				"Error signing up via email:",
				authError.code,
				authError.message,
			);
			if (authError.code === "auth/email-already-in-use") {
				setError(
					"This email address is already in use. Try logging in instead.",
				);
			} else if (authError.code === "auth/weak-password") {
				setError("Password is too weak. Please choose a stronger password.");
			} else {
				setError(
					authError.message || "Failed to create an account. Please try again.",
				);
			}
		} finally {
			setLoading(false);
		}
	};

	const handleSocialLogin = async (
		provider: GoogleAuthProvider | OAuthProvider,
	) => {
		setError("");
		setSuccessMessage("");
		setLoading(true);
		try {
			const userCredential = await signInWithPopup(auth, provider);
			const user = userCredential.user;
			console.log("User signed in/up via social provider:", user);
			// Here, you might want to check if this is a new user (user.metadata.creationTime === user.metadata.lastSignInTime)
			// and create a corresponding user document in Firestore if needed.
			handleSuccessfulSignUpOrSocialLogin(user); // Centralized success handling
		} catch (err) {
			const authError = err as AuthError;
			console.error(
				"Error with social sign-in:",
				authError.code,
				authError.message,
			);
			if (
				authError.code === "auth/popup-closed-by-user" ||
				authError.code === "auth/cancelled-popup-request"
			) {
				setError("Sign-in process was cancelled.");
			} else if (
				authError.code === "auth/account-exists-with-different-credential"
			) {
				setError(
					"An account already exists with this email address but different sign-in credentials. Try signing in with the original method.",
				);
			} else {
				setError(authError.message || "Failed to sign in. Please try again.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = () => handleSocialLogin(new GoogleAuthProvider());
	const handleMicrosoftSignIn = () =>
		handleSocialLogin(new OAuthProvider("microsoft.com"));

	// This function is called when the "Already have an account? Log In" link is clicked.
	const handleSwitchToLoginClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		if (onSwitchToLogin) {
			// If onSwitchToLogin prop is provided (i.e., component is used in AuthPromptModal),
			// call it to switch the modal's view to the Login form.
			onSwitchToLogin();
		} else {
			// If onSwitchToLogin is not provided (i.e., component is used as a standalone /signup page),
			// navigate to the /login page.
			navigate("/login");
		}
	};

	return (
		// If used as standalone page, add a wrapper class like 'signup-page-container' for page layout
		<div className='signup-content-wrapper auth-form-styles'>
			{" "}
			{/* This is the main content box */}
			<form onSubmit={handleEmailPasswordSubmit} className='signup-form'>
				<h3>Create Your Account</h3>
				{successMessage && <p className='success-message'>{successMessage}</p>}
				{error && <p className='error-message'>{error}</p>}
				<div className='form-group'>
					<label htmlFor='signup-display-name'>Display Name</label>
					<input
						type='text'
						id='signup-display-name'
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
						required
						disabled={loading}
						autoComplete='name'
					/>
				</div>
				<div className='form-group'>
					<label htmlFor='signup-email'>Email</label>
					<input
						type='email'
						id='signup-email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={loading}
						autoComplete='email'
					/>
				</div>
				<div className='form-group'>
					<label htmlFor='signup-password'>New Password</label>
					<input
						type='password'
						id='signup-password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={loading}
						autoComplete='new-password'
					/>
					{passwordMessage && (
						<p
							className={`password-strength-message ${
								passwordMessage.includes("Good") ? "good" : "issues"
							}`}
						>
							{passwordMessage}
						</p>
					)}
				</div>
				<div className='form-group'>
					<label htmlFor='signup-confirm-password'>Confirm Password</label>
					<input
						type='password'
						id='signup-confirm-password'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						disabled={loading}
						autoComplete='new-password'
					/>
				</div>
				<button
					type='submit'
					className='submit-button primary-auth-button'
					disabled={loading}
				>
					{loading && !successMessage && !error
						? "Creating Account..."
						: "Sign Up with Email"}
				</button>
				<div className='social-login-divider'>OR</div>
				<div className='social-login-buttons'>
					<button
						type='button'
						onClick={handleGoogleSignIn}
						className='social-button google-button'
						disabled={loading}
					>
						<img src={GmailIcon} alt='Google icon' />
						<span>Sign up with Google</span>
					</button>
					<button
						type='button'
						onClick={handleMicrosoftSignIn}
						className='social-button microsoft-button'
						disabled={loading}
					>
						<img src={MicrosoftIcon} alt='Microsoft icon' />
						<span>Sign up with Microsoft</span>
					</button>
				</div>
				<div className='auth-links'>
					<a
						href='#'
						onClick={handleSwitchToLoginClick}
						className='auth-switch-link'
					>
						Already have an account? Log In
					</a>
				</div>
			</form>
		</div>
	);
};

export default SignUp;
