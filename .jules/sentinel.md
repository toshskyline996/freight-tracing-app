## 2026-01-21 - Tracked Secrets in Version Control
**Vulnerability:** The root `.env` file containing live API keys (Cloudflare, AISStream, HERE) was tracked in git.
**Learning:** The project lacked a root `.gitignore` file, leading to accidental inclusion of sensitive files.
**Prevention:** Always initialize projects with a `.gitignore` that includes `.env` and other sensitive patterns. Use pre-commit hooks to scan for secrets.

## 2026-01-21 - Stored XSS in Product Manager
**Vulnerability:** User input in `ProductManager` was directly interpolated into HTML strings without sanitization, allowing Stored XSS via `localStorage`.
**Learning:** Vanilla JS apps using template literals for DOM generation are highly susceptible to XSS if manual escaping is not strictly enforced.
**Prevention:** Use a shared `escapeHtml` utility for all user input rendering. Prefer modern frameworks or strict DOM creation methods (e.g., `textContent`) over `innerHTML` where possible.
