import React, { useState, useEffect, useRef, Suspense } from "react";
import emailjs from "emailjs-com";
import "./ContactUs.css";

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

	useEffect(() => {
		console.log(
			"process.env.REACT_APP_RECAPTCHA_SITE_KEY:",
			process.env.REACT_APP_RECAPTCHA_SITE_KEY,
		);
		console.log("recaptchaSiteKey:", recaptchaSiteKey);

		if (!recaptchaSiteKey) {
			console.error("reCAPTCHA site key not configured");
			return;
		}

		const script = document.createElement("script");
		script.src = `https://www.google.com/recaptcha/api.js?render=${recaptchaSiteKey}`;
		script.async = true;
		script.defer = true;
		script.onload = () => {
			console.log("reCAPTCHA script loaded successfully!");
			console.log("isRecaptchaLoaded:", isRecaptchaLoaded);
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
			document.body.removeChild(script);
		};
	}, [recaptchaSiteKey]);

	const sanitizeInput = (input: string): string => {
		// Only sanitize if the input has changed.
		if (
			input.includes("<") ||
			input.includes(">") ||
			input.includes("on") ||
			input.includes("javascript:")
		) {
			return input
				.replace(/<[^>]*>?/gm, "")
				.replace(/on\w+="[^"]*"/g, "")
				.replace(/javascript:[^"]*/g, "")
				.trim();
		}
		return input; // Don't sanitize if no harmful characters are present
	};

	const validateEmail = (email: string): boolean => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
	};

	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
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
				throw new Error("Email service not properly configured");
			}

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
			setFormStatus("Failed to send message. Please try again later.");
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
							pattern='[A-Za-z\s\-]+'
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
							pattern='[A-Za-z\s\-]+'
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

				{recaptchaSiteKey && isRecaptchaLoaded && (
					<Suspense
						fallback={
							<div className='recaptcha-loading'>Loading verification...</div>
						}
					>
						<LazyReCAPTCHA
							sitekey={recaptchaSiteKey}
							ref={recaptchaRef}
							className='recaptcha'
						/>
					</Suspense>
				)}
				{captchaError && <p className='error-message'>{captchaError}</p>}

				<button
					type='submit'
					className='submit-button'
					aria-label='Send message'
					disabled={isSubmitting || !recaptchaSiteKey || !isRecaptchaLoaded}
				>
					{isSubmitting ? "Sending..." : "Send Message"}
				</button>

				{formStatus && (
					<p
						className={`form-status ${
							formStatus.includes("success") ? "success" : "error"
						}`}
					>
						{formStatus}
					</p>
				)}
			</form>
		</section>
	);
};

export default ContactUs;
