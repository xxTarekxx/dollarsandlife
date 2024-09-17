import React, { useState, useRef, useEffect } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import "./ContactUs.css";
import emailjs from "emailjs-com";

const ContactUs: React.FC = () => {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [message, setMessage] = useState("");
	const [formStatus, setFormStatus] = useState("");
	const [captchaError, setCaptchaError] = useState("");

	// Create a ref for the reCAPTCHA component
	const recaptchaRef = useRef<ReCAPTCHA>(null);

	// Scroll to the top of the page when the component loads
	useEffect(() => {
		window.scrollTo(0, 0);
	}, []);

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();

		if (!validateEmail(email)) {
			setFormStatus("Please enter a valid email address.");
			return;
		}

		const token = recaptchaRef.current?.getValue(); // Get the reCAPTCHA token

		if (!token) {
			setCaptchaError("Please verify that you are not a robot.");
			return;
		}

		const templateParams = {
			from_name: `${firstName} ${lastName}`,
			from_email: email,
			message: message,
			first_name: firstName,
			last_name: lastName,
			"g-recaptcha-response": token, // Include the reCAPTCHA token
		};

		emailjs
			.send(
				"service_nczatmu",
				"template_jdvl2xw",
				templateParams,
				"K3dpn1hBIlh71TATT",
			)
			.then(
				() => {
					setFormStatus("Your message has been sent successfully.");
					setFirstName("");
					setLastName("");
					setEmail("");
					setMessage("");
					recaptchaRef.current?.reset(); // Reset reCAPTCHA after successful submission
					setCaptchaError("");
				},
				(error) => {
					setFormStatus(
						"There was an error sending your message. Please try again later.",
					);
					console.error("EmailJS Error:", error);
				},
			)
			.catch((error) => {
				setCaptchaError("Failed to verify reCAPTCHA. Please try again.");
				console.error("reCAPTCHA Error:", error);
			});
	};

	const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (/^[a-zA-Z]*$/.test(value)) {
			setFirstName(value);
		}
	};

	const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		if (/^[a-zA-Z]*$/.test(value)) {
			setLastName(value);
		}
	};

	const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEmail(e.target.value);
	};

	const validateEmail = (email: string) => {
		const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return regex.test(email);
	};

	return (
		<section className='contact-us-container'>
			<h2>Contact Us</h2>
			<form onSubmit={handleSubmit} className='contact-form'>
				<label>
					<span className='visually-hidden'>First Name</span>
					<input
						type='text'
						placeholder='First Name'
						value={firstName}
						onChange={handleFirstNameChange}
						required
						aria-label='First Name'
					/>
				</label>
				<label>
					<span className='visually-hidden'>Last Name</span>
					<input
						type='text'
						placeholder='Last Name'
						value={lastName}
						onChange={handleLastNameChange}
						required
						aria-label='Last Name'
					/>
				</label>
				<label>
					<span className='visually-hidden'>Email</span>
					<input
						type='email'
						placeholder='Email'
						value={email}
						onChange={handleEmailChange}
						required
						aria-label='Email'
					/>
				</label>
				<label>
					<span className='visually-hidden'>Your message</span>
					<textarea
						placeholder='Your message'
						value={message}
						onChange={(e) => setMessage(e.target.value)}
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
