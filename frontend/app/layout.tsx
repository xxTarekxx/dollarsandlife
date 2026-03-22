import type { Metadata } from "next";
import { headers } from "next/headers";
import Script from "next/script";
import { Toaster } from "react-hot-toast";

import { isRtl, supportedLanguages } from "@/lib/i18n/languages";

import "../src/App.css";
import "../src/index.css";

export const metadata: Metadata = {
	title: "Dollars And Life - Personal Finance, Extra Income & Savings",
	description:
		"Dollars And Life offers advice on extra income, budgeting, and saving deals.",
};

function getLangFromPathname(pathname: string): string {
	const segments = pathname.split("/").filter(Boolean);
	const first = segments[0];
	if (first && supportedLanguages.includes(first as never)) return first;
	return "en";
}

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const headersList = await headers();
	const pathname = headersList.get("x-pathname") ?? "";
	const lang = getLangFromPathname(pathname);
	const dir = isRtl(lang) ? "rtl" : "ltr";
	return (
		<html lang={lang} dir={dir} suppressHydrationWarning>
			<head>
				<link rel="icon" type="image/png" href="/website-logo-icon.png" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				{/* Google Fonts — Poppins (headings/nav) + Inter (body) */}
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Inter:wght@400;500;600&family=Playfair+Display:wght@400;700&display=swap" />
				{/* Google Analytics */}
				<script async src="https://www.googletagmanager.com/gtag/js?id=G-S7FWNHSD7P" />
				<script
					dangerouslySetInnerHTML={{
						__html: `
							window.dataLayer = window.dataLayer || [];
							function gtag(){dataLayer.push(arguments);}
							gtag('js', new Date());
							gtag('config', 'G-S7FWNHSD7P');
						`,
					}}
				/>
			</head>
			<body>
				<Toaster
					position="top-center"
					toastOptions={{
						duration: 4000,
						success: { style: { background: "green", color: "white" } },
						error: { style: { background: "red", color: "white" } },
					}}
				/>
				{children}
				{/* Google AdSense — loads after page is interactive, never blocks rendering */}
				<Script
					async
					src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1079721341426198"
					crossOrigin="anonymous"
					strategy="afterInteractive"
				/>
			</body>
		</html>
	);
}
