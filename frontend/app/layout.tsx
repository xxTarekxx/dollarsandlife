import type { Metadata } from "next";
import { headers } from "next/headers";
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
			</body>
		</html>
	);
}
