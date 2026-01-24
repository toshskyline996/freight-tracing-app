/**
 * Sanitizes a string to prevent XSS attacks by escaping HTML characters.
 * @param {string} text - The text to sanitize
 * @returns {string} The sanitized text
 */
export function escapeHtml(text) {
  if (text === null || text === undefined) return '';
  const str = String(text);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
