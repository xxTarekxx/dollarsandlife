// frontend/src/components/auth/SignUp.tsx
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";
import styles from "./SignUp.module.css";
// import { auth } from "../firebase"; // REMOVE direct import
import {
	ActionCodeSettings,
	Auth,
	AuthError,
	GoogleAuthProvider,
	OAuthProvider,
	User,
	UserCredential, // Import Auth type
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	sendEmailVerification,
	signInWithPopup,
	updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "../firebase"; // Import the getter

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
	const router = useRouter();

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
			if (user && router.pathname === "/signup") {
				console.log(
					"User already logged in on /signup page, redirecting to /forum",
				);
				router.replace("/forum");
			}
		});
		return () => unsubscribe();
	}, [router, currentAuth]);

	const handleSuccessfulSocialLoginInternal = (user: User) => {
		/* ... as before ... */
		if (onSuccessfulSocialLogin) {
			onSuccessfulSocialLogin();
		} else if (router.pathname === "/signup") {
			setSuccessMessage(
				`Welcome, ${user.displayName || "User"}! Redirecting...`,
			);
			setTimeout(() => {
				router.replace("/forum");
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
			router.push("/login");
		}
	};

	if (!currentAuth && !authInitializedFromGetter && !propAuth) {
		// Show minimal UI or loader if auth is being fetched for standalone page
		return (
			<div className={styles.signupContentWrapper}>
				<p>Loading sign up...</p>
			</div>
		);
	}

	if (isEmailSignUpSuccessDisplay) {
		// ... success display as before ...
		console.log("SIGNUP.TSX: Now rendering success display block.");
		return (
			<div className={styles.signupContentWrapper}>
				<div className={styles.signupForm}>
					<h3>Account Created</h3>
					{successMessage && (
						<p className={styles.successMessage}>{successMessage}</p>
					)}
					<div
						className={styles.authLinks}
						style={{ marginTop: "20px", textAlign: "center" }}
					>
						<p>Once verified, you will be able to log in.</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.signupContentWrapper}>
			<form onSubmit={handleEmailPasswordSubmit} className={styles.signupForm}>
				<h3>Create Your Account</h3>
				{successMessage && !isEmailSignUpSuccessDisplay && (
					<p className={styles.successMessage}>{successMessage}</p>
				)}
				{error && <p className={styles.errorMessage}>{error}</p>}
				{/* ... form fields, disable if loading OR !currentAuth ... */}
				<div className={styles.formGroup}>
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
				<div className={styles.formGroup}>
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
				<div className={styles.formGroup}>
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
							className={`${styles.passwordStrengthMessage} ${
								passwordMessage.includes("Good") ? styles.good : styles.issues
							}`}
						>
							{passwordMessage}
						</p>
					)}
				</div>
				<div className={styles.formGroup}>
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
					className={styles.submitButton}
					disabled={loading || !currentAuth}
				>
					{loading ? "Creating Account..." : "Sign Up with Email"}
				</button>

				<div className={styles.socialLoginDivider}>OR</div>
				<div className={styles.socialLoginButtons}>
					<button
						type='button'
						onClick={handleGoogleSignIn}
						className={`${styles.socialButton} ${styles.googleButton}`}
						disabled={loading || !currentAuth}
						title='Sign up with Google'
					>
						<GmailIcon />
					</button>
					<button
						type='button'
						onClick={handleMicrosoftSignIn}
						className={`${styles.socialButton} ${styles.microsoftButton}`}
						disabled={loading || !currentAuth}
						title='Sign up with Microsoft'
					>
						<MicrosoftIcon />
					</button>
				</div>
				<div className={styles.authLinks}>
					<a
						href='#'
						onClick={handleSwitchToLoginLink}
						className={styles.authSwitchLink}
					>
						Already have an account? Log In
					</a>
				</div>
			</form>
		</div>
	);
};

export default SignUp;
