// frontend/src/components/auth/SignUp.tsx
import React, { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";
import { auth } from "../firebase";
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
	onAuthStateChanged,
	ActionCodeSettings,
} from "firebase/auth";

import GmailIcon from "../assets/icons/gmail-icon.svg";
import MicrosoftIcon from "../assets/icons/microsoft-icon.svg";

interface SignUpProps {
	onSwitchToLogin?: () => void; // Already optional
	onSuccessfulSocialLogin?: () => void; // Already optional
	onEmailSignUpPendingVerification?: () => void; // Already optional, this should be fine
}

const SignUp: React.FC<SignUpProps> = ({
	// This line correctly uses the interface
	onSwitchToLogin,
	onSuccessfulSocialLogin,
	onEmailSignUpPendingVerification,
}) => {
	const [displayName, setDisplayName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [successMessage, setSuccessMessage] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [isEmailSignUpSuccessDisplay, setIsEmailSignUpSuccessDisplay] =
		useState<boolean>(false);
	const [passwordMessage, setPasswordMessage] = useState<string>("");
	const navigate = useNavigate();

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

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (user) => {
			if (user && window.location.pathname === "/signup") {
				console.log(
					"User already logged in on /signup page, redirecting to /forum",
				);
				navigate("/forum", { replace: true });
			}
		});
		return () => unsubscribe();
	}, [navigate]);

	const handleSuccessfulSocialLoginInternal = (user: User) => {
		if (onSuccessfulSocialLogin) {
			onSuccessfulSocialLogin();
		} else if (window.location.pathname === "/signup") {
			setSuccessMessage(
				`Welcome, ${user.displayName || "User"}! Redirecting...`,
			);
			setTimeout(() => {
				navigate("/forum", { replace: true });
			}, 2000);
		} else {
			setSuccessMessage(`Welcome, ${user.displayName || "User"}!`);
		}
	};

	const handleEmailPasswordSubmit = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		setError("");
		setSuccessMessage("");
		setIsEmailSignUpSuccessDisplay(false);

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

			const actionCodeSettings: ActionCodeSettings = {
				url: `${window.location.origin}/auth/action`,
				handleCodeInApp: true,
			};
			await sendEmailVerification(user, actionCodeSettings);

			console.log(
				"User signed up via email, profile updated, verification email sent:",
				user,
			);
			console.log("SIGNUP.TSX: Setting success message and display flag.");
			setSuccessMessage(
				"Sign up successful! A verification email has been sent. Please check your inbox (and spam folder) to verify your account.",
			);
			setIsEmailSignUpSuccessDisplay(true);

			if (onEmailSignUpPendingVerification) {
				console.log("SIGNUP.TSX: Calling onEmailSignUpPendingVerification.");
				onEmailSignUpPendingVerification();
			}
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
		setIsEmailSignUpSuccessDisplay(false);
		try {
			const userCredential = await signInWithPopup(auth, provider);
			const user = userCredential.user;
			console.log("User signed in/up via social provider:", user);
			handleSuccessfulSocialLoginInternal(user);
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

	const handleSwitchToLoginLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		// This link is now primarily for when the form is visible.
		// The "Proceed to Login" link in the success message has its own direct handler.
		if (onSwitchToLogin) {
			onSwitchToLogin();
		} else {
			navigate("/login");
		}
	};
	console.log(
		"SIGNUP.TSX: Rendering. isEmailSignUpSuccessDisplay:",
		isEmailSignUpSuccessDisplay,
		"Success Message:",
		successMessage,
	);
	if (isEmailSignUpSuccessDisplay) {
		console.log("SIGNUP.TSX: Now rendering success display block.");
		return (
			<div className='signup-content-wrapper auth-form-styles'>
				<div className='signup-form'>
					<h3>Account Created</h3>
					{successMessage && (
						<p className='success-message'>{successMessage}</p>
					)}
					<div
						className='auth-links'
						style={{ marginTop: "20px", textAlign: "center" }}
					>
						<p>Once verified, you will be able to log in.</p>
						<button
							onClick={() => {
								if (onSwitchToLogin) onSwitchToLogin();
								else navigate("/login");
							}}
							className='submit-button primary-auth-button' // Re-use button style
							style={{ marginTop: "10px" }}
						>
							Proceed to Log In
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className='signup-content-wrapper auth-form-styles'>
			<form onSubmit={handleEmailPasswordSubmit} className='signup-form'>
				<h3>Create Your Account</h3>
				{successMessage && !isEmailSignUpSuccessDisplay && (
					<p className='success-message'>{successMessage}</p>
				)}
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
					{loading ? "Creating Account..." : "Sign Up with Email"}
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
						onClick={handleSwitchToLoginLink}
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
