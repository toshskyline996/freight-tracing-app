## 2026-01-21 - Tracked Secrets in Version Control
**Vulnerability:** The root `.env` file containing live API keys (Cloudflare, AISStream, HERE) was tracked in git.
**Learning:** The project lacked a root `.gitignore` file, leading to accidental inclusion of sensitive files.
**Prevention:** Always initialize projects with a `.gitignore` that includes `.env` and other sensitive patterns. Use pre-commit hooks to scan for secrets.

## 2026-01-21 - Stored XSS in Product Manager
**Vulnerability:** User-controlled product data (name, description, etc.) was stored in `localStorage` and rendered via `innerHTML` without sanitization in `ProductManager.renderProductLibrary`.
**Learning:** Client-side storage (`localStorage`) is a common vector for Stored XSS when the application trusts the stored data.
**Prevention:** Always sanitize data retrieved from storage before rendering it to the DOM, using a robust escaping utility like `escapeHtml`.
