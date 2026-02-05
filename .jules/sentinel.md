## 2026-01-21 - Tracked Secrets in Version Control
**Vulnerability:** The root `.env` file containing live API keys (Cloudflare, AISStream, HERE) was tracked in git.
**Learning:** The project lacked a root `.gitignore` file, leading to accidental inclusion of sensitive files.
**Prevention:** Always initialize projects with a `.gitignore` that includes `.env` and other sensitive patterns. Use pre-commit hooks to scan for secrets.

## 2026-01-21 - Stored XSS in Product Manager
**Vulnerability:** User input for product details was stored in `localStorage` and rendered via `innerHTML` without sanitization in `ProductManager.js`.
**Learning:** Client-side only apps relying on `innerHTML` for rendering are highly susceptible to XSS if input validation/sanitization is missed.
**Prevention:** Use a centralized sanitization function (`escapeHtml`) for all dynamic content insertion when using `innerHTML`, or prefer `textContent` / `innerText`.
