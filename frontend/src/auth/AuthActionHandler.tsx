// frontend/src/pages/auth/AuthActionHandler.tsx (or a similar path)
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { auth } from "../firebase"; // Adjust path
import {
	applyActionCode,
	checkActionCode,
	signInWithEmailLink,
	isSignInWithEmailLink,
} from "firebase/auth"; // Added signInWithEmailLink
import toast from "react-hot-toast";

const AuthActionHandler: React.FC = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const [message, setMessage] = useState<string>("Processing...");
	const [error, setError] = useState<string>("");

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const mode = params.get("mode");
		const actionCode = params.get("oobCode");
		const apiKey = params.get("apiKey"); // Firebase needs this
		// const continueUrl = params.get('continueUrl'); // Optional

		if (!actionCode || !mode) {
			setError("Invalid action link. Missing code or mode.");
			return;
		}

		const handleAction = async () => {
			try {
				switch (mode) {
					case "resetPassword":
						// You would typically redirect to a page to enter a new password
						// For now, just verify the code
						await checkActionCode(auth, actionCode);
						setMessage(
							"Password reset link is valid. Please enter your new password.",
						);
						// Example: navigate(`/reset-password-form?oobCode=${actionCode}`);
						navigate(`/new-password?oobCode=${actionCode}`); // Navigate to a form to set new password
						break;
					case "recoverEmail":
						// Handle email recovery
						break;
					case "verifyEmail":
						await applyActionCode(auth, actionCode);
						setMessage(
							"Your email has been verified successfully! You can now log in.",
						);
						toast.success("Email verified! Please log in.");
						// If the user is already logged in on this browser, they are fine.
						// If not, redirect them to login or home.
						// Check if user is already logged in
						if (auth.currentUser) {
							// If they are logged in and verified their email, maybe just send them to their dashboard or forum
							navigate("/forum"); // Or wherever you want them to go
						} else {
							// If they aren't logged in, prompt them to login.
							// The email is verified, but they need to authenticate the session.
							navigate("/forum"); // Send them to forum, they can login via modal
						}
						break;
					case "signIn": // For email link sign-in (passwordless)
						if (isSignInWithEmailLink(auth, window.location.href)) {
							let email = window.localStorage.getItem("emailForSignIn");
							if (!email) {
								// User opened the link on a different device. To prevent session fixation
								// attacks, ask the user to provide the email again. For example:
								email = window.prompt(
									"Please provide your email for confirmation",
								);
							}
							if (email) {
								await signInWithEmailLink(auth, email, window.location.href);
								window.localStorage.removeItem("emailForSignIn");
								setMessage("Successfully signed in!");
								toast.success("Successfully signed in!");
								navigate("/forum"); // Or user dashboard
							} else {
								setError("Email not provided or link expired.");
							}
						} else {
							setError("Invalid sign-in link.");
						}
						break;
					default:
						setError("Invalid action mode.");
				}
			} catch (err: any) {
				console.error("Error handling action code:", err);
				setError(
					err.message ||
						"Failed to process the request. The link may be invalid or expired.",
				);
				toast.error(err.message || "Invalid or expired link.");
			}
		};

		handleAction();
	}, [location, navigate]);

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
			{!message && !error && <p>Loading...</p>}
			<button
				onClick={() => navigate("/forum")}
				style={{ marginTop: "20px", padding: "10px 20px" }}
			>
				Go to Forum
			</button>
		</div>
	);
};

export default AuthActionHandler;
