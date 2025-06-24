// pages/_app.tsx
import type { AppProps } from "next/app";
import Head from "next/head";
import Router, { useRouter } from "next/router";
import { useEffect, useState, useCallback } from "react";
import { Toaster } from "react-hot-toast";

// Core styles
import "../src/index.css";
import "../src/App.css";
import "../src/components/navbar/NavBar.css";

// Dynamic imports
import dynamic from "next/dynamic";
const Footer = dynamic(() => import("../src/components/footer/Footer"), {
	ssr: false,
});
const RssTicker = dynamic(
	() => import("../src/components/rss-news/RssTicker"),
	{ ssr: false },
);
const BreadcrumbWrapper = dynamic(
	() => import("../src/components/breadcrumbs/BreadcrumbWrapper"),
	{ ssr: false },
);

import NavBar from "../src/components/navbar/NavBar";

// GA/Ads
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "G-76XESXFFJP";
const ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || "AW-16613104907";

declare global {
	interface Window {
		gtag: (
			cmd: "js" | "config" | "event",
			id: string,
			opts?: Record<string, unknown>,
		) => void;
	}
}

function MyApp({ Component, pageProps }: AppProps) {
	const router = useRouter();
	const [adBlocked, setAdBlocked] = useState(false);

	useEffect(() => {
		const handleRouteChange = () => window.scrollTo(0, 0);
		Router.events.on("routeChangeComplete", handleRouteChange);
		return () => Router.events.off("routeChangeComplete", handleRouteChange);
	}, []);

	useEffect(() => {
		const testAdBlock = () => {
			const ad = document.createElement("div");
			ad.className = "adsbox";
			ad.style.cssText =
				"height:1px;width:1px;position:absolute;top:-1px;left:-1px;";
			document.body.appendChild(ad);
			setTimeout(() => {
				const hidden = getComputedStyle(ad).display === "none";
				if (hidden || ad.offsetHeight === 0) setAdBlocked(true);
				ad.remove();
			}, 100);
		};
		const timer = setTimeout(testAdBlock, 2000);
		return () => clearTimeout(timer);
	}, []);

	const handleDismissAdPrompt = useCallback(() => setAdBlocked(false), []);

	useEffect(() => {
		const internalPrefixes = (
			process.env.NEXT_PUBLIC_REACT_APP_INTERNAL_IP_PREFIX || ""
		)
			.split(",")
			.map((p) => p.trim())
			.filter(Boolean);

		const fireGA = (isInternal = false) => {
			if (typeof window.gtag === "function") {
				window.gtag("config", GA_ID, {
					page_path: router.asPath,
					...(isInternal ? { traffic_type: "internal" } : {}),
				});
				window.gtag("config", ADS_ID);
			}
		};

		if (internalPrefixes.length) {
			fetch("https://api64.ipify.org?format=json")
				.then((res) => res.json())
				.then((data) => {
					const ip = data?.ip || "";
					const isInternal = internalPrefixes.some((p) => ip.startsWith(p));
					fireGA(isInternal);
				})
				.catch(() => fireGA(false));
		} else {
			fireGA(false);
		}
	}, [router.asPath]);

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
				<link rel='icon' href='/website-logo-icon.png' />
			</Head>

			<Toaster
				position='top-center'
				toastOptions={{
					duration: 4000,
					success: { style: { background: "green", color: "white" } },
					error: { style: { background: "red", color: "white" } },
				}}
			/>

			<div className={`app-container ${adBlocked ? "blurred" : ""}`}>
				{adBlocked && (
					<div className='adblock-warning'>
						<h2>We Rely on Ads to Keep Our Content Free</h2>
						<p>Please consider pausing AdBlock for our site to support us.</p>
						<button onClick={handleDismissAdPrompt}>I Understand</button>
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
