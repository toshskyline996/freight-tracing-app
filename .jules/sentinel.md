## 2026-01-21 - Tracked Secrets in Version Control
**Vulnerability:** The root `.env` file containing live API keys (Cloudflare, AISStream, HERE) was tracked in git.
**Learning:** The project lacked a root `.gitignore` file, leading to accidental inclusion of sensitive files.
**Prevention:** Always initialize projects with a `.gitignore` that includes `.env` and other sensitive patterns. Use pre-commit hooks to scan for secrets.

## 2026-01-21 - Stored XSS in Product Manager
**Vulnerability:** User inputs (Product Name, Description, HS Code) were stored in `localStorage` and subsequently rendered via `innerHTML` without sanitization.
**Learning:** Client-side storage (`localStorage`) is a persistence vector for Stored XSS. `innerHTML` is dangerous when handling data from any storage source.
**Prevention:** Always sanitize data using `escapeHtml` before interpolating it into HTML strings, even if the data comes from "internal" storage.
