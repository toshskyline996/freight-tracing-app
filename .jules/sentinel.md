## 2026-01-21 - Tracked Secrets in Version Control
**Vulnerability:** The root `.env` file containing live API keys (Cloudflare, AISStream, HERE) was tracked in git.
**Learning:** The project lacked a root `.gitignore` file, leading to accidental inclusion of sensitive files.
**Prevention:** Always initialize projects with a `.gitignore` that includes `.env` and other sensitive patterns. Use pre-commit hooks to scan for secrets.

## 2026-01-21 - Stored XSS in Product Manager
**Vulnerability:** User input (product names, descriptions) was rendered directly into the DOM using `innerHTML` without sanitization, allowing Stored XSS via `localStorage`.
**Learning:** The application relies heavily on `innerHTML` for rendering dynamic content, making it prone to XSS if data is not strictly sanitized.
**Prevention:** Use the new `escapeHtml` utility from `src/utils.js` for all user-controlled data before interpolating it into HTML strings.
