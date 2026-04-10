"use client";

import { usePathname } from "next/navigation";
import "./LanguageSwitcher.css";
import React, {
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
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

const LANGUAGE_SWITCH_MESSAGES: Record<SupportedLang, string> = {
	en: "Switching language...",
	es: "Cambiando idioma...",
	de: "Sprache wird gewechselt...",
	ja: "言語を切り替えています...",
	fr: "Changement de langue...",
	pt: "Mudando idioma...",
	ru: "Переключение языка...",
	it: "Cambio lingua in corso...",
	nl: "Taal wordt gewijzigd...",
	pl: "Zmiana języka...",
	tr: "Dil değiştiriliyor...",
	fa: "در حال تغییر زبان...",
	zh: "正在切换语言...",
	vi: "Đang chuyển ngôn ngữ...",
	id: "Mengganti bahasa...",
	cs: "Přepínání jazyka...",
	ko: "언어를 전환하는 중...",
	uk: "Зміна мови...",
	hu: "Nyelv váltása...",
	ar: "جارٍ تبديل اللغة...",
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

function getCurrentLangFromPath(pathname: string): SupportedLang {
	const segments = pathname.split("/").filter(Boolean);
	const first = segments[0];
	if (first && supportedLanguages.includes(first as SupportedLang)) {
		return first as SupportedLang;
	}
	return "en";
}

function pathWithNewLang(pathname: string, newLang: string): string {
	return prefixLang(pathWithoutLang(pathname), newLang);
}

export default function LanguageSwitcher() {
	const pathname = usePathname() ?? "";
	const [open, setOpen] = useState(false);
	const [switchingTo, setSwitchingTo] = useState<SupportedLang | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const basePath = pathWithoutLang(pathname);
	const isForumPath = basePath === "/forum" || basePath.startsWith("/forum/");
	const [articleAvailableLangs, setArticleAvailableLangs] = useState<SupportedLang[] | null>(null);

	const currentLang = getCurrentLangFromPath(pathname);

	const setDir = useCallback((lang: string) => {
		document.documentElement.dir = isRtl(lang) ? "rtl" : "ltr";
		document.documentElement.lang = lang;
	}, []);

	const clearPendingSwitch = useCallback(() => {
		setSwitchingTo(null);
	}, []);

	const selectLang = useCallback(
		(lang: SupportedLang) => {
			if (lang === currentLang) {
				setOpen(false);
				return;
			}

			const newPath = pathWithNewLang(pathname, lang);
			document.cookie = `${COOKIE_NAME}=${lang}; path=/; max-age=31536000; SameSite=Lax`;
			setDir(lang);
			setSwitchingTo(lang);
			setOpen(false);
			window.location.assign(newPath);
		},
		[currentLang, pathname, setDir],
	);

	useEffect(() => {
		setDir(currentLang);
	}, [currentLang, setDir]);

	useEffect(() => {
		if (switchingTo && currentLang === switchingTo) {
			clearPendingSwitch();
		}
	}, [clearPendingSwitch, currentLang, switchingTo]);

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

	if (isForumPath) {
		return null;
	}

	const availableLanguages = articleAvailableLangs ?? getLanguagesForPath(basePath);
	const enabledLanguages = new Set(
		availableLanguages.filter((l): l is SupportedLang =>
			supportedLanguages.includes(l as SupportedLang),
		),
	);
	const dropdownLanguages = [...supportedLanguages];
	if (dropdownLanguages.length <= 1) return null;

	return (
		<>
			<div className="language-switcher" ref={containerRef}>
				<button
					type="button"
					className="language-switcher-trigger"
					onClick={() => setOpen((o) => !o)}
					aria-expanded={open}
					aria-haspopup="listbox"
					aria-label="Select language"
					disabled={Boolean(switchingTo)}
				>
					<img
						src={`/images/flags/${LANGUAGE_FLAGS[currentLang] ?? "us"}.svg`}
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
						{dropdownLanguages.map((code) => {
							const isEnabled = enabledLanguages.has(code) || code === currentLang;
							return (
							<button
								key={code}
								type="button"
								role="option"
								aria-selected={code === currentLang}
								aria-disabled={!isEnabled}
								className={`language-switcher-option ${code === currentLang ? "active" : ""} ${!isEnabled ? "disabled" : ""}`}
								onClick={() => {
									if (!isEnabled) return;
									selectLang(code);
								}}
								disabled={!isEnabled}
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
							);
						})}
					</div>
				)}
			</div>

			{switchingTo && (
				<div
					className="language-switcher-overlay"
					role="status"
					aria-live="polite"
					aria-busy="true"
				>
					<div className="language-switcher-overlay-card">
						<div className="language-switcher-spinner" aria-hidden />
						<p className="language-switcher-overlay-text">
							{LANGUAGE_SWITCH_MESSAGES[switchingTo]}
						</p>
						<p className="language-switcher-overlay-lang">
							{LANGUAGE_NAMES[switchingTo]}
						</p>
					</div>
				</div>
			)}
		</>
	);
}
