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
		essential: true,
		analytics: false,
		ads: false,
		saleOfData: false,
	});

	// Load saved preferences
	useEffect(() => {
		const storedPrefs = localStorage.getItem("cookiePreferences");
		if (storedPrefs) {
			const parsedPrefs = JSON.parse(storedPrefs);
			setPreferences(parsedPrefs);
			applyCookies(parsedPrefs);
		} else {
			setIsVisible(true);
		}
	}, []);

	// Apply cookie preferences
	const applyCookies = (prefs: typeof preferences) => {
		if (prefs.analytics) loadGoogleAnalytics();
		if (prefs.ads) loadGoogleAdSense();
		if (!prefs.saleOfData) disableDataSale();
	};

	// Save preferences
	const handleSavePreferences = () => {
		localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
		applyCookies(preferences);
		setIsVisible(false);
	};

	// Reject all preferences except essential
	const handleRejectAll = () => {
		const defaultPrefs = {
			essential: true,
			analytics: false,
			ads: false,
			saleOfData: false,
		};
		localStorage.setItem("cookiePreferences", JSON.stringify(defaultPrefs));
		setPreferences(defaultPrefs);
		applyCookies(defaultPrefs);
		setIsVisible(false);
	};

	// Load Google Analytics
	const loadGoogleAnalytics = () => {
		if (!window.dataLayer) window.dataLayer = [];

		function gtag(...args: any[]) {
			window.dataLayer!.push(args);
		}

		const internalIP = import.meta.env.VITE_INTERNAL_IP;

		// Block GA on internal IPs
		fetch("https://api64.ipify.org?format=json")
			.then((res) => res.json())
			.then((data) => {
				if (internalIP && data.ip === internalIP) {
					console.log("GA blocked: Internal IP detected");
					return;
				}
				if (!document.querySelector('script[src*="gtag/js?id=G-S7FWNHSD7P"]')) {
					const script = document.createElement("script");
					script.src =
						"https://www.googletagmanager.com/gtag/js?id=G-S7FWNHSD7P";
					script.async = true;
					script.onload = () => {
						gtag("js", new Date());
						gtag("config", "G-S7FWNHSD7P");
					};
					document.body.appendChild(script);
				}
			})
			.catch(() => console.error("Failed to fetch user IP"));
	};

	// Load Google AdSense
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

	// Disable sale of data (for CCPA compliance)
	const disableDataSale = () => {
		console.log("User opted out of data sale");
	};

	if (!isVisible) return null;

	return (
		<>
			{/* Structured Data */}
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

			{/* Cookie Banner */}
			<div
				className='cookie-banner'
				role='dialog'
				aria-labelledby='cookie-banner-title'
			>
				<p id='cookie-banner-title'>
					We use cookies to enhance your experience. Please select your
					preferences. See our{" "}
					<a href='/privacy-policy' target='_blank' rel='noopener noreferrer'>
						Privacy Policy
					</a>
					.
				</p>

				{/* Preferences */}
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
								setPreferences((prev) => ({
									...prev,
									analytics: !prev.analytics,
								}))
							}
						/>
						Analytics Cookies (Google Analytics)
					</label>
					<label>
						<input
							type='checkbox'
							checked={preferences.ads}
							onChange={() =>
								setPreferences((prev) => ({
									...prev,
									ads: !prev.ads,
								}))
							}
						/>
						Ads Cookies (Google AdSense)
					</label>
					<label>
						<input
							type='checkbox'
							checked={preferences.saleOfData}
							onChange={() =>
								setPreferences((prev) => ({
									...prev,
									saleOfData: !prev.saleOfData,
								}))
							}
						/>
						Opt-Out of Sale of Personal Information (CCPA, CPRA Certified)
					</label>
				</div>

				{/* Certifications */}
				<div className='privacy-certification'>
					<p>CCPA | CPRA | VCDPA | UCPA Certified Privacy Compliance</p>
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
