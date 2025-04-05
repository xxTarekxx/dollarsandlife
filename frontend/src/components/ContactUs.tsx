import React, { useState, useEffect, useRef, Suspense } from "react";
// REMOVED: import emailjs from "emailjs-com";
import "./ContactUs.css";

// ReCAPTCHA is already correctly lazy-loaded
const LazyReCAPTCHA = React.lazy(() => import("react-google-recaptcha"));

interface FormData {
	firstName: string;
	lastName: string;
	email: string;
	message: string;
}

const ContactUs: React.FC = () => {
	const serviceId = process.env.REACT_APP_EMAILJS_SERVICE_ID;
	const templateId = process.env.REACT_APP_EMAILJS_TEMPLATE_ID;
	const userId = process.env.REACT_APP_EMAILJS_USER_ID;
	const recaptchaSiteKey = process.env.REACT_APP_RECAPTCHA_SITE_KEY;

	const [formData, setFormData] = useState<FormData>({
		firstName: "",
		lastName: "",
		email: "",
		message: "",
	});
	const [formStatus, setFormStatus] = useState("");
	const [captchaError, setCaptchaError] = useState("");
	const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const recaptchaRef = useRef<any>(null);

	// This useEffect handles loading the reCAPTCHA script itself, separate from the component import
	useEffect(() => {
		if (!recaptchaSiteKey) {
			console.error("reCAPTCHA site key not configured");
			return;
		}

		// Check if the script already exists to avoid duplicates on HMR or remounts
		if (document.querySelector(`script[src*="recaptcha/api.js"]`)) {
			setIsRecaptchaLoaded(true); // Assume it's loaded or will load
			return;
		}

		const script = document.createElement("script");
		script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
		script.async = true;
		script.defer = true;
		script.onload = () => {
			// Note: state might not be updated immediately here
			setIsRecaptchaLoaded(true);
		};
		script.onerror = () => {
			console.error("Failed to load reCAPTCHA");
			setFormStatus(
				"Security verification failed to load. Please refresh the page.",
			);
		};
		document.body.appendChild(script);

		return () => {
			// Cleanup the script when the component unmounts
			const existingScript = document.querySelector(
				`script[src*="recaptcha/api.js"]`,
			);
			if (existingScript && document.body.contains(existingScript)) {
				document.body.removeChild(existingScript);
			}
			// Optionally reset the state if needed when unmounting
			// setIsRecaptchaLoaded(false);
		};
	}, [recaptchaSiteKey]); // Dependency array includes recaptchaSiteKey

	const sanitizeInput = (input: string): string => {
		// Basic sanitization (consider a more robust library if needed)
		if (
			input.includes("<") ||
			input.includes(">") ||
			input.includes("on") || // simplistic check for event handlers
			input.includes("javascript:")
		) {
			return input
				.replace(/<[^>]*>?/gm, "") // Remove HTML tags
				.replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "") // Remove on... attributes
				.replace(/javascript:[^"']*/gi, "") // Remove javascript: links
				.trim();
		}
		return input; // Return original if no suspicious patterns found
	};

	const validateEmail = (email: string): boolean => {
		// Standard email regex
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		// Sanitize on change to prevent storing potentially harmful input
		const sanitizedValue = sanitizeInput(value);
		setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setFormStatus("");
		setCaptchaError("");

		if (!validateEmail(formData.email)) {
			setFormStatus("Please enter a valid email address.");
			setIsSubmitting(false);
			return;
		}

		const token = recaptchaRef.current?.getValue();
		if (!token) {
			setCaptchaError("Please verify that you are not a robot.");
			setIsSubmitting(false);
			return;
		}

		try {
			if (!serviceId || !templateId || !userId) {
				throw new Error(
					"Email service environment variables not properly configured.",
				);
			}

			// --- DYNAMIC IMPORT ADDED HERE ---
			const emailjsModule = await import("emailjs-com");
			const emailjs = emailjsModule.default; // Access the default export
			// --- END DYNAMIC IMPORT ---

			await emailjs.send(
				serviceId,
				templateId,
				{
					from_name: `${formData.firstName} ${formData.lastName}`, // Sanitize names if needed
					from_email: formData.email, // Already validated
					message: formData.message, // Already sanitized on change
					"g-recaptcha-response": token,
				},
				userId,
			);

			setFormStatus("Your message has been sent successfully!");
			setFormData({ firstName: "", lastName: "", email: "", message: "" });
			recaptchaRef.current?.reset(); // Reset reCAPTCHA after successful send
		} catch (error) {
			console.error("Failed to send message:", error);
			setFormStatus(
				"Failed to send message. Please check console or try again later.",
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className='contact-us-container'>
			<h1>Contact Us</h1>
			<p>Have questions or feedback? Reach out and we'll respond promptly.</p>

			<form onSubmit={handleSubmit} className='contact-form' noValidate>
				<div className='form-group'>
					<label htmlFor='firstName'>
						First Name *
						<input
							id='firstName'
							type='text'
							name='firstName'
							value={formData.firstName}
							onChange={handleChange}
							required
							aria-required='true'
							pattern='^[A-Za-z\s\-]+$' // Use ^ and $ for stricter pattern matching
							title='Only letters, spaces, and hyphens allowed'
							maxLength={50}
						/>
					</label>
				</div>

				<div className='form-group'>
					<label htmlFor='lastName'>
						Last Name *
						<input
							id='lastName'
							type='text'
							name='lastName'
							value={formData.lastName}
							onChange={handleChange}
							required
							aria-required='true'
							pattern='^[A-Za-z\s\-]+$'
							title='Only letters, spaces, and hyphens allowed'
							maxLength={50}
						/>
					</label>
				</div>

				<div className='form-group'>
					<label htmlFor='email'>
						Email *
						<input
							id='email'
							type='email'
							name='email'
							value={formData.email}
							onChange={handleChange}
							required
							aria-required='true'
							maxLength={100}
						/>
					</label>
				</div>

				<div className='form-group'>
					<label htmlFor='message'>
						Message *
						<textarea
							id='message'
							name='message'
							value={formData.message}
							onChange={handleChange}
							required
							aria-required='true'
							rows={5}
							maxLength={1000}
						/>
					</label>
				</div>

				{/* Conditionally render Suspense and LazyReCAPTCHA */}
				{recaptchaSiteKey ? (
					<Suspense
						fallback={
							<div className='recaptcha-loading'>Loading verification...</div>
						}
					>
						{isRecaptchaLoaded ? (
							<LazyReCAPTCHA
								sitekey={recaptchaSiteKey}
								ref={recaptchaRef}
								onChange={() => setCaptchaError("")} // Clear error when user interacts
								onErrored={() =>
									setCaptchaError("reCAPTCHA verification failed.")
								}
								onExpired={() =>
									setCaptchaError(
										"reCAPTCHA verification expired. Please verify again.",
									)
								}
								className='recaptcha'
							/>
						) : (
							// Optional: Show something if script is loading but component isn't ready yet
							// This might overlap with Suspense fallback depending on timing
							<div className='recaptcha-loading'>
								Initializing verification...
							</div>
						)}
					</Suspense>
				) : (
					<p className='error-message'>reCAPTCHA is not configured.</p>
				)}
				{captchaError && <p className='error-message'>{captchaError}</p>}

				<button
					type='submit'
					className='submit-button'
					aria-label='Send message'
					// Disable button if submitting, or if reCAPTCHA isn't configured or loaded
					disabled={isSubmitting || !recaptchaSiteKey || !isRecaptchaLoaded}
				>
					{isSubmitting ? "Sending..." : "Send Message"}
				</button>

				{formStatus && (
					<p
						className={`form-status ${
							formStatus.includes("success") ? "success" : "error"
						}`}
						role='alert' // Improve accessibility for status messages
					>
						{formStatus}
					</p>
				)}
			</form>
		</section>
	);
};

export default ContactUs;
