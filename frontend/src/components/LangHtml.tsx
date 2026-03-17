"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isRtl, supportedLanguages } from "@/lib/i18n/languages";

export function LangHtml() {
	const pathname = usePathname();
	const segments = pathname?.split("/").filter(Boolean) ?? [];
	const lang = segments[0] && supportedLanguages.includes(segments[0] as never)
		? segments[0]
		: "en";

	useEffect(() => {
		const html = document.documentElement;
		html.lang = lang;
		html.dir = isRtl(lang) ? "rtl" : "ltr";
	}, [lang]);

	return null;
}
