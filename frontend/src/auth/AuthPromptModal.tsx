// frontend/src/components/auth/AuthPromptModal.tsx
import React, { useState } from "react";
import "./AuthPromptModal.css";
import SignUp from "./SignUp";
import Login from "./Login";

interface AuthPromptModalProps {
	onClose: () => void;
}

const AuthPromptModal: React.FC<AuthPromptModalProps> = ({ onClose }) => {
	const [mode, setMode] = useState<"login" | "signup" | null>(null);

	return (
		<div className='auth-modal-overlay'>
			<div className='auth-modal-content'>
				<button className='auth-close-btn' onClick={onClose}>
					✕
				</button>
				{!mode ? (
					<>
						<h2>Please Log In or Sign Up</h2>
						<div className='auth-modal-buttons'>
							<button onClick={() => setMode("login")}>Log In</button>
							<button onClick={() => setMode("signup")}>Sign Up</button>
						</div>
					</>
				) : mode === "login" ? (
					<Login />
				) : (
					<SignUp />
				)}
			</div>
		</div>
	);
};

export default AuthPromptModal;
