import React, { useState, useRef, useEffect, useCallback } from "react";
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

	// Scroll to top when the component mounts
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	// Validate Email Format
	const validateEmail = (email: string) =>
		/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

	// Handle Input Change
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;
		if (name === "firstName" || name === "lastName") {
			if (!/^[a-zA-Z]*$/.test(value)) return;
		}
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	// Handle Form Submission
	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

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
			setFormStatus(
				"There was an error sending your message. Please try again later.",
			);
		}
	};

	return (
		<section className='contact-us-container'>
			<h1>Contact Us</h1>
			<p>
				Have a question or feedback? Reach out to us and we'll get back to you
				as soon as possible.
			</p>

			{/* Schema Markup for SEO */}
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
							contactType: "customer service",
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
						placeholder='First Name'
						value={formData.firstName}
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
						placeholder='Last Name'
						value={formData.lastName}
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
						placeholder='Email'
						value={formData.email}
						onChange={handleChange}
						required
						aria-label='Email'
					/>
				</label>

				<label>
					<span>Your Message</span>
					<textarea
						name='message'
						placeholder='Your message'
						value={formData.message}
						onChange={handleChange}
						required
						aria-label='Your message'
					/>
				</label>

				<ReCAPTCHA
					sitekey='6Le2mjMqAAAAABzmZ0UJy5K6Gl5vw-CDG-mhon5L'
					ref={recaptchaRef}
				/>
				{captchaError && <p className='error'>{captchaError}</p>}

				<button type='submit' aria-label='Send Message'>
					Send
				</button>

				{formStatus && (
					<p className='form-status' aria-live='polite'>
						{formStatus}
					</p>
				)}
			</form>
		</section>
	);
};

export default ContactUs;
