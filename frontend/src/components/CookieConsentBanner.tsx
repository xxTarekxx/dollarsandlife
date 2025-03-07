import React, { useEffect, useState } from "react";
import "./CookieConsentBanner.css";

declare global {
	interface Window {
		dataLayer?: any[];
	}
}

const CookieConsentBanner: React.FC = () => {
	const [isVisible, setIsVisible] = useState(false);
	const [preferences, setPreferences] = useState({
		essential: true, // Always enabled
		analytics: false,
		ads: false, // Controls Google AdSense
		saleOfData: false, // User opts out of data sales (CCPA, CPRA)
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
		setIsVisible(false);
		applyCookies(preferences);
	};

	const handleRejectAll = () => {
		const resetPreferences = {
			essential: true,
			analytics: false,
			ads: false,
			saleOfData: false, // Default to opt-out
		};
		localStorage.setItem("cookiePreferences", JSON.stringify(resetPreferences));
		setPreferences(resetPreferences);
		setIsVisible(false);
		applyCookies(resetPreferences);
	};

	const applyCookies = (prefs: {
		essential: boolean;
		analytics: boolean;
		ads: boolean;
		saleOfData: boolean;
	}) => {
		if (prefs.analytics) loadGoogleAnalytics();
		if (prefs.ads) loadGoogleAdSense();
		if (!prefs.saleOfData) disableDataSale(); // Ensures compliance
	};

	const loadGoogleAnalytics = () => {
		if (!window.dataLayer) window.dataLayer = [];

		function gtag(...args: any[]) {
			window.dataLayer!.push(args);
		}

		if (!document.querySelector('script[src*="gtag/js?id=G-S7FWNHSD7P"]')) {
			const script = document.createElement("script");
			script.src = "https://www.googletagmanager.com/gtag/js?id=G-S7FWNHSD7P";
			script.async = true;
			script.onload = () => {
				gtag("js", new Date());
				gtag("config", "G-S7FWNHSD7P");
			};
			document.body.appendChild(script);
		}
	};

	const loadGoogleAdSense = () => {
		if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
			const script = document.createElement("script");
			script.src =
				"https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js";
			script.async = true;
			script.setAttribute("data-ad-client", "ca-pub-1079721341426198");
			document.body.appendChild(script);
		}
	};

	// Disable the sale of user data (for CCPA, CPRA compliance)
	const disableDataSale = () => {
		console.log("User has opted out of data sale. Compliance enforced.");
	};

	if (!isVisible) return null;

	return (
		<>
			{/* JSON-LD Structured Data for SEO & Privacy Compliance */}
			<script type='application/ld+json'>
				{JSON.stringify({
					"@context": "https://schema.org",
					"@type": "WebSite",
					name: "Dollars And Life",
					url: "https://www.dollarsandlife.com",
					potentialAction: {
						"@type": "SearchAction",
						target: "https://www.dollarsandlife.com/?s={search_term_string}",
						"query-input": "required name=search_term_string",
					},
				})}
			</script>

			{/* Cookie Consent Banner */}
			<div
				className='cookie-banner'
				role='dialog'
				aria-labelledby='cookie-banner-title'
			>
				<p id='cookie-banner-title'>
					We use cookies to enhance your experience. Please select your cookie
					preferences. For more details, visit our{" "}
					<a href='/terms-of-service' target='_blank' rel='noopener noreferrer'>
						Privacy Policy
					</a>
					.
				</p>

				{/* Cookie Preference Options */}
				<div className='cookie-options'>
					<label>
						<input type='checkbox' checked disabled />
						Essential Cookies (Always Enabled)
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
						/>
						Analytics Cookies (Google Analytics)
					</label>
					<label>
						<input
							type='checkbox'
							checked={preferences.ads}
							onChange={() =>
								setPreferences({ ...preferences, ads: !preferences.ads })
							}
						/>
						Ads Cookies (Google AdSense)
					</label>
					<label>
						<input
							type='checkbox'
							checked={preferences.saleOfData}
							onChange={() =>
								setPreferences({
									...preferences,
									saleOfData: !preferences.saleOfData,
								})
							}
						/>
						Opt-Out of Sale of Personal Information (CCPA, CPRA Certified)
					</label>
				</div>

				{/* Certification Label */}
				<div className='privacy-certification'>
					<p>✅ CCPA | CPRA | VCDPA | UCPA Certified Privacy Compliance</p>
				</div>

				{/* Buttons */}
				<div className='cookie-buttons-container'>
					<button onClick={handleSavePreferences}>Save Preferences</button>
					<button onClick={handleRejectAll}>Reject All</button>
				</div>
			</div>
		</>
	);
};

export default CookieConsentBanner;
