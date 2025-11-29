import React, { useState, KeyboardEvent, FormEvent, useEffect, useRef } from "react";
import styles from "./SubscribePopup.module.css";

interface SubscribePopupProps {
	message: string;
	segment: "extra-income" | "shopping-deals" | "breaking-news";
	onClose: () => void;
	onSubmit?: (email: string) => Promise<void>;
}

/**
 * Reusable subscription popup component
 *
 * @example
 * ```tsx
 * import { SubscribePopup } from "@/components/subscriptions/SubscribePopup";
 *
 * const [showPopup, setShowPopup] = useState(false);
 *
 * return (
 *   <>
 *     <button onClick={() => setShowPopup(true)}>Show Popup</button>
 *     {showPopup && (
 *       <SubscribePopup
 *         message="Subscribe to get the latest deals!"
 *         segment="shopping-deals"
 *         onClose={() => setShowPopup(false)}
 *         onSubmit={async (email) => {
 *           console.log("Submitting:", email);
 *           // Add your subscription logic here
 *         }}
 *       />
 *     )}
 *   </>
 * );
 * ```
 */
export const SubscribePopup: React.FC<SubscribePopupProps> = ({
	message,
	segment,
	onClose,
	onSubmit,
}) => {
	const [email, setEmail] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const emailInputRef = useRef<HTMLInputElement>(null);
	const popupRef = useRef<HTMLDivElement>(null);

	// Autofocus email input on mount
	useEffect(() => {
		if (emailInputRef.current) {
			emailInputRef.current.focus();
		}
	}, []);

	// Basic email validation regex
	const isValidEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!email.trim() || isSubmitting || !isValidEmail(email)) return;

		setIsSubmitting(true);
		try {
			if (onSubmit) {
				await onSubmit(email);
			}
			// Show success message for 1.5s then close
			setShowSuccess(true);
			setTimeout(() => {
				setShowSuccess(false);
				setEmail("");
				onClose();
			}, 1500);
		} catch (error) {
			console.error("Subscription error:", error);
			setIsSubmitting(false);
		}
	};

	const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			const form = e.currentTarget.form;
			if (form) {
				form.requestSubmit();
			}
		}
	};

	// Handle Escape key to close
	useEffect(() => {
		const handleEscape = (e: Event) => {
			const keyEvent = e as KeyboardEvent;
			if (keyEvent.key === "Escape" && !isSubmitting) {
				onClose();
			}
		};

		window.addEventListener("keydown", handleEscape);
		return () => {
			window.removeEventListener("keydown", handleEscape);
		};
	}, [onClose, isSubmitting]);

	return (
		<div
			ref={popupRef}
			className={styles.overlay}
			role="dialog"
			aria-modal="true"
			aria-labelledby="subscribe-title"
			onClick={(e) => {
				if (e.target === e.currentTarget && !isSubmitting) {
					onClose();
				}
			}}
		>
			<div className={styles.card}>
				{showSuccess ? (
					<div className={styles.success}>
						<p className={styles.successMessage}>You're subscribed!</p>
					</div>
				) : (
					<>
						<div className={styles.header}>
							<h2 id="subscribe-title" className={styles.title}>
								{message}
							</h2>
						</div>

						<form onSubmit={handleSubmit}>
							<div>
								<label htmlFor="subscribe-email" className={styles.srOnly}>
									Email Address
								</label>
								<input
									ref={emailInputRef}
									id="subscribe-email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									onKeyDown={handleKeyDown}
									placeholder="Enter your email"
									required
									disabled={isSubmitting}
									className={`${styles.input} ${
										email && !isValidEmail(email) ? styles.inputError : ""
									}`}
									aria-label="Email address for subscription"
									aria-required="true"
									aria-invalid={email && !isValidEmail(email) ? "true" : "false"}
								/>
								{email && !isValidEmail(email) && (
									<p className={styles.errorMessage} role="alert">
										Please enter a valid email address
									</p>
								)}
							</div>

							<div className={styles.actions}>
								<button
									type="submit"
									disabled={isSubmitting || !email.trim() || !isValidEmail(email)}
									className={styles.primaryBtn}
									aria-label="Subscribe to newsletter"
								>
									{isSubmitting ? "Subscribing..." : "Subscribe"}
								</button>

								<button
									type="button"
									onClick={onClose}
									disabled={isSubmitting}
									className={styles.secondaryBtn}
									aria-label="Close subscription popup"
								>
									No thanks
								</button>
							</div>
						</form>
					</>
				)}
			</div>
		</div>
	);
};

export default SubscribePopup;

