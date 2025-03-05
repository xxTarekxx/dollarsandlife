import React, { useEffect, useState } from "react";
import "./CookieConsentBanner.css";

// ✅ Declare global properties to prevent TypeScript errors
declare global {
	interface Window {
		dataLayer?: any[];
	}
}

const CookieConsentBanner: React.FC = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [preferences, setPreferences] = useState({
		essential: true, // Essential cookies are always enabled
		analytics: false,
		ads: false, // Controls Google AdSense
	});

	useEffect(() => {
		const storedConsent = localStorage.getItem("cookiePreferences");

		if (!storedConsent) {
			setIsVisible(true);
		} else {
			const parsedPreferences = JSON.parse(storedConsent);
			setPreferences(parsedPreferences);
			applyCookies(parsedPreferences);
		}
	}, []);

	const handleSavePreferences = () => {
		localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
		console.log(
			"Saved Preferences:",
			JSON.parse(localStorage.getItem("cookiePreferences")!),
		);
		setIsVisible(false);
		applyCookies(preferences);
	};

	const handleRejectAll = () => {
		const resetPreferences = { essential: true, analytics: false, ads: false };
		localStorage.setItem("cookiePreferences", JSON.stringify(resetPreferences));
		setPreferences(resetPreferences);
		setIsVisible(false);
		applyCookies(resetPreferences);
	};

	const applyCookies = (prefs: {
		essential: boolean;
		analytics: boolean;
		ads: boolean;
	}) => {
		if (prefs.analytics) {
			loadGoogleAnalytics();
		}
		if (prefs.ads) {
			loadGoogleAdSense();
		}
	};

	// ✅ Loads Google Analytics if the user consents
	const loadGoogleAnalytics = () => {
		if (!window.dataLayer) {
			window.dataLayer = [];
		}
		function gtag(...args: any[]) {
			window.dataLayer!.push(args);
		}

		const script = document.createElement("script");
		script.src = "https://www.googletagmanager.com/gtag/js?id=UA-XXXXXXX-X"; // Replace with your GA ID
		script.async = true;
		script.onload = () => {
			gtag("js", new Date());
			gtag("config", "UA-XXXXXXX-X"); // Replace with your GA ID
		};
		document.body.appendChild(script);
	};

	// ✅ Loads Google AdSense if the user consents
	const loadGoogleAdSense = () => {
		const script = document.createElement("script");
		script.src =
			"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
		script.async = true;
		script.setAttribute("data-ad-client", "ca-pub-1079721341426198"); // ✅ Uses your AdSense ID
		document.body.appendChild(script);
		console.log("Google AdSense script loaded.");
	};

	if (!isVisible) return null;

	return (
		<div className='cookie-banner'>
			<p>
				We use cookies to enhance your experience. Please select your cookie
				preferences. For more details, visit our{" "}
				<a href='/terms-of-service'>Privacy Policy</a>.
			</p>
			<div className='cookie-options'>
				<label>
					<input type='checkbox' checked disabled /> Essential Cookies (Always
					Enabled)
				</label>
				<label>
					<input
						type='checkbox'
						checked={preferences.analytics}
						onChange={() =>
							setPreferences({
								...preferences,
								analytics: !preferences.analytics,
							})
						}
					/>{" "}
					Analytics Cookies (Google Analytics)
				</label>
				<label>
					<input
						type='checkbox'
						checked={preferences.ads}
						onChange={() =>
							setPreferences({ ...preferences, ads: !preferences.ads })
						}
					/>{" "}
					Ads Cookies (Google AdSense)
				</label>
			</div>
			<div className='cookie-buttons-container'>
				<button onClick={handleSavePreferences}>Save Preferences</button>
				<button onClick={handleRejectAll}>Reject All</button>
			</div>
		</div>
	);
};

export default CookieConsentBanner;
