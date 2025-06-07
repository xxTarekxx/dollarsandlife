// frontend/src/components/auth/SignUp.tsx
import React, { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SignUp.css";
// import { auth } from "../firebase"; // REMOVE direct import
import { getFirebaseAuth } from "../firebase"; // Import the getter
import {
	Auth, // Import Auth type
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
import GmailIcon from "../assets/images/gmail-icon.svg";
import MicrosoftIcon from "../assets/images/microsoft-icon.svg";

interface SignUpProps {
	onSwitchToLogin?: () => void;
	onSuccessfulSocialLogin?: () => void;
	onEmailSignUpPendingVerification?: () => void;
	auth?: Auth; // Auth prop is optional
}

const SignUp: React.FC<SignUpProps> = ({
	onSwitchToLogin,
	onSuccessfulSocialLogin,
	onEmailSignUpPendingVerification,
	auth: propAuth,
}) => {
	const [displayName, setDisplayName] = useState<string>("");
	const [email, setEmail] = useState<string>("");
	// ... other state ...
	const [password, setPassword] = useState<string>("");
	const [confirmPassword, setConfirmPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [successMessage, setSuccessMessage] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [isEmailSignUpSuccessDisplay, setIsEmailSignUpSuccessDisplay] =
		useState<boolean>(false);
	const [passwordMessage, setPasswordMessage] = useState<string>("");
	const navigate = useNavigate();

	const [currentAuth, setCurrentAuth] = useState<Auth | null>(propAuth || null);
	const [authInitializedFromGetter, setAuthInitializedFromGetter] = useState(
		!!propAuth,
	);

	useEffect(() => {
		if (!propAuth && !authInitializedFromGetter) {
			console.log(
				"SignUp.tsx: Auth not provided via prop, attempting to get/initialize.",
			);
			getFirebaseAuth()
				.then((initializedAuth) => {
					console.log(
						"SignUp.tsx: Auth initialized/retrieved via getFirebaseAuth.",
					);
					setCurrentAuth(initializedAuth);
					setAuthInitializedFromGetter(true);
				})
				.catch((err) => {
					console.error("SignUp.tsx: Failed to initialize Firebase Auth:", err);
					setError(
						"Authentication service failed to load. Please try again later.",
					);
					setAuthInitializedFromGetter(true); // Mark as attempted
				});
		} else if (propAuth && currentAuth !== propAuth) {
			setCurrentAuth(propAuth);
		}
	}, [propAuth, authInitializedFromGetter, currentAuth]);

	const validatePassword = (pass: string): string[] => {
		/* ... as before ... */
		const errors: string[] = [];
		if (pass.length < 8) errors.push("At least 8 characters");
		if (!/[A-Z]/.test(pass)) errors.push("An uppercase letter");
		if (!/[a-z]/.test(pass)) errors.push("A lowercase letter");
		if (!/[0-9]/.test(pass)) errors.push("A number");
		if (!/[^A-Za-z0-9]/.test(pass)) errors.push("A special character");
		return errors;
	};

	useEffect(() => {
		/* ... password validation message effect ... */
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
		if (!currentAuth) return; // Wait for auth

		const unsubscribe = onAuthStateChanged(currentAuth, (user) => {
			if (user && window.location.pathname === "/signup") {
				console.log(
					"User already logged in on /signup page, redirecting to /forum",
				);
				navigate("/forum", { replace: true });
			}
		});
		return () => unsubscribe();
	}, [navigate, currentAuth]);

	const handleSuccessfulSocialLoginInternal = (user: User) => {
		/* ... as before ... */
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
		if (!currentAuth) {
			setError("Authentication service is not ready. Please try again.");
			return;
		}
		// ... rest of the validation logic ...
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
				await createUserWithEmailAndPassword(currentAuth, email, password); // Use currentAuth
			const user: User = userCredential.user;
			await updateProfile(user, { displayName: displayName.trim() });

			const actionCodeSettings: ActionCodeSettings = {
				url: `${window.location.origin}/auth/action`, // Ensure this page can handle it
				handleCodeInApp: true,
			};
			await sendEmailVerification(user, actionCodeSettings);

			setSuccessMessage(
				"Sign up successful! A verification email has been sent. Please check your inbox (and spam folder) to verify your account.",
			);
			setIsEmailSignUpSuccessDisplay(true);
			if (onEmailSignUpPendingVerification) {
				onEmailSignUpPendingVerification();
			}
		} catch (err) {
			// ... error handling as before ...
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
		if (!currentAuth) {
			setError("Authentication service is not ready. Please try again.");
			return;
		}
		// ... rest of the logic ...
		setError("");
		setSuccessMessage("");
		setLoading(true);
		setIsEmailSignUpSuccessDisplay(false);
		try {
			const userCredential = await signInWithPopup(currentAuth, provider); // Use currentAuth
			const user = userCredential.user;
			handleSuccessfulSocialLoginInternal(user);
		} catch (err) {
			// ... error handling as before ...
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
		if (onSwitchToLogin) {
			onSwitchToLogin();
		} else {
			navigate("/login");
		}
	};

	if (!currentAuth && !authInitializedFromGetter && !propAuth) {
		// Show minimal UI or loader if auth is being fetched for standalone page
		return (
			<div className='signup-content-wrapper auth-form-styles'>
				<p>Loading sign up...</p>
			</div>
		);
	}

	if (isEmailSignUpSuccessDisplay) {
		// ... success display as before ...
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
				{/* ... form fields, disable if loading OR !currentAuth ... */}
				<div className='form-group'>
					<label htmlFor='signup-display-name'>Display Name</label>
					<input
						type='text'
						id='signup-display-name'
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
						required
						disabled={loading || !currentAuth}
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
						disabled={loading || !currentAuth}
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
						disabled={loading || !currentAuth}
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
						disabled={loading || !currentAuth}
						autoComplete='new-password'
					/>
				</div>
				<button
					type='submit'
					className='submit-button primary-auth-button'
					disabled={loading || !currentAuth}
				>
					{loading ? "Creating Account..." : "Sign Up with Email"}
				</button>

				<div className='social-login-divider'>OR</div>
				<div className='social-login-buttons'>
					<button
						type='button'
						onClick={handleGoogleSignIn}
						className='social-button google-button'
						disabled={loading || !currentAuth}
					>
						<img src={GmailIcon} alt='Google icon' />
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
