export function escapeHtml(text) {
  if (typeof text !== 'string') {
    if (text === null || text === undefined) return '';
    return String(text);
  }
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
