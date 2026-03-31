/**
 * Utility functions for the application
 */

/**
 * Escapes HTML special characters to prevent XSS attacks.
 * @param {string|number} text - The text to escape.
 * @returns {string} The escaped text.
 */
export function escapeHtml(text) {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
