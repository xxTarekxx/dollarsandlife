/**
 * Centralized sanitization for server-side rendering (getServerSideProps, etc.)
 * Uses DOMPurify + JSDOM - avoids fragile regex-based HTML stripping flagged by CodeQL.
 */

import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";

const purifyWindow = new JSDOM("").window;
// JSDOM Window is compatible at runtime; @types/dompurify expects a narrower WindowLike.
const DOMPurify = createDOMPurify(purifyWindow as Parameters<typeof createDOMPurify>[0]);

/** Strip all HTML to plain text (no tags / script content). */
function stripHtmlToPlainText(input: string): string {
	if (!input || typeof input !== "string") {
		return "";
	}
	let text = DOMPurify.sanitize(input, {
		ALLOWED_TAGS: [],
		ALLOWED_ATTR: [],
		KEEP_CONTENT: true,
	});
	text = text.replace(/\p{Cc}/gu, "");
	text = text.replace(/[\u200B-\u200D\uFEFF]/g, "");
	text = text.replace(/\s+/g, " ");
	return text.trim();
}

export function sanitizeAndTruncateHTML(input: string, maxLength: number = 160): string {
	if (!input || typeof input !== "string") {
		return "";
	}

	const sanitized = stripHtmlToPlainText(input);
	const truncated = Array.from(sanitized).slice(0, maxLength).join("");

	return truncated || "";
}

/**
 * Enhanced sanitization for form inputs that need stricter cleaning
 */
export function sanitizeFormInput(input: string): string {
	if (!input || typeof input !== "string") {
		return "";
	}

	let sanitized = stripHtmlToPlainText(input);

	const maliciousContentRegex =
		/<[^>]*>|&[a-zA-Z0-9#]+;|javascript:|data:|vbscript:/gi;

	let previous: string;
	do {
		previous = sanitized;
		sanitized = sanitized.replace(maliciousContentRegex, "");
	} while (sanitized !== previous);

	sanitized = sanitized.replace(/[<>&\s]/g, " ").trim();
	sanitized = sanitized.replace(/[^a-zA-Z0-9\s-@.]/g, "");

	return sanitized;
}

/**
 * Sanitization for URL slugs and identifiers
 */
export function sanitizeSlug(input: string): string {
	if (!input || typeof input !== "string") {
		return "";
	}

	let sanitized = stripHtmlToPlainText(input);

	const htmlEntitiesAndTagsRegex = /<[^>]*>|&[a-zA-Z0-9#]+;/g;

	let previous: string;
	do {
		previous = sanitized;
		sanitized = sanitized.replace(htmlEntitiesAndTagsRegex, "");
	} while (sanitized !== previous);

	sanitized = sanitized.replace(/[<>&\s]/g, " ").trim();
	sanitized = sanitized.replace(/[^a-zA-Z0-9\s-]/g, "");

	return sanitized;
}
