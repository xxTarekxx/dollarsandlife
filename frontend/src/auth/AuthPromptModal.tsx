// frontend/src/components/auth/AuthPromptModal.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import "./AuthPromptModal.css";
import SignUp from "./SignUp";
import Login from "./Login";
import { auth } from "../firebase";
import { useAuthState } from "react-firebase-hooks/auth";

interface AuthPromptModalProps {
	onClose: () => void;
	onSetEmailPending: (isPending: boolean) => void;
	// onSetEmailPending is removed if AuthPromptModal manages this state internally
	// If ForumHomePage needs to know, we can re-add it, but let's test internal management first.
}

const modalRoot =
	document.getElementById("modal-root") ||
	(() => {
		const el = document.createElement("div");
		el.id = "modal-root";
		document.body.appendChild(el);
		return el;
	})();

const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
	onClose,
	onSetEmailPending,
}) => {
	const [mode, setMode] = useState<"login" | "signup" | null>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [user, loadingAuth] = useAuthState(auth);
	const [
		isEmailVerificationMessageActive,
		setIsEmailVerificationMessageActive,
	] = useState(false); // Internal state to track if SignUp is showing its verification message

	const el = useMemo(() => document.createElement("div"), []);

	useEffect(() => {
		modalRoot.appendChild(el);
		requestAnimationFrame(() => {
			setIsVisible(true);
		});
		return () => {
			if (modalRoot.contains(el)) {
				modalRoot.removeChild(el);
			}
		};
	}, [el]);

	const handleClose = useCallback(() => {
		console.log("AUTHPROMPTMODAL: handleClose called"); // DEBUG
		setIsVisible(false);
		setTimeout(() => {
			onClose();
			setIsEmailVerificationMessageActive(false); // Reset internal pending state when modal is explicitly closed
			if (onSetEmailPending) {
				// Also inform parent when closing, to reset its state
				console.log(
					"AUTHPROMPTMODAL: handleClose - Calling PARENT's onSetEmailPending(false)",
				);
				onSetEmailPending(false);
			}
		}, 250);
	}, [onClose, onSetEmailPending]);

	useEffect(() => {
		console.log(
			"AUTHPROMPTMODAL: useEffect check - user:",
			!!user,
			"loadingAuth:",
			loadingAuth,
			"isEmailVerificationMessageActive:",
			isEmailVerificationMessageActive,
			"mode:",
			mode,
		); // DEBUG

		if (!loadingAuth && user && !isEmailVerificationMessageActive) {
			// If a user is authenticated (either from Login, or already was)
			// AND we are NOT intentionally showing the email verification message (via isEmailVerificationMessageActive)
			if (mode !== "signup") {
				// And the mode is 'login' or 'null' (initial state where user might already be logged in)
				// If mode is 'signup', we let SignUp component handle its display or trigger close via onSuccessfulSocialLogin.
				console.log(
					"AUTHPROMPTMODAL: Auto-closing: User session active, not pending verification, and mode is not 'signup'. Mode:",
					mode,
				); // DEBUG
				handleClose();
			} else {
				console.log(
					"AUTHPROMPTMODAL: User session active, not pending verification, BUT mode is 'signup'. Not closing from this effect.",
				); // DEBUG
			}
		}
	}, [user, loadingAuth, mode, handleClose, isEmailVerificationMessageActive]);

	const handleSwitchToLogin = () => {
		console.log("AUTHPROMPTMODAL: Switching to Login mode."); // DEBUG
		setMode("login");
		setIsEmailVerificationMessageActive(false); // Reset pending state
	};

	const handleSwitchToSignUp = () => {
		console.log("AUTHPROMPTMODAL: Switching to SignUp mode."); // DEBUG
		setMode("signup");
		setIsEmailVerificationMessageActive(false); // Reset pending state
	};

	// Called by SignUp component after a successful SOCIAL login
	const handleSuccessfulSocialLoginInSignUp = useCallback(() => {
		console.log(
			"AUTHPROMPTMODAL: Social login successful in SignUp, closing modal.",
		); // DEBUG
		setIsEmailVerificationMessageActive(false); // Ensure this is reset
		handleClose();
	}, [handleClose, onSetEmailPending]);

	// Called by SignUp component after a successful EMAIL sign-up (verification email sent)
	const handleEmailSignUpPendingInSignUp = useCallback(() => {
		console.log(
			"AUTHPROMPTMODAL: Email sign-up pending. Setting internal flag AND calling parent's onSetEmailPending.",
		); // DEBUG
		setIsEmailVerificationMessageActive(true); // Set its own internal flag
		if (onSetEmailPending) {
			onSetEmailPending(true); // <<< --- CRITICAL: Signal the parent (ForumHomePage)
		}
	}, [onSetEmailPending]);

	const modalRenderContent = (
		<div className={`auth-modal-overlay ${isVisible ? "fade-in" : "fade-out"}`}>
			<div className='auth-modal-content'>
				<button className='auth-close-btn' onClick={handleClose}>
					✕
				</button>
				{!mode ? (
					<>
						<h2>Please Log In or Sign Up</h2>
						<div className='auth-modal-buttons'>
							<button onClick={handleSwitchToLogin}>Log In</button>
							<button onClick={handleSwitchToSignUp}>Sign Up</button>
						</div>
					</>
				) : mode === "login" ? (
					<Login onSwitchToSignUp={handleSwitchToSignUp} />
				) : (
					// mode === "signup"
					<SignUp
						onSwitchToLogin={handleSwitchToLogin}
						onSuccessfulSocialLogin={handleSuccessfulSocialLoginInSignUp}
						onEmailSignUpPendingVerification={handleEmailSignUpPendingInSignUp}
					/>
				)}
			</div>
		</div>
	);

	return ReactDOM.createPortal(modalRenderContent, el);
};

export default AuthPromptModal;
