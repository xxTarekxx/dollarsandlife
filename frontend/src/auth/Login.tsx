// In frontend/src/auth/Login.tsx
import React, { useState, FormEvent } from "react";
import { Link } from "react-router-dom"; // Added for internal navigation
import "./Login.css";
import GmailIcon from "../assets/icons/gmail-icon.svg"; // Assuming you want social logins here too
import MicrosoftIcon from "../assets/icons/microsoft-icon.svg";

const Login: React.FC = () => {
	const [email, setEmail] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [successMessage, setSuccessMessage] = useState<string>(""); // Optional for messages like "Password reset email sent"

	const handleEmailPasswordSubmit = async (
		event: FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		setError("");
		setSuccessMessage("");
		setLoading(true);
		console.log("Attempting Email/Pass Log In:", { email, password });
		// --- SUPABASE LOGIN LOGIC WILL GO HERE ---
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setLoading(false);
	};

	const handleGoogleSignIn = async () => {
		setError("");
		setSuccessMessage("");
		setLoading(true);
		console.log("Attempting Google Sign In");
		// --- SUPABASE GOOGLE SIGN-IN LOGIC WILL GO HERE ---
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setLoading(false);
	};

	const handleMicrosoftSignIn = async () => {
		setError("");
		setSuccessMessage("");
		setLoading(true);
		console.log("Attempting Microsoft Sign In");
		// --- SUPABASE MICROSOFT SIGN-IN LOGIC WILL GO HERE ---
		await new Promise((resolve) => setTimeout(resolve, 1500));
		setLoading(false);
	};

	return (
		<div className='login-container'>
			<form onSubmit={handleEmailPasswordSubmit} className='login-form'>
				<h2>Forum Log In</h2>
				{successMessage && <p className='success-message'>{successMessage}</p>}
				{error && <p className='error-message'>{error}</p>}
				<div className='form-group'>
					<label htmlFor='login-email'>Email:</label>
					<input
						type='email'
						id='login-email'
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						disabled={loading}
					/>
				</div>
				<div className='form-group'>
					<label htmlFor='login-password'>Password:</label>
					<input
						type='password'
						id='login-password'
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
						disabled={loading}
					/>
				</div>
				<button type='submit' className='submit-button' disabled={loading}>
					{loading ? "Logging In..." : "Log In"}
				</button>

				<div className='social-login-divider'>OR</div>
				<div className='social-login-buttons'>
					<button
						type='button'
						onClick={handleGoogleSignIn}
						className='social-button google-button'
						disabled={loading}
					>
						<img src={GmailIcon} alt='Log in with Google' />
					</button>
					<button
						type='button'
						onClick={handleMicrosoftSignIn}
						className='social-button microsoft-button'
						disabled={loading}
					>
						<img src={MicrosoftIcon} alt='Log in with Microsoft' />
					</button>
				</div>

				<div className='auth-links'>
					<Link to='/forgot-password'>Forgot Password?</Link>
					<span> | </span>
					<Link to='/signup'>Don't have an account? Sign Up</Link>
				</div>
			</form>
		</div>
	);
};
export default Login;
