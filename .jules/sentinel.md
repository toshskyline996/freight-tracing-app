## 2026-01-21 - Tracked Secrets in Version Control
**Vulnerability:** The root `.env` file containing live API keys (Cloudflare, AISStream, HERE) was tracked in git.
**Learning:** The project lacked a root `.gitignore` file, leading to accidental inclusion of sensitive files.
**Prevention:** Always initialize projects with a `.gitignore` that includes `.env` and other sensitive patterns. Use pre-commit hooks to scan for secrets.

## 2026-01-30 - Stored XSS in Product Manager
**Vulnerability:** Stored XSS vulnerability in `ProductManager.js` where user-supplied product data was rendered via `innerHTML` without sanitization.
**Learning:** Vanilla JS applications using `innerHTML` are highly susceptible to XSS if not carefully managed. Ad-hoc sanitization is error-prone.
**Prevention:** Always use a centralized sanitization utility (like `escapeHtml`) or safer DOM manipulation methods (`textContent`) when rendering user input.
