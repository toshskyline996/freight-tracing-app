/**
 * Utility functions for security and common tasks.
 */

/**
 * Escapes HTML characters to prevent Cross-Site Scripting (XSS).
 * @param {string} text - The text to escape.
 * @returns {string} The escaped text.
 */
export function escapeHtml(text) {
  if (!text) return text;
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
