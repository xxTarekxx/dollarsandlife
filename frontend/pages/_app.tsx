import { AppProps } from "next/app";
import Head from "next/head"; // For default head tags
import Router, { useRouter } from "next/router"; // Import useRouter as well for the router instance
import { useCallback, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

// Import global CSS
import "../src/App.css";
import "../src/components/articles-content/BlogPostContent.css";
import "../src/components/articles-postcards/BlogPostCard.css";
import "../src/components/breadcrumbs/Breadcrumb.css";
import "../src/components/calculators/FinancialCalculators.css";
import "../src/components/footer/Footer.css";
import "../src/components/navbar/NavBar.css";
import "../src/components/pagination/PaginationContainer.css";
import "../src/components/rss-news/RssTicker.css";
import "../src/index.css";
import "./extra-income/CommonStyles.css";
import "./extra-income/ExtraIncome.css";
import "./forum/ForumHomePage.css";
import "./forum/post/ViewPostPage.css";
import "./HomePage.css";
import "./return-policy.css";
import "./SentryPCLanding.css";
import "./shopping-deals/ProductDetails.css";
import "./shopping-deals/ShoppingDeals.css";

// Import layout components
import BreadcrumbWrapper from "../src/components/breadcrumbs/BreadcrumbWrapper";
import Footer from "../src/components/footer/Footer";
import NavBar from "../src/components/navbar/NavBar";
import RssTicker from "../src/components/rss-news/RssTicker";

// Type declarations for gtag
declare global {
	interface Window {
		gtag: (
			command: "config" | "event" | "js",
			targetId: string,
			config?: {
				page_path?: string;
				traffic_type?: string;
				[key: string]: unknown;
			},
		) => void;
	}
}

// GA and AdBlock related constants
const GA_MEASUREMENT_ID =
	process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-76XESXFFJP";
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-16613104907";

function MyApp({ Component, pageProps }: AppProps) {
	const [showAdBlockPrompt, setShowAdBlockPrompt] = useState(false);
	const router = useRouter(); // Use useRouter hook for consistency

	// ScrollToTop functionality
	useEffect(() => {
		const handleRouteChange = () => {
			window.scrollTo(0, 0);
		};
		Router.events.on("routeChangeComplete", handleRouteChange);
		return () => {
			Router.events.off("routeChangeComplete", handleRouteChange);
		};
	}, []);

	// AdBlock Detection
	useEffect(() => {
		const checkAdBlock = () => {
			let isAdBlocked = false;
			const testAd = document.createElement("div");
			testAd.innerHTML = "\u00A0"; // &nbsp;
			testAd.className = "adsbox";
			testAd.style.cssText =
				"position:absolute; height:1px; width:1px; top:-1px; left:-1px; opacity:0.01; pointer-events:none;";
			try {
				document.body.appendChild(testAd);
				// Use requestAnimationFrame to ensure the element is in the DOM and styles are applied
				requestAnimationFrame(() => {
					// Delay check slightly to give ad blockers time to act
					setTimeout(() => {
						if (
							testAd.offsetHeight === 0 ||
							(typeof window !== "undefined" &&
								window.getComputedStyle(testAd).display === "none") ||
							(typeof window !== "undefined" &&
								window.getComputedStyle(testAd).visibility === "hidden")
						) {
							isAdBlocked = true;
						}
						if (document.body.contains(testAd)) {
							document.body.removeChild(testAd);
						}
						if (isAdBlocked) {
							setShowAdBlockPrompt(true);
						}
					}, 150); // Increased delay slightly
				});
			} catch {
				// Fallback if appendChild fails or other error
				if (document.body.contains(testAd)) {
					document.body.removeChild(testAd);
				}
			}
		};
		// Delay initial check to allow page to render and ad blockers to potentially act
		const timer = setTimeout(checkAdBlock, 3000);
		return () => clearTimeout(timer);
	}, []);

	const handleDismissAdBlockPrompt = useCallback(() => {
		setShowAdBlockPrompt(false);
	}, []);

	// GA Configuration
	useEffect(() => {
		const INTERNAL_IP_PREFIX =
			process.env.NEXT_PUBLIC_REACT_APP_INTERNAL_IP_PREFIX;
		const internalPrefixes = (INTERNAL_IP_PREFIX || "")
			.split(",")
			.map((p) => p.trim())
			.filter((p) => p);

		const configureGa = (isInternal: boolean) => {
			if (typeof window.gtag === "function") {
				window.gtag("config", GA_MEASUREMENT_ID, {
					page_path: router.asPath, // router.asPath includes query parameters
					...(isInternal && { traffic_type: "internal" }),
				});
				window.gtag("config", GOOGLE_ADS_ID);
			}
		};

		if (internalPrefixes.length > 0) {
			fetch("https://api64.ipify.org?format=json")
				.then((res) => {
					if (!res.ok) throw new Error("Failed to fetch IP");
					return res.json();
				})
				.then((data) => {
					const userIP = data.ip;
					const normalizeIP = (ip: string) => ip.replace(/[^a-zA-Z0-9:.]/g, "");
					const isInternal = internalPrefixes.some((prefix) =>
						normalizeIP(userIP).startsWith(normalizeIP(prefix)),
					);
					configureGa(isInternal);
				})
				.catch(() => configureGa(false)); // Fallback on API error
		} else {
			configureGa(false);
		}
		// Listen to route changes for GA page views
	}, [router.asPath]); // Depend on router.asPath for full URL including query params

	// Determine if BreadcrumbWrapper should be shown
	const showBreadcrumbs = router.pathname !== "/";

	return (
		<>
			<Head>
				<title>
					Dollars And Life - Personal Finance, Extra Income & Savings
				</title>
				<meta
					name='description'
					content='Dollars And Life offers advice on extra income, budgeting, and saving deals.'
				/>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				{/* Custom favicon */}
				<link rel='icon' type='image/png' href='/website-logo-icon.png' />
				{/* Optionally, remove or comment out the old favicon links below */}
				{/*
				<link rel='icon' href='/favicon/favicon.ico' />
				<link rel='apple-touch-icon' sizes='180x180' href='/favicon/apple-touch-icon.png' />
				<link rel='icon' type='image/png' sizes='32x32' href='/favicon/favicon-32x32.png' />
				<link rel='icon' type='image/png' sizes='16x16' href='/favicon/favicon-16x16.png' />
				<link rel='manifest' href='/favicon/site.webmanifest' />
				*/}
			</Head>
			<Toaster
				position='top-center'
				toastOptions={{
					duration: 4000,
					success: { style: { background: "green", color: "white" } },
					error: { style: { background: "red", color: "white" } },
				}}
			/>

			<div className={`app-container ${showAdBlockPrompt ? "blurred" : ""}`}>
				{showAdBlockPrompt && (
					<div className='adblock-warning'>
						<h2>We Rely on Ads to Keep Our Content Free</h2>
						<p>Please consider pausing AdBlock for our site to support us.</p>
						<button onClick={handleDismissAdBlockPrompt}>I Understand</button>
					</div>
				)}
				<header>
					<NavBar />
				</header>
				<aside>
					<RssTicker />
				</aside>

				{showBreadcrumbs && <BreadcrumbWrapper />}

				<main>
					<Component {...pageProps} />
				</main>

				<footer>
					<Footer />
				</footer>
			</div>
		</>
	);
}

export default MyApp;
