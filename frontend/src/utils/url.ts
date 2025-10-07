/**
 * URL utility functions to prevent double URL prepending
 */

/**
 * Converts a URL to absolute format, handling both relative and absolute URLs safely
 * @param input - The URL to convert (can be relative or absolute)
 * @param base - The base URL to use for relative URLs
 * @returns Absolute URL string
 */
export function toAbsoluteUrl(input: string | undefined | null, base: string): string {
  if (!input) return base;
  if (/^https?:\/\//i.test(input)) return input; // already absolute
  return new URL(input, base).href;
}

/**
 * Gets the base URL for the current environment
 * @returns Base URL string
 */
export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_SITE_URL || 'https://www.dollarsandlife.com';
}

/**
 * Safely constructs a canonical URL
 * @param path - The path to make canonical
 * @param baseUrl - Optional base URL, defaults to getBaseUrl()
 * @returns Canonical URL string
 */
export function getCanonicalUrl(path: string, baseUrl?: string): string {
  const base = baseUrl || getBaseUrl();
  return toAbsoluteUrl(path, base);
}

/**
 * Safely constructs a URL for JSON-LD structured data
 * @param path - The path for the URL
 * @param baseUrl - Optional base URL, defaults to getBaseUrl()
 * @returns URL string for JSON-LD
 */
export function getJsonLdUrl(path: string, baseUrl?: string): string {
  return getCanonicalUrl(path, baseUrl);
}
