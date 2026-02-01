## 2026-01-21 - Tracked Secrets in Version Control
**Vulnerability:** The root `.env` file containing live API keys (Cloudflare, AISStream, HERE) was tracked in git.
**Learning:** The project lacked a root `.gitignore` file, leading to accidental inclusion of sensitive files.
**Prevention:** Always initialize projects with a `.gitignore` that includes `.env` and other sensitive patterns. Use pre-commit hooks to scan for secrets.

## 2026-01-21 - Unsanitized HTML String Building
**Vulnerability:** `ProductManager.js` constructed HTML strings using user input (`products.map`) without sanitization, leading to Stored XSS.
**Learning:** Vanilla JS applications that build UI via `innerHTML` and template literals are highly prone to XSS if input isn't explicitly sanitized.
**Prevention:** established `src/utils.js` with `escapeHtml`. All module rendering logic must import and wrap variable interpolations with this function.
