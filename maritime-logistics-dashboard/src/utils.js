// Security utility functions

/**
 * Escapes HTML special characters to prevent Cross-Site Scripting (XSS) attacks.
 * @param {string} text - The text to escape.
 * @returns {string} - The escaped text safe for HTML insertion.
 */
export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
