import React, {
	Suspense,
	lazy,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import "./ContactUs.css";

// Lazy load ReCAPTCHA component
const LazyReCAPTCHA = lazy(() => import("react-google-recaptcha"));

interface FormData {
	firstName: string;
	lastName: string;
	email: string;
	message: string;
}

const ContactUs: React.FC = () => {
	const serviceId = import.meta.env.VITE_REACT_APP_EMAILJS_SERVICE_ID;
	const templateId = import.meta.env.VITE_REACT_APP_EMAILJS_TEMPLATE_ID;
	const userId = import.meta.env.VITE_REACT_APP_EMAILJS_USER_ID;
	const recaptchaSiteKey = import.meta.env.VITE_REACT_APP_RECAPTCHA_SITE_KEY;

	const [formData, setFormData] = useState<FormData>({
		firstName: "",
		lastName: "",
		email: "",
		message: "",
	});
	const [formStatus, setFormStatus] = useState("");
	const [captchaError, setCaptchaError] = useState("");
	const [isRecaptchaScriptLoaded, setIsRecaptchaScriptLoaded] = useState(false); // Renamed for clarity
	const [isSubmitting, setIsSubmitting] = useState(false);
	const recaptchaRef = useRef<any>(null);

	// Effect to load the reCAPTCHA API script when this component mounts
	useEffect(() => {
		if (!recaptchaSiteKey) {
			console.error("reCAPTCHA site key not configured");
			return;
		}

		// Check if script is already loaded by another instance perhaps
		if (document.querySelector(`script[src*="recaptcha/api.js"]`)) {
			setIsRecaptchaScriptLoaded(true);
			return;
		}

		const script = document.createElement("script");
		// Use standard v2 api.js load, as LazyReCAPTCHA is likely v2
		script.src = `https://www.google.com/recaptcha/api.js`;
		script.async = true;
		script.defer = true;
		script.onload = () => {
			setIsRecaptchaScriptLoaded(true);
		};
		script.onerror = () => {
			console.error("Failed to load reCAPTCHA");
			setFormStatus(
				"Security verification failed to load. Please refresh the page.",
			);
		};
		document.body.appendChild(script);

		// Cleanup function to remove script if component unmounts
		return () => {
			const existingScript = document.querySelector(
				`script[src*="recaptcha/api.js"]`,
			);
			if (existingScript && document.body.contains(existingScript)) {
				document.body.removeChild(existingScript);
			}
			setIsRecaptchaScriptLoaded(false);
		};
	}, [recaptchaSiteKey]);

	const sanitizeInput = useCallback((input: string): string => {
		// Basic sanitization
		if (
			input.includes("<") ||
			input.includes(">") ||
			input.includes("on") ||
			input.includes("javascript:")
		) {
			return input
				.replace(/<[^>]*>?/gm, "")
				.replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
				.replace(/javascript:[^"']*/gi, "")
				.trim();
		}
		return input;
	}, []);

	const validateEmail = (email: string): boolean => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};

	const handleChange = useCallback(
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const { name, value } = e.target;
			const sanitizedValue = sanitizeInput(value);
			setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
		},
		[sanitizeInput],
	);

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

			// Dynamically import emailjs ONLY when submitting
			const emailjsModule = await import("emailjs-com");
			const emailjs = emailjsModule.default;

			await emailjs.send(
				serviceId,
				templateId,
				{
					from_name: `${formData.firstName} ${formData.lastName}`,
					from_email: formData.email,
					message: formData.message,
					"g-recaptcha-response": token,
				},
				userId,
			);

			setFormStatus("Your message has been sent successfully!");
			setFormData({ firstName: "", lastName: "", email: "", message: "" });
			recaptchaRef.current?.reset();
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
							pattern='^[A-Za-z\s\-]+$'
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

				{/* Render reCAPTCHA only if key exists */}
				{recaptchaSiteKey ? (
					<Suspense
						fallback={
							<div className='recaptcha-loading'>Loading verification...</div>
						}
					>
						{/* Render the component only when the API script has loaded */}
						{isRecaptchaScriptLoaded ? (
							<LazyReCAPTCHA
								sitekey={recaptchaSiteKey}
								ref={recaptchaRef}
								onChange={() => setCaptchaError("")}
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
					disabled={
						isSubmitting || !recaptchaSiteKey || !isRecaptchaScriptLoaded
					}
				>
					{isSubmitting ? "Sending..." : "Send Message"}
				</button>

				{formStatus && (
					<p
						className={`form-status ${
							formStatus.includes("success") ? "success" : "error"
						}`}
						role='alert'
					>
						{formStatus}
					</p>
				)}
			</form>
		</section>
	);
};

export default ContactUs;
