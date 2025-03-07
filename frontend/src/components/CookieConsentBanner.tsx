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
		if (prefs.analytics) loadGoogleAnalytics();
		if (prefs.ads) loadGoogleAdSense();
	};

	const loadGoogleAnalytics = () => {
		if (!window.dataLayer) window.dataLayer = [];

		function gtag(...args: any[]) {
			window.dataLayer!.push(args);
		}

		if (!document.querySelector('script[src*="gtag/js?id=UA-XXXXXXX-X"]')) {
			const script = document.createElement("script");
			script.src = "https://www.googletagmanager.com/gtag/js?id=UA-XXXXXXX-X"; // Replace with GA ID
			script.async = true;
			script.defer = true;
			script.onload = () => {
				gtag("js", new Date());
				gtag("config", "UA-XXXXXXX-X");
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
			script.defer = true;
			script.setAttribute("data-ad-client", "ca-pub-1079721341426198");
			document.body.appendChild(script);
		}
	};

	if (!isVisible) return null;

	return (
		<>
			{/* JSON-LD Structured Data for SEO */}
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

				<div className='cookie-options'>
					<label>
						<input
							type='checkbox'
							checked
							disabled
							aria-label='Essential Cookies (Always Enabled)'
						/>
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
							aria-label='Enable Analytics Cookies (Google Analytics)'
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
							aria-label='Enable Ads Cookies (Google AdSense)'
						/>
						Ads Cookies (Google AdSense)
					</label>
				</div>

				<div className='cookie-buttons-container'>
					<button
						onClick={handleSavePreferences}
						aria-label='Save Cookie Preferences'
					>
						Save Preferences
					</button>
					<button onClick={handleRejectAll} aria-label='Reject All Cookies'>
						Reject All
					</button>
				</div>
			</div>
		</>
	);
};

export default CookieConsentBanner;
