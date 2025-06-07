// frontend/src/components/auth/AuthPromptModal.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import ReactDOM from "react-dom";
import "./AuthPromptModal.css";
import SignUp from "./SignUp";
import Login from "./Login";
// import { auth } from "../firebase"; // REMOVE direct import of auth
import { Auth } from "firebase/auth"; // Import Auth type
import { useAuthState } from "react-firebase-hooks/auth";

interface AuthPromptModalProps {
	onClose: () => void;
	auth: Auth; // Expect auth instance as a prop
}

const modalRoot =
	document.getElementById("modal-root") ||
	(() => {
		const el = document.createElement("div");
		el.id = "modal-root";
		document.body.appendChild(el);
		return el;
	})();

const AuthPromptModal: React.FC<AuthPromptModalProps> = ({ onClose, auth }) => {
	// Receive auth as prop
	const [mode, setMode] = useState<"login" | "signup" | null>(null);
	const [isVisible, setIsVisible] = useState(false);
	// useAuthState hook now uses the passed 'auth' instance
	const [user, loadingAuth] = useAuthState(auth); // auth is from props
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
		setIsVisible(false);
		setKeepModalOpenForMessage(false);
		setTimeout(() => {
			onClose();
		}, 250);
	}, [onClose]);

	useEffect(() => {
		console.log(
			"AUTHPROMPTMODAL: useEffect check - user:",
			!!user,
			"loadingAuth:",
			loadingAuth,
			"auth prop provided:",
			!!auth,
			"keepModalOpenForMessage:",
			keepModalOpenForMessage,
			"mode:",
			mode,
		);

		if (!loadingAuth && user && !keepModalOpenForMessage) {
			if (mode === "login" || mode === null) {
				console.log(
					"AUTHPROMPTMODAL: User authenticated, not keeping open, mode login/null. Closing.",
				);
				handleClose();
			}
		}
	}, [user, loadingAuth, mode, handleClose, keepModalOpenForMessage, auth]); // Added auth to dep array

	const handleSwitchToLogin = () => {
		console.log("AUTHPROMPTMODAL: Switching to Login mode.");
		setMode("login");
		setKeepModalOpenForMessage(false);
	};

	const handleSwitchToSignUp = () => {
		console.log("AUTHPROMPTMODAL: Switching to SignUp mode.");
		setMode("signup");
		setKeepModalOpenForMessage(false);
	};

	const handleSuccessfulSocialLoginInSignUp = useCallback(() => {
		console.log(
			"AUTHPROMPTMODAL: Social login successful in SignUp. Closing modal.",
		);
		setKeepModalOpenForMessage(false);
		handleClose();
	}, [handleClose]);

	const handleEmailSignUpPendingInSignUp = useCallback(() => {
		console.log(
			"AUTHPROMPTMODAL: Email sign-up pending, keeping modal open for message.",
		);
		setKeepModalOpenForMessage(true);
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
					<Login onSwitchToSignUp={handleSwitchToSignUp} auth={auth} /> // Pass auth prop
				) : (
					<SignUp
						onSwitchToLogin={handleSwitchToLogin}
						onSuccessfulSocialLogin={handleSuccessfulSocialLoginInSignUp}
						onEmailSignUpPendingVerification={handleEmailSignUpPendingInSignUp}
						auth={auth} // Pass auth prop
					/>
				)}
			</div>
		</div>
	);

	return ReactDOM.createPortal(modalRenderContent, el);
};

export default AuthPromptModal;
