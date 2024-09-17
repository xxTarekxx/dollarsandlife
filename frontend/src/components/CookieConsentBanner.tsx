// src/components/CookieConsentBanner.tsx
import React, { useState, useEffect } from "react";

const CookieConsentBanner: React.FC = () => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		// Check if the user has already given consent
		const consentGiven = localStorage.getItem("cookieConsent");
		if (!consentGiven) {
			setIsVisible(true);
		}
	}, []);

	const handleAccept = () => {
		localStorage.setItem("cookieConsent", "true");
		setIsVisible(false);
		// Optionally, load non-essential scripts after user consent
		loadNonEssentialScripts();
	};

	const handleReject = () => {
		localStorage.setItem("cookieConsent", "false");
		setIsVisible(false);
	};

	const loadNonEssentialScripts = () => {
		// Load non-essential scripts like Google Analytics or Facebook Pixel here
	};

	if (!isVisible) return null;

	return (
		<div className='cookie-banner'>
			<p>
				We use cookies to enhance your experience. By continuing to visit this
				site, you accept our use of cookies. For more information, please see
				our <a href='/terms-of-service'>Terms of Service</a>.
			</p>
			<button onClick={handleAccept}>Accept</button>
			<button onClick={handleReject}>Reject</button>
		</div>
	);
};

export default CookieConsentBanner;
