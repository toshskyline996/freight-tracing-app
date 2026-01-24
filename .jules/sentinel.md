## 2026-01-21 - Tracked Secrets in Version Control
**Vulnerability:** The root `.env` file containing live API keys (Cloudflare, AISStream, HERE) was tracked in git.
**Learning:** The project lacked a root `.gitignore` file, leading to accidental inclusion of sensitive files.
**Prevention:** Always initialize projects with a `.gitignore` that includes `.env` and other sensitive patterns. Use pre-commit hooks to scan for secrets.

## 2026-01-21 - Stored XSS in ProductManager
**Vulnerability:** User input for product names/descriptions was directly interpolated into HTML strings in `ProductManager.js` without sanitization.
**Learning:** Vanilla JS template literals are unsafe by default. The project lacked a shared sanitization utility.
**Prevention:** Created `utils.js` with `escapeHtml` and applied it to all output points. Always sanitize data before rendering to `innerHTML`.
