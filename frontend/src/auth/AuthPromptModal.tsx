// frontend/src/components/auth/AuthPromptModal.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./AuthPromptModal.module.css";
import Login from "./Login";
import SignUp from "./SignUp";
// import { auth } from "../firebase"; // REMOVE direct import of auth
import { Auth } from "firebase/auth"; // Import Auth type
import { useAuthState } from "react-firebase-hooks/auth";

interface AuthPromptModalProps {
	onClose: () => void;
	auth: Auth; // Expect auth instance as a prop
}

const AuthPromptModal: React.FC<AuthPromptModalProps> = ({ onClose, auth }) => {
	// Receive auth as prop
	const [mode, setMode] = useState<"login" | "signup" | null>(null);
	const [isVisible, setIsVisible] = useState(false);
	// useAuthState hook now uses the passed 'auth' instance
	const [user, loadingAuth] = useAuthState(auth); // auth is from props
	const [keepModalOpenForMessage, setKeepModalOpenForMessage] = useState(false);

	// Move modalRoot creation inside component and add browser check
	const modalRoot = useMemo(() => {
		if (typeof window === "undefined") return null; // SSR check

		return (
			document.getElementById("modal-root") ||
			(() => {
				const el = document.createElement("div");
				el.id = "modal-root";
				document.body.appendChild(el);
				return el;
			})()
		);
	}, []);

	const el = useMemo(() => {
		if (typeof window === "undefined") return null; // SSR check
		return document.createElement("div");
	}, []);

	useEffect(() => {
		if (!modalRoot || !el) return; // Don't run if not in browser or elements not ready

		modalRoot.appendChild(el);
		requestAnimationFrame(() => {
			setIsVisible(true);
		});
		return () => {
			if (modalRoot.contains(el)) {
				modalRoot.removeChild(el);
			}
		};
	}, [el, modalRoot]);

	const handleClose = useCallback(() => {
		setIsVisible(false);
		setKeepModalOpenForMessage(false);
		setTimeout(() => {
			onClose();
		}, 250);
	}, [onClose]);

	useEffect(() => {
		if (!loadingAuth && user && !keepModalOpenForMessage) {
			if (mode === "login" || mode === null) {
				handleClose();
			}
		}
	}, [user, loadingAuth, mode, handleClose, keepModalOpenForMessage, auth]); // Added auth to dep array

	const handleSwitchToLogin = () => {
		setMode("login");
		setKeepModalOpenForMessage(false);
	};

	const handleSwitchToSignUp = () => {
		setMode("signup");
		setKeepModalOpenForMessage(false);
	};

	const handleSuccessfulSocialLoginInSignUp = useCallback(() => {
		setKeepModalOpenForMessage(false);
		handleClose();
	}, [handleClose]);

	const handleEmailSignUpPendingInSignUp = useCallback(() => {
		setKeepModalOpenForMessage(true);
	}, []);

	// Don't render anything during SSR
	if (typeof window === "undefined" || !el || !modalRoot) {
		return null;
	}

	const modalRenderContent = (
		<div
			className={`${styles.authModalOverlay} ${
				isVisible ? styles.fadeIn : styles.fadeOut
			}`}
		>
			<div className={styles.authModalContent}>
				<button className={styles.authCloseBtn} onClick={handleClose}>
					✕
				</button>
				{!mode ? (
					<>
						<h2>Please Log In or Sign Up</h2>
						<div className={styles.authModalButtons}>
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
