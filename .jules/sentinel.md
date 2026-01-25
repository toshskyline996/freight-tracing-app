## 2026-01-21 - Tracked Secrets in Version Control
**Vulnerability:** The root `.env` file containing live API keys (Cloudflare, AISStream, HERE) was tracked in git.
**Learning:** The project lacked a root `.gitignore` file, leading to accidental inclusion of sensitive files.
**Prevention:** Always initialize projects with a `.gitignore` that includes `.env` and other sensitive patterns. Use pre-commit hooks to scan for secrets.

## 2026-01-21 - Unsanitized Client-Side Rendering
**Vulnerability:** User inputs (Product Name, HS Code) were interpolated directly into `innerHTML` strings in `ProductManager`, leading to Stored XSS.
**Learning:** In vanilla JS apps without a framework like React/Vue that auto-escapes, manual sanitization is required for every variable in template strings.
**Prevention:** Use a dedicated `escapeHtml` utility for all dynamic content injected via `innerHTML`.
