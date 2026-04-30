/** Escape text that appears inside HTML (e.g. link label). */
export function escapeHtmlText(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Build the same `<a>` snippet the server will keep after sanitization. */
export function buildArticleLinkHtml(urlRaw: string, linkLabel: string): string {
  const u = new URL(urlRaw.trim());
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Only http(s) links are allowed.");
  }
  const hrefEsc = u.href.replace(/"/g, "&quot;");
  const label = (linkLabel.trim() || u.href).slice(0, 500);
  return `<a href="${hrefEsc}" target="_blank" rel="noopener noreferrer">${escapeHtmlText(label)}</a>`;
}

export function insertSnippetAtSelection(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  snippet: string
): { next: string; caret: number } {
  const start = Math.max(0, Math.min(selectionStart, value.length));
  const end = Math.max(start, Math.min(selectionEnd, value.length));
  const next = value.slice(0, start) + snippet + value.slice(end);
  return { next, caret: start + snippet.length };
}
