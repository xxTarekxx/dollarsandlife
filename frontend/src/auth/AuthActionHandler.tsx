// frontend/src/auth/AuthActionHandler.tsx
import {
	applyActionCode,
	Auth,
	checkActionCode,
	isSignInWithEmailLink,
	signInWithEmailLink,
	User, // Import User type if needed for currentUser checks
} from "firebase/auth";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getFirebaseAuth } from "../firebase"; // Assuming firebase.ts is in src/firebase.ts

const AuthActionHandler: React.FC = () => {
	const router = useRouter();
	const [message, setMessage] = useState<string>("Processing...");
	const [error, setError] = useState<string>("");
	const [currentAuth, setCurrentAuth] = useState<Auth | null>(null);
	const [authInitialized, setAuthInitialized] = useState(false);

	useEffect(() => {
		getFirebaseAuth()
			.then((initializedAuth: Auth) => {
				// Explicitly type initializedAuth
				setCurrentAuth(initializedAuth);
				setAuthInitialized(true);
				console.log("AuthActionHandler: Firebase Auth initialized.");
			})
			.catch((err) => {
				console.error(
					"AuthActionHandler: Failed to initialize Firebase Auth:",
					err,
				);
				setError(
					"Authentication service failed to load. Please try again later.",
				);
				setAuthInitialized(true); // Mark as attempted
			});
	}, []);

	useEffect(() => {
		if (!authInitialized || !currentAuth) {
			if (authInitialized && !currentAuth && !error) {
				setError("Authentication service could not be loaded.");
			}
			return;
		}

		const mode = router.query.mode as string;
		const actionCode = router.query.oobCode as string;

		if (!actionCode || !mode) {
			setError("Invalid action link. Missing code or mode.");
			setMessage("");
			return;
		}

		const handleAction = async () => {
			try {
				let userFromAction: User | null = null; // To store user if action results in login

				switch (mode) {
					case "resetPassword":
						await checkActionCode(currentAuth, actionCode);
						setMessage(
							"Password reset link is valid. Please enter your new password.",
						);
						router.push(`/new-password?oobCode=${actionCode}`); // Ensure you have a /new-password route
						break;
					case "recoverEmail":
						// Implement email recovery logic: This usually involves verifyPasswordResetCode then updateEmail
						setError(
							"Email recovery mode not yet fully implemented. Please contact support.",
						);
						break;
					case "verifyEmail":
						await applyActionCode(currentAuth, actionCode);
						setMessage(
							"Your email has been verified successfully! You can now log in.",
						);
						toast.success("Email verified! Please log in.");
						// Note: applyActionCode for verifyEmail does not sign the user in.
						// It just marks their email as verified.
						// Redirect immediately to clean URL
						setTimeout(() => {
							router.replace("/forum");
						}, 1500);
						break;
					case "signIn":
						if (isSignInWithEmailLink(currentAuth, window.location.href)) {
							let email = window.localStorage.getItem("emailForSignIn");
							if (!email) {
								email = window.prompt(
									"Please provide your email for confirmation",
								);
							}
							if (email) {
								const userCredential = await signInWithEmailLink(
									currentAuth,
									email,
									window.location.href,
								);
								userFromAction = userCredential.user; // Get user from sign-in
								window.localStorage.removeItem("emailForSignIn");
								setMessage(
									`Successfully signed in as ${
										userFromAction?.displayName || userFromAction?.email
									}!`,
								);
								toast.success("Successfully signed in!");
								// Redirect immediately to clean URL
								setTimeout(() => {
									router.replace("/forum");
								}, 1500);
							} else {
								setError("Email not provided or link expired.");
								setMessage("");
							}
						} else {
							setError("Invalid sign-in link.");
							setMessage("");
						}
						break;
					default:
						setError("Invalid action mode.");
						setMessage("");
				}
			} catch (err: unknown) {
				console.error("Error handling action code:", err);
				let specificError =
					"Failed to process the request. The link may be invalid or expired.";

				if (typeof err === "object" && err !== null && "code" in err) {
					const errorCode = (err as { code: string }).code;
					const errorMessage = (err as { message?: string }).message;

					specificError = errorMessage || specificError;

					if (errorCode === "auth/invalid-action-code") {
						specificError =
							"Invalid or expired link. Please request a new one.";
					} else if (errorCode === "auth/user-disabled") {
						specificError = "This account has been disabled.";
					} else if (errorCode === "auth/user-not-found" && mode === "signIn") {
						specificError = "No account found for this email. Please sign up.";
					}
				}

				setError(specificError);
				toast.error(specificError);
				setMessage("");
			}
		};

		handleAction();
	}, [router.query, router, currentAuth, authInitialized, error]);

	if (!authInitialized && !error) {
		return (
			<div style={{ padding: "20px", textAlign: "center" }}>
				<p>Initializing authentication service...</p>
			</div>
		);
	}

	return (
		<div
			style={{
				padding: "40px",
				textAlign: "center",
				maxWidth: "600px",
				margin: "50px auto",
				background: "#fff",
				borderRadius: "8px",
				boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
			}}
		>
			<h2>Authentication Action</h2>
			{message && !error && <p style={{ color: "green" }}>{message}</p>}
			{error && <p style={{ color: "red" }}>Error: {error}</p>}
			{!message && !error && authInitialized && (
				<p>Processing your request...</p>
			)}
			<button
				onClick={() => router.push("/forum")}
				style={{ marginTop: "20px", padding: "10px 20px" }}
			>
				Go to Forum
			</button>
		</div>
	);
};

export default AuthActionHandler;
