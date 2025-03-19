import React, { useState, useEffect, useRef, useCallback } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import emailjs from "emailjs-com";
import "./ContactUs.css";

const ContactUs: React.FC = () => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		message: "",
	});
	const [formStatus, setFormStatus] = useState("");
	const [captchaError, setCaptchaError] = useState("");
	const recaptchaRef = useRef<ReCAPTCHA>(null);

	// Scroll to top on mount
	useEffect(() => window.scrollTo(0, 0), []);

	// Email validation regex
	const validateEmail = (email: string) =>
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	// Handle input changes
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		// Validate name fields (only letters)
		if (
			(name === "firstName" || name === "lastName") &&
			!/^[a-zA-Z]*$/.test(value)
		) {
			return;
		}
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Form submit handler
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateEmail(formData.email)) {
			setFormStatus("Please enter a valid email address.");
			return;
		}

		const token = recaptchaRef.current?.getValue();
		if (!token) {
			setCaptchaError("Please verify that you are not a robot.");
			return;
		}

		const templateParams = {
			from_name: `${formData.firstName} ${formData.lastName}`,
			from_email: formData.email,
			message: formData.message,
			"g-recaptcha-response": token,
		};

		try {
			await emailjs.send(
				"service_nczatmu",
				"template_jdvl2xw",
				templateParams,
				"K3dpn1hBIlh71TATT",
			);
			setFormStatus("Your message has been sent successfully.");
			setFormData({ firstName: "", lastName: "", email: "", message: "" });
			recaptchaRef.current?.reset();
			setCaptchaError("");
		} catch (error) {
			console.error("EmailJS Error:", error);
			setFormStatus("Error sending message. Please try again later.");
		}
	};

	return (
		<section className='contact-us-container'>
			<h1>Contact Us</h1>
			<p>
				Have questions or feedback? Reach out, and we'll get back to you ASAP.
			</p>

			{/* Structured Data */}
			<script type='application/ld+json'>
				{JSON.stringify({
					"@context": "https://schema.org",
					"@type": "ContactPage",
					mainEntity: {
						"@type": "Organization",
						name: "Dollars & Life",
						url: "https://www.dollarsandlife.com/contact",
						contactPoint: {
							"@type": "ContactPoint",
							email: "support@dollarsandlife.com",
							contactType: "Customer Service",
						},
					},
				})}
			</script>

			<form onSubmit={handleSubmit} className='contact-form'>
				<label>
					<span>First Name</span>
					<input
						type='text'
						name='firstName'
						value={formData.firstName}
						placeholder='First Name'
						onChange={handleChange}
						required
						aria-label='First Name'
					/>
				</label>

				<label>
					<span>Last Name</span>
					<input
						type='text'
						name='lastName'
						value={formData.lastName}
						placeholder='Last Name'
						onChange={handleChange}
						required
						aria-label='Last Name'
					/>
				</label>

				<label>
					<span>Email</span>
					<input
						type='email'
						name='email'
						value={formData.email}
						placeholder='Email'
						onChange={handleChange}
						required
						aria-label='Email'
					/>
				</label>

				<label>
					<span>Your Message</span>
					<textarea
						name='message'
						value={formData.message}
						placeholder='Your message'
						onChange={handleChange}
						required
						aria-label='Your message'
					/>
				</label>

				{/* Google reCAPTCHA */}
				<ReCAPTCHA
					sitekey='6Le2mjMqAAAAABzmZ0UJy5K6Gl5vw-CDG-mhon5L'
					ref={recaptchaRef}
				/>
				{captchaError && <p className='error'>{captchaError}</p>}

				{/* Submit Button */}
				<button type='submit' aria-label='Send Message'>
					Send
				</button>

				{/* Form Status */}
				{formStatus && <p className='form-status'>{formStatus}</p>}
			</form>
		</section>
	);
};

export default ContactUs;
