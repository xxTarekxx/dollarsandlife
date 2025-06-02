// frontend/src/components/auth/AuthPromptModal.tsx
import React, { useState, useEffect, useMemo } from "react";
import ReactDOM from "react-dom";
import "./AuthPromptModal.css"; // Ensure this CSS styles .auth-modal-overlay and .auth-modal-content
import SignUp from "./SignUp"; // This component MUST define and accept 'onSwitchToLogin' prop
import Login from "./Login"; // This component MUST define and accept 'onSwitchToSignUp' prop

interface AuthPromptModalProps {
	onClose: () => void;
}

// Get the modal root element, or create it if it doesn't exist
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
	const [isVisible, setIsVisible] = useState(false); // For controlling fade-in/out CSS class

	// Memoize the portal target element to keep its reference stable
	const el = useMemo(() => document.createElement("div"), []);

	useEffect(() => {
		// Append the stable 'el' to the modalRoot when the component mounts
		modalRoot.appendChild(el);

		// Trigger fade-in animation
		// Use requestAnimationFrame to ensure the element is in the DOM and styles can be applied
		requestAnimationFrame(() => {
			setIsVisible(true);
		});

		// Cleanup function to remove 'el' from modalRoot when the component unmounts
		return () => {
			if (modalRoot.contains(el)) {
				// Check if parent still contains the child
				modalRoot.removeChild(el);
			}
		};
	}, [el]); // Dependency array with 'el' (which is memoized and stable)

	const handleClose = () => {
		setIsVisible(false); // Trigger fade-out animation class
		// Wait for CSS animation to complete before calling the parent's onClose,
		// which will typically unmount this component.
		setTimeout(() => {
			onClose();
		}, 250); // This duration MUST match your CSS animation-duration for fade-out.
	};

	// Handler to switch the modal's internal view to the Login component
	const handleSwitchToLogin = () => {
		setMode("login");
	};

	// Handler to switch the modal's internal view to the SignUp component
	const handleSwitchToSignUp = () => {
		setMode("signup");
	};

	// The JSX content that will be rendered into the portal
	const modalRenderContent = (
		<div className={`auth-modal-overlay ${isVisible ? "fade-in" : "fade-out"}`}>
			<div className='auth-modal-content'>
				{" "}
				{/* This is the main styled "box" of the modal */}
				<button className='auth-close-btn' onClick={handleClose}>
					✕
				</button>
				{!mode ? ( // Initial state: show options to Log In or Sign Up
					<>
						<h2>Please Log In or Sign Up</h2>
						<div className='auth-modal-buttons'>
							<button onClick={handleSwitchToLogin}>Log In</button>
							<button onClick={handleSwitchToSignUp}>Sign Up</button>
						</div>
					</>
				) : mode === "login" ? ( // If mode is "login", render the Login component
					<Login onSwitchToSignUp={handleSwitchToSignUp} />
				) : (
					// Otherwise (if mode is "signup"), render the SignUp component
					<SignUp onSwitchToLogin={handleSwitchToLogin} />
				)}
			</div>
		</div>
	);

	// Render the modal content into the portal target element 'el'
	return ReactDOM.createPortal(modalRenderContent, el);
};

export default AuthPromptModal;
