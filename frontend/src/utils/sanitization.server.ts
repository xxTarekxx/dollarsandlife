/**
 * Centralized sanitization utility for server-side rendering
 * Handles HTML tag removal, entity removal, and Unicode character sanitization
 */

export function sanitizeAndTruncateHTML(input: string, maxLength: number = 160): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Comprehensive sanitization to remove ALL HTML and multi-character entities
  const sanitized = (() => {
    // First, remove script tags and their content completely
    let clean = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

    // Remove all HTML tags using a more robust approach
    clean = clean
      .replace(/<[^>]*>/g, "")  // Remove complete tags
      .replace(/<[^>]*$/g, "")  // Remove incomplete opening tags at end
      .replace(/^[^<]*>/g, "")  // Remove incomplete closing tags at start
      .replace(/<[^>]*/g, "")   // Remove any remaining incomplete opening tags
      .replace(/[^<]*>/g, "");  // Remove any remaining incomplete closing tags

    // Remove HTML entities (including numeric entities)
    clean = clean
      .replace(/&[a-zA-Z0-9#]+;/g, "")
      .replace(/&#[0-9]+;/g, "")
      .replace(/&#x[a-fA-F0-9]+;/g, "");

    // Remove Unicode control characters and other dangerous sequences
    clean = clean.replace(/\p{Cc}/gu, "");

    // Remove zero-width characters and other invisible characters
    clean = clean.replace(/[\u200B-\u200D\uFEFF]/g, "");

    // Normalize whitespace
    clean = clean.replace(/\s+/g, " ");

    return clean.trim();
  })();

  // Use Array.from to handle Unicode characters properly and ensure complete sanitization
  const truncated = Array.from(sanitized).slice(0, maxLength).join('');

  return truncated || '';
}

/**
 * Enhanced sanitization for form inputs that need stricter cleaning
 */
export function sanitizeFormInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Broader regex to find anything that looks like a tag, entity, or dangerous protocol
  const maliciousContentRegex = /<[^>]*>|&[a-zA-Z0-9#]+;|javascript:|data:|vbscript:/gi;

  // Replacement function to be absolutely sure no partial tags/entities remain
  const deepClean = (value: string): string => {
    let sanitized = value;
    let previous;

    // Apply the maliciousContentRegex replacement repeatedly until no more matches are found
    do {
      previous = sanitized;
      sanitized = sanitized.replace(maliciousContentRegex, "");
    } while (sanitized !== previous);

    // Remove any stray angle brackets or ampersands that might be left
    sanitized = sanitized.replace(/[<>&\s]/g, " ").trim(); // Replace with space and then trim

    // Additionally, remove any non-alphanumeric characters for safety
    // but keep spaces, hyphens, and at-symbols for valid inputs.
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s-@.]/g, "");

    return sanitized;
  };

  return deepClean(input);
}

/**
 * Sanitization for URL slugs and identifiers
 */
export function sanitizeSlug(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Broader regex to find anything that looks like a tag or entity
  const htmlEntitiesAndTagsRegex = /<[^>]*>|&[a-zA-Z0-9#]+;/g;

  // Replacement function to be absolutely sure no partial tags/entities remain
  const deepClean = (input: string): string => {
    let sanitized = input;
    let previous;
    do {
      previous = sanitized;
      sanitized = sanitized.replace(htmlEntitiesAndTagsRegex, "");
    } while (sanitized !== previous);

    // Remove any stray angle brackets or ampersands that might be left
    sanitized = sanitized.replace(/[<>&\s]/g, " ").trim(); // Replace with space and then trim

    // Additionally, remove any non-alphanumeric characters for safety in slugs/URLs
    // but keep spaces to be replaced by hyphens later.
    sanitized = sanitized.replace(/[^a-zA-Z0-9\s-]/g, "");

    return sanitized;
  };

  return deepClean(input);
}
