## 2026-01-21 - Tracked Secrets in Version Control
**Vulnerability:** The root `.env` file containing live API keys (Cloudflare, AISStream, HERE) was tracked in git.
**Learning:** The project lacked a root `.gitignore` file, leading to accidental inclusion of sensitive files.
**Prevention:** Always initialize projects with a `.gitignore` that includes `.env` and other sensitive patterns. Use pre-commit hooks to scan for secrets.

## 2026-01-22 - Stored XSS in Product Manager
**Vulnerability:** `ProductManager.renderProductLibrary` interpolated `localStorage` data directly into HTML using template literals, allowing Stored XSS.
**Learning:** Client-side apps using `localStorage` often neglect output encoding. The lack of a centralized escaping utility contributed to the oversight.
**Prevention:** Always use `escapeHtml` or equivalent sanitization when interpolating variables into HTML strings. Prefer `textContent` or frameworks that auto-escape.
