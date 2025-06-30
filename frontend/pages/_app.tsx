import { AppProps } from "next/app";
import Head from "next/head";
import Router, { useRouter } from "next/router";
import Script from "next/script";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toaster } from "react-hot-toast";

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

import BreadcrumbWrapper from "../src/components/breadcrumbs/BreadcrumbWrapper";
import Footer from "../src/components/footer/Footer";
import NavBar from "../src/components/navbar/NavBar";
import RssTicker from "../src/components/rss-news/RssTicker";

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

const GA_MEASUREMENT_ID =
	process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-76XESXFFJP";
const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-16613104907";

function MyApp({ Component, pageProps }: AppProps) {
	const [showAdBlockPrompt, setShowAdBlockPrompt] = useState(false);
	const router = useRouter();
	const isInternalUserRef = useRef<boolean | null>(null);

	useEffect(() => {
		const handleRouteChange = () => {
			window.scrollTo(0, 0);
		};
		Router.events.on("routeChangeComplete", handleRouteChange);
		return () => {
			Router.events.off("routeChangeComplete", handleRouteChange);
		};
	}, []);

	useEffect(() => {
		const checkAdBlock = () => {
			let isAdBlocked = false;
			const testAd = document.createElement("div");
			testAd.innerHTML = "\u00A0";
			testAd.className = "adsbox";
			testAd.style.cssText =
				"position:absolute; height:1px; width:1px; top:-1px; left:-1px; opacity:0.01; pointer-events:none;";
			try {
				document.body.appendChild(testAd);
				requestAnimationFrame(() => {
					setTimeout(() => {
						if (
							testAd.offsetHeight === 0 ||
							window.getComputedStyle(testAd).display === "none" ||
							window.getComputedStyle(testAd).visibility === "hidden"
						) {
							isAdBlocked = true;
						}
						if (document.body.contains(testAd)) {
							document.body.removeChild(testAd);
						}
						if (isAdBlocked) {
							setShowAdBlockPrompt(true);
						}
					}, 150);
				});
			} catch {
				if (document.body.contains(testAd)) {
					document.body.removeChild(testAd);
				}
			}
		};
		const timer = setTimeout(checkAdBlock, 3000);
		return () => clearTimeout(timer);
	}, []);

	const handleDismissAdBlockPrompt = useCallback(() => {
		setShowAdBlockPrompt(false);
	}, []);

	useEffect(() => {
		const INTERNAL_IP_PREFIX =
			process.env.NEXT_PUBLIC_REACT_APP_INTERNAL_IP_PREFIX;
		const internalPrefixes = (INTERNAL_IP_PREFIX || "")
			.split(",")
			.map((p) => p.trim())
			.filter((p) => p);

		const initializeGa = async () => {
			let isInternal = false;
			if (
				internalPrefixes.length > 0 &&
				internalPrefixes[0] !== "http://localhost:5000"
			) {
				try {
					const res = await fetch("https://api64.ipify.org?format=json");
					if (!res.ok) throw new Error("Failed to fetch IP");
					const data = await res.json();
					const userIP = data.ip;
					const normalizeIP = (ip: string) => ip.replace(/[^a-zA-Z0-9:.]/g, "");
					isInternal = internalPrefixes.some((prefix) =>
						normalizeIP(userIP).startsWith(normalizeIP(prefix)),
					);
				} catch (error) {
					console.error("Error fetching IP for GA:", error);
				}
			}
			isInternalUserRef.current = isInternal;

			if (typeof window.gtag === "function") {
				window.gtag("config", GA_MEASUREMENT_ID, {
					page_path: router.asPath,
					...(isInternal && { traffic_type: "internal" }),
				});
				window.gtag("config", GOOGLE_ADS_ID);
			}
		};

		initializeGa();
	}, [router.asPath]); // ✅ Fixed dependency

	useEffect(() => {
		const handleRouteChange = (url: string) => {
			if (typeof window.gtag === "function") {
				const configPayload: { page_path: string; traffic_type?: string } = {
					page_path: url,
				};
				if (isInternalUserRef.current === true) {
					configPayload.traffic_type = "internal";
				}
				window.gtag("event", "page_view", {
					page_path: url,
					send_to: GA_MEASUREMENT_ID,
					...(isInternalUserRef.current === true && {
						traffic_type: "internal",
					}),
				});
			}
		};

		Router.events.on("routeChangeComplete", handleRouteChange);
		return () => {
			Router.events.off("routeChangeComplete", handleRouteChange);
		};
	}, [router]);

	const showBreadcrumbs = router.pathname !== "/";

	return (
		<>
			<Script
				async
				src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1079721341426198'
				crossOrigin='anonymous'
				strategy='afterInteractive'
			/>
			<Head>
				<title>
					Dollars And Life - Personal Finance, Extra Income & Savings
				</title>
				<meta
					name='description'
					content='Dollars And Life offers advice on extra income, budgeting, and saving deals.'
				/>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' type='image/png' href='/website-logo-icon.png' />
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
