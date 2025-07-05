// frontend/src/components/auth/SignUp.tsx
import {
	ActionCodeSettings,
	Auth,
	AuthError,
	GoogleAuthProvider,
	OAuthProvider,
	User,
	createUserWithEmailAndPassword,
	onAuthStateChanged,
	sendEmailVerification,
	signInWithPopup,
	updateProfile,
} from "firebase/auth";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";
import { getFirebaseAuth } from "../firebase";
import styles from "./SignUp.module.css";

import googleLogo from "../assets/images/google-logo.png";
// import microsoftLogo from "../assets/images/microsoft-logo.png"; // Removed Microsoft logo

const GmailIcon = () => (
	<img
		src={googleLogo.src}
		alt='Google logo'
		style={{ width: "24px", height: "24px", marginRight: "10px" }}
	/>
); // Added style for consistency

interface SignUpProps {
	onSwitchToLogin?: () => void;
	onSuccessfulSocialLogin?: () => void;
	onEmailSignUpPendingVerification?: () => void;
	auth?: Auth;
}

const SignUp: React.FC<SignUpProps> = ({
	onSwitchToLogin,
	onSuccessfulSocialLogin,
	onEmailSignUpPendingVerification,
	auth: propAuth,
}) => {
	const [displayName, setDisplayName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState("");
	const [successMessage, setSuccessMessage] = useState("");
	const [loading, setLoading] = useState(false);
	const [isEmailSignUpSuccessDisplay, setIsEmailSignUpSuccessDisplay] =
		useState(false);
	const [passwordMessage, setPasswordMessage] = useState("");
	const [currentAuth, setCurrentAuth] = useState<Auth | null>(propAuth || null);
	const [authInitializedFromGetter, setAuthInitializedFromGetter] = useState(
		!!propAuth,
	);
	const router = useRouter();

	useEffect(() => {
		if (!propAuth && !authInitializedFromGetter) {
			getFirebaseAuth()
				.then((initializedAuth) => {
					setCurrentAuth(initializedAuth);
					setAuthInitializedFromGetter(true);
				})
				.catch((err) => {
					console.error("Auth init error:", err);
					setError("Authentication service failed to load.");
					setAuthInitializedFromGetter(true);
				});
		} else if (propAuth && currentAuth !== propAuth) {
			setCurrentAuth(propAuth);
		}
	}, [propAuth, authInitializedFromGetter, currentAuth]);

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
			setPasswordMessage(
				validationErrors.length > 0
					? `Needs: ${validationErrors.join(", ")}.`
					: "Password strength: Good",
			);
		} else {
			setPasswordMessage("");
		}
	}, [password]);

	useEffect(() => {
		if (!currentAuth) return;
		const unsubscribe = onAuthStateChanged(currentAuth, (user) => {
			if (user && router.pathname === "/signup") {
				router.replace("/forum");
			}
		});
		return () => unsubscribe();
	}, [router, currentAuth]);

	const handleSuccessfulSocialLoginInternal = (user: User) => {
		if (onSuccessfulSocialLogin) {
			onSuccessfulSocialLogin();
		} else if (router.pathname === "/signup") {
			setSuccessMessage(
				`Welcome, ${user.displayName || "User"}! Redirecting...`,
			);
			setTimeout(() => router.replace("/forum"), 2000);
		} else {
			setSuccessMessage(`Welcome, ${user.displayName || "User"}!`);
		}
	};

	const handleEmailPasswordSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!currentAuth) {
			setError("Authentication not ready.");
			return;
		}

		setError("");
		setSuccessMessage("");
		setIsEmailSignUpSuccessDisplay(false);

		if (!displayName.trim()) {
			setError("Display Name cannot be empty.");
			return;
		}
		const passwordErrors = validatePassword(password);
		if (passwordErrors.length > 0) {
			setError(`Password issues: ${passwordErrors.join(", ")}.`);
			return;
		}
		if (password !== confirmPassword) {
			setError("Passwords do not match.");
			return;
		}

		setLoading(true);
		try {
			const userCredential = await createUserWithEmailAndPassword(
				currentAuth,
				email,
				password,
			);
			const user = userCredential.user;
			await updateProfile(user, { displayName: displayName.trim() });

			const actionCodeSettings: ActionCodeSettings = {
				url: `${window.location.origin}/auth/action`,
				handleCodeInApp: true,
			};
			await sendEmailVerification(user, actionCodeSettings);

			setSuccessMessage(
				"Sign up successful! A verification email has been sent.",
			);
			setIsEmailSignUpSuccessDisplay(true);
			onEmailSignUpPendingVerification?.();
		} catch (err) {
			const authError = err as AuthError;
			if (authError.code === "auth/email-already-in-use") {
				setError("Email already in use. Try logging in.");
			} else if (authError.code === "auth/weak-password") {
				setError("Password is too weak.");
			} else {
				setError(authError.message || "Sign up failed.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleSocialLogin = async (
		provider: GoogleAuthProvider | OAuthProvider,
	) => {
		if (!currentAuth) {
			setError("Authentication not ready.");
			return;
		}
		setError("");
		setSuccessMessage("");
		setLoading(true);
		setIsEmailSignUpSuccessDisplay(false);
		try {
			const userCredential = await signInWithPopup(currentAuth, provider);
			handleSuccessfulSocialLoginInternal(userCredential.user);
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
					"An account already exists with this email but different sign-in credentials.",
				);
			} else {
				setError(authError.message || "Social login failed.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleGoogleSignIn = () => handleSocialLogin(new GoogleAuthProvider());

	const handleSwitchToLoginLink = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();
		// FIX: Replaced ternary operator with if/else to satisfy no-unused-expressions rule
		if (onSwitchToLogin) {
			onSwitchToLogin();
		} else {
			router.push("/login");
		}
	};

	if (!currentAuth && !authInitializedFromGetter && !propAuth) {
		return (
			<div className={styles.signupContentWrapper}>Loading sign up...</div>
		);
	}

	if (isEmailSignUpSuccessDisplay) {
		return (
			<div className={styles.signupContentWrapper}>
				<div className={styles.signupForm}>
					<h3>Account Created</h3>
					<p className={styles.successMessage}>{successMessage}</p>
					<p style={{ marginTop: "20px", textAlign: "center" }}>
						Once verified, you can log in.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className={styles.signupContentWrapper}>
			<form onSubmit={handleEmailPasswordSubmit} className={styles.signupForm}>
				<h3>Create Your Account</h3>
				{successMessage && (
					<p className={styles.successMessage}>{successMessage}</p>
				)}
				{error && <p className={styles.errorMessage}>{error}</p>}
				<div className={styles.formGroup}>
					<label htmlFor='signup-display-name'>Display Name</label>
					<input
						type='text'
						id='signup-display-name'
						value={displayName}
						onChange={(e) => setDisplayName(e.target.value)}
						required
						disabled={loading || !currentAuth}
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
				<div>Sign Up With</div>
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
				</div>

				<div className={styles.authLinks}>
					<a href='#' onClick={handleSwitchToLoginLink}>
						Already have an account? Log In
					</a>
				</div>
			</form>
		</div>
	);
};

export default SignUp;
