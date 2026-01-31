## 2026-01-21 - Tracked Secrets in Version Control
**Vulnerability:** The root `.env` file containing live API keys (Cloudflare, AISStream, HERE) was tracked in git.
**Learning:** The project lacked a root `.gitignore` file, leading to accidental inclusion of sensitive files.
**Prevention:** Always initialize projects with a `.gitignore` that includes `.env` and other sensitive patterns. Use pre-commit hooks to scan for secrets.

## 2026-01-21 - Stored XSS in LocalStorage
**Vulnerability:** User input stored in `localStorage` was rendered directly via `innerHTML` in `ProductManager`, allowing Stored XSS.
**Learning:** Client-side storage is trusted source, but data within it is user-controlled and must be treated as untrusted.
**Prevention:** Always escape data retrieved from storage before rendering to HTML, or use safe DOM methods (`textContent`) instead of `innerHTML`.
