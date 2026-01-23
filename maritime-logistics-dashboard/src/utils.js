/**
 * Security utility functions
 */

/**
 * Escapes HTML characters to prevent XSS attacks.
 * @param {string} text - The text to escape.
 * @returns {string} The escaped text.
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
