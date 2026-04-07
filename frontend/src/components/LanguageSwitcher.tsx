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
import { getLanguagesForPath } from "@/lib/i18n/translationStatus";

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
const ARTICLE_PATH_PREFIXES = [
	"/breaking-news/",
	"/start-a-blog/",
	"/extra-income/budget/",
	"/extra-income/freelance-jobs/",
	"/extra-income/remote-online-jobs/",
	"/extra-income/money-making-apps/",
	"/shopping-deals/products/",
	"/forum/post/",
];

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
	const [articleAvailableLangs, setArticleAvailableLangs] = useState<SupportedLang[] | null>(null);

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

	useEffect(() => {
		const isArticlePath = ARTICLE_PATH_PREFIXES.some((p) => basePath.startsWith(p));
		if (!isArticlePath) {
			setArticleAvailableLangs(null);
			return;
		}
		const nextData = (window as Window & {
			__NEXT_DATA__?: {
				props?: { pageProps?: { post?: { availableLangs?: string[] } } };
			};
		}).__NEXT_DATA__;
		const langs = nextData?.props?.pageProps?.post?.availableLangs;
		if (Array.isArray(langs) && langs.length > 0) {
			const filtered = langs.filter((l): l is SupportedLang =>
				supportedLanguages.includes(l as SupportedLang),
			);
			setArticleAvailableLangs(filtered.length > 0 ? filtered : null);
		} else {
			setArticleAvailableLangs(null);
		}
	}, [basePath]);

	// Forum content is English-only for now; hide switcher on forum root and subpages.
	if (isForumPath) {
		return null;
	}

	const availableLanguages = articleAvailableLangs ?? getLanguagesForPath(basePath);
	const dropdownLanguages = availableLanguages.filter((l): l is SupportedLang =>
		supportedLanguages.includes(l as SupportedLang),
	);
	if (dropdownLanguages.length <= 1) return null;

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
					{dropdownLanguages.map((code) => (
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
