## 2026-01-21 - Tracked Secrets in Version Control
**Vulnerability:** The root `.env` file containing live API keys (Cloudflare, AISStream, HERE) was tracked in git.
**Learning:** The project lacked a root `.gitignore` file, leading to accidental inclusion of sensitive files.
**Prevention:** Always initialize projects with a `.gitignore` that includes `.env` and other sensitive patterns. Use pre-commit hooks to scan for secrets.

## 2026-01-21 - Inconsistent XSS Sanitization in Vanilla JS
**Vulnerability:** `ProductManager` rendered user input via template literals without sanitization, leading to Stored XSS. `AIAssistant` had its own duplicate sanitization logic.
**Learning:** In Vanilla JS/Vite apps without a framework's automatic escaping, inconsistent ad-hoc sanitization is common.
**Prevention:** Centralized `utils.js` with `escapeHtml` and strict code review ensuring every `innerHTML` or template literal injection uses it.
