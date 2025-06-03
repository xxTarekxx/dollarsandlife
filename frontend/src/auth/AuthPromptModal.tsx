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
}

const modalRoot =
	document.getElementById("modal-root") ||
	(() => {
		const el = document.createElement("div");
		el.id = "modal-root";
		document.body.appendChild(el);
		return el;
	})();

const AuthPromptModal: React.FC<AuthPromptModalProps> = ({ onClose }) => {
	const [mode, setMode] = useState<"login" | "signup" | null>(null);
	const [isVisible, setIsVisible] = useState(false);
	const [user, loadingAuth] = useAuthState(auth);
	const [keepModalOpenForMessage, setKeepModalOpenForMessage] = useState(false);

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
		console.log("AUTHPROMPTMODAL: handleClose called.");
		setIsVisible(false);
		setKeepModalOpenForMessage(false); // Reset this flag
		setTimeout(() => {
			onClose(); // Call parent's onClose
		}, 250); // Match CSS animation for fade-out
	}, [onClose]);

	useEffect(() => {
		console.log(
			"AUTHPROMPTMODAL: useEffect check - user:",
			!!user,
			"loadingAuth:",
			loadingAuth,
			"keepModalOpenForMessage:",
			keepModalOpenForMessage,
			"mode:",
			mode,
		);

		if (!loadingAuth && user && !keepModalOpenForMessage) {
			// If user is authenticated AND we are NOT supposed to keep modal open for a message:
			if (mode === "login" || mode === null) {
				// If login was successful, or user was already logged in when modal opened in a non-signup initial state.
				console.log(
					"AUTHPROMPTMODAL: User authenticated, not keeping open for message, mode is login or null. Closing.",
				);
				handleClose();
			}
			// If mode is 'signup':
			// - Social login calls handleSuccessfulSocialLoginInSignUp -> handleClose.
			// - Email/pass sign-up sets keepModalOpenForMessage=true, so this block is skipped.
		}
	}, [user, loadingAuth, mode, handleClose, keepModalOpenForMessage]);

	const handleSwitchToLogin = () => {
		console.log("AUTHPROMPTMODAL: Switching to Login mode.");
		setMode("login");
		setKeepModalOpenForMessage(false); // Reset flag when switching mode
	};

	const handleSwitchToSignUp = () => {
		console.log("AUTHPROMPTMODAL: Switching to SignUp mode.");
		setMode("signup");
		setKeepModalOpenForMessage(false); // Reset flag when switching mode
	};

	// Called by SignUp component after a successful SOCIAL login
	const handleSuccessfulSocialLoginInSignUp = useCallback(() => {
		console.log(
			"AUTHPROMPTMODAL: Social login successful in SignUp. Resetting flag and closing modal.",
		);
		setKeepModalOpenForMessage(false);
		handleClose();
	}, [handleClose]);

	// Called by SignUp component after a successful EMAIL sign-up (verification email sent)
	const handleEmailSignUpPendingInSignUp = useCallback(() => {
		console.log(
			"AUTHPROMPTMODAL: Email sign-up pending, setting flag to keep modal open.",
		);
		setKeepModalOpenForMessage(true); // This modal will now stay open to show SignUp's message
	}, []);

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
