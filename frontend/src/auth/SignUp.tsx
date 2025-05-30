// In frontend/src/auth/SignUp.tsx
import React, { useState, FormEvent, useEffect } from "react";
import "./SignUp.css"; // Your SignUp CSS
import { auth } from "../firebase"; // Ensure this path is correct for firebase.ts
import {
	createUserWithEmailAndPassword,
	updateProfile,
	sendEmailVerification,
	signInWithPopup,
	GoogleAuthProvider,
	OAuthProvider, // For Microsoft
	UserCredential,
	AuthError,
	User,
} from "firebase/auth";

// Import your local SVG logos
import GmailIcon from "../assets/icons/gmail-icon.svg"; // Assuming gmail-icon.svg is in src/assets/icons/
import MicrosoftIcon from "../assets/icons/microsoft-icon.svg"; // Assuming microsoft-icon.svg is in src/assets/icons/

const SignUp: React.FC = () => {
	const [displayName, setDisplayName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [successMessage, setSuccessMessage] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [passwordMessage, setPasswordMessage] = useState<string>("");

	const validatePassword = (pass: string): string[] => {
		const errors: string[] = [];
		if (pass.length < 8) {
			errors.push("At least 8 characters.");
		}
		if (!/[A-Z]/.test(pass)) {
			errors.push("An uppercase letter.");
		}
		if (!/[a-z]/.test(pass)) {
			errors.push("A lowercase letter.");
		}
		if (!/[0-9]/.test(pass)) {
			errors.push("A number.");
		}
		if (!/[^A-Za-z0-9]/.test(pass)) {
			errors.push("A special character.");
		}
		return errors;
	};

	useEffect(() => {
		if (password) {
			const validationErrors = validatePassword(password);
			if (validationErrors.length > 0) {
				setPasswordMessage(`Needs: ${validationErrors.join(" ")}`);
			} else {
				setPasswordMessage("Password strength: Good");
			}
		} else {
			setPasswordMessage("");
		}
	}, [password]);

	const handleEmailPasswordSubmit = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		setError("");
		setSuccessMessage("");
		setPasswordMessage("");

		if (!displayName.trim()) {
			setError("Display Name cannot be empty.");
			return;
		}
		const passwordValidationErrors = validatePassword(password);
		if (passwordValidationErrors.length > 0) {
			setError(`Password issues: ${passwordValidationErrors.join(" ")}`);
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
			await updateProfile(user, { displayName: displayName });
			await sendEmailVerification(user);

			console.log(
				"User signed up via email, profile updated, verification email sent:",
				user,
			);
			setDisplayName("");
			setEmail("");
			setPassword("");
			setConfirmPassword("");
			setSuccessMessage(
				"Sign up successful! A verification email has been sent. Please check your inbox (and spam folder) to verify your email.",
			);
		} catch (err) {
			const authError = err as AuthError;
			if (authError.code === "auth/email-already-in-use") {
				setError("This email address is already in use.");
			} else {
				setError(authError.message);
			}
			console.error("Error signing up via email:", authError);
		} finally {
			setLoading(false);
		}
	};

	const handleSocialLogin = async (
		provider: GoogleAuthProvider | OAuthProvider,
	) => {
		setError("");
		setSuccessMessage("");
		setLoading(true); // Consider separate loading states for email vs social if needed
		try {
			const userCredential = await signInWithPopup(auth, provider);
			const user = userCredential.user;
			console.log("User signed in/up via social provider:", user);
			// TODO: Add logic here if you need to create a user profile in Firestore
			// for new social sign-ups, or check if it's their first time.
			// For example, you might check user.metadata.creationTime === user.metadata.lastSignInTime
			setSuccessMessage(
				`Welcome, ${user.displayName || "User"}! You are now signed in.`,
			);
			// You would typically redirect the user here, e.g., to a dashboard or home page.
			// Example: history.push('/dashboard');
		} catch (err) {
			const authError = err as AuthError;
			if (
				authError.code === "auth/popup-closed-by-user" ||
				authError.code === "auth/cancelled-popup-request"
			) {
				setError("Sign-in process was cancelled.");
			} else if (
				authError.code === "auth/account-exists-with-different-credential"
			) {
				setError(
					"An account already exists with the same email address but different sign-in credentials. Try signing in with the original method.",
				);
			} else {
				setError(authError.message);
			}
			console.error("Error with social sign-in:", authError);
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = () => {
		const provider = new GoogleAuthProvider();
		handleSocialLogin(provider);
	};

	const handleMicrosoftSignIn = () => {
		const provider = new OAuthProvider("microsoft.com");
		// provider.setCustomParameters({ prompt: 'select_account' }); // Optional: always prompt for account selection
		handleSocialLogin(provider);
	};

	return (
		<div className='signup-container'>
			<form onSubmit={handleEmailPasswordSubmit} className='signup-form'>
				<h2>Forum Sign Up</h2>
				{successMessage && <p className='success-message'>{successMessage}</p>}
				{error && <p className='error-message'>{error}</p>}{" "}
				{/* Moved error above form fields for general errors */}
				<div className='form-group'>
					<label htmlFor='signup-display-name'>Display Name:</label>
					<input
						type='text'
						id='signup-display-name'
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
						required
						disabled={loading}
					/>
				</div>
				<div className='form-group'>
					<label htmlFor='signup-email'>Email:</label>
					<input
						type='email'
						id='signup-email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={loading}
					/>
				</div>
				<div className='form-group'>
					<label htmlFor='signup-password'>New Password:</label>
					<input
						type='password'
						id='signup-password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={loading}
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
					<label htmlFor='signup-confirm-password'>Confirm Password:</label>
					<input
						type='password'
						id='signup-confirm-password'
						value={confirmPassword}
						onChange={(e) => setConfirmPassword(e.target.value)}
						required
						disabled={loading}
					/>
				</div>
				{/* Error message specifically for form field issues could also be placed here or above button */}
				<button type='submit' className='submit-button' disabled={loading}>
					{loading &&
					!successMessage &&
					!error.includes("Display Name") &&
					!error.includes("Password issues") &&
					!error.includes("Passwords do not match")
						? "Processing..."
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
						<img src={GmailIcon} alt='Sign up with Google' />
					</button>
					<button
						type='button'
						onClick={handleMicrosoftSignIn}
						className='social-button microsoft-button'
						disabled={loading}
					>
						<img src={MicrosoftIcon} alt='Sign up with Microsoft' />
					</button>
				</div>
			</form>
		</div>
	);
};

export default SignUp;
