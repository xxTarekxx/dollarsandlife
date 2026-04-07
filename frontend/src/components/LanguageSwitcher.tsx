"use client";

import { usePathname, useRouter } from "next/navigation";
import "./LanguageSwitcher.css";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	isRtl,
	supportedLanguages,
	type SupportedLang,
} from "@/lib/i18n/languages";
import { pathWithoutLang, prefixLang } from "@/lib/i18n/prefixLang";

const LANGUAGE_NAMES: Record<SupportedLang, string> = {
	en: "English",
	es: "Español",
	de: "Deutsch",
	ja: "日本語",
	fr: "Français",
	pt: "Português",
	ru: "Русский",
	it: "Italiano",
	nl: "Nederlands",
	pl: "Polski",
	tr: "Türkçe",
	fa: "فارسی",
	zh: "中文",
	vi: "Tiếng Việt",
	id: "Bahasa Indonesia",
	cs: "Čeština",
	ko: "한국어",
	uk: "Українська",
	hu: "Magyar",
	ar: "العربية",
};

// Maps language code → self-hosted SVG filename in /public/images/flags/
const LANGUAGE_FLAGS: Record<SupportedLang, string> = {
	en: "us",
	es: "es",
	de: "de",
	ja: "jp",
	fr: "fr",
	pt: "br",
	ru: "ru",
	it: "it",
	nl: "nl",
	pl: "pl",
	tr: "tr",
	fa: "ir",
	zh: "cn",
	vi: "vn",
	id: "id",
	cs: "cz",
	ko: "kr",
	uk: "ua",
	hu: "hu",
	ar: "sa",
};

const COOKIE_NAME = "NEXT_LOCALE";

function getCurrentLangFromPath(pathname: string): string {
	const segments = pathname.split("/").filter(Boolean);
	const first = segments[0];
	if (first && supportedLanguages.includes(first as SupportedLang)) {
		return first;
	}
	return "en";
}

function pathWithNewLang(pathname: string, newLang: string): string {
	return prefixLang(pathWithoutLang(pathname), newLang);
}

export default function LanguageSwitcher() {
	const pathname = usePathname() ?? "";
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);
	const basePath = pathWithoutLang(pathname);
	const isForumPath = basePath === "/forum" || basePath.startsWith("/forum/");

	const currentLang = getCurrentLangFromPath(pathname);

	const setDir = useCallback((lang: string) => {
		document.documentElement.dir = isRtl(lang) ? "rtl" : "ltr";
		document.documentElement.lang = lang;
	}, []);

	const selectLang = useCallback(
		(lang: string) => {
			document.cookie = `${COOKIE_NAME}=${lang}; path=/`;
			setDir(lang);
			const newPath = pathWithNewLang(pathname, lang);
			router.push(newPath);
			setOpen(false);
		},
		[pathname, router, setDir]
	);

	useEffect(() => {
		setDir(currentLang);
	}, [currentLang, setDir]);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		if (open) {
			document.addEventListener("click", handleClickOutside);
			return () => document.removeEventListener("click", handleClickOutside);
		}
	}, [open]);

	// Forum content is English-only for now; hide switcher on forum root and subpages.
	if (isForumPath) {
		return null;
	}

	return (
		<div className="language-switcher" ref={containerRef}>
			<button
				type="button"
				className="language-switcher-trigger"
				onClick={() => setOpen((o) => !o)}
				aria-expanded={open}
				aria-haspopup="listbox"
				aria-label="Select language"
			>
				<img
					src={`/images/flags/${LANGUAGE_FLAGS[currentLang as SupportedLang] ?? "us"}.svg`}
					alt=""
					className="language-switcher-globe"
					width={18}
					height={14}
					aria-hidden
				/>
				<span className="language-switcher-code">{currentLang.toUpperCase()}</span>
				<span className="language-switcher-chevron" aria-hidden>▾</span>
			</button>
			{open && (
				<div
					className="language-switcher-dropdown"
					role="listbox"
					aria-label="Language options"
				>
					{supportedLanguages.map((code) => (
						<button
							key={code}
							type="button"
							role="option"
							aria-selected={code === currentLang}
							className={`language-switcher-option ${code === currentLang ? "active" : ""}`}
							onClick={() => selectLang(code)}
						>
							<img
							src={`/images/flags/${LANGUAGE_FLAGS[code]}.svg`}
							alt=""
							className="language-switcher-flag"
							width={18}
							height={14}
							aria-hidden
						/>
							{LANGUAGE_NAMES[code]}
							{code === currentLang && (
								<span className="language-switcher-check" aria-hidden>✓</span>
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
