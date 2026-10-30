# AutoQuoter production security and privacy facts (2026-10-30)

This document supersedes the pre-restoration generic compliance claims. The Cloudflare implementation is **not** an audited GDPR/CCPA/HIPAA compliance solution.

## What exists
- Cloudflare Worker + static frontend, same-origin `/api/quote` and `/api/catalog`.
- Stateless quote calculations; the Worker does **not** store client names or saved quotes.
- User-saved estimates and optional per-job pricebook are stored in localStorage on the current browser only, unencrypted. People with access to the device/browser profile can read them.
- Quote POST bodies are validated against known trades, tasks, 51 states, complexity/urgency enum, bounded numeric fields, 8 KiB request limit; unknown custom pricebook keys are rejected.
- Basic response security headers (CSP, X-Frame-Options, nosniff, restrictive permissions) are set by the Worker.
- CSV export protects leading spreadsheet formula characters; UI escapes user-generated text before injecting HTML.
- No cross-origin authorization is enabled, and no login/auth system, billing, D1, regulated record storage, or OAuth exists in the production runtime.

## Gaps / restrictions
- Cloudflare/TLS configuration and certificate issuer vary by platform, and a generic README cannot certify TLS 1.3 across all clients.
- No product-specific penetration test, SOC 2, formal compliance certification, abuse quota, user authentication, encrypted browser storage or server-side account deletion workflow.
- No IP-based rate limiter. Daily Worker Free request quotas are not per-user protection.
- A deleted browser profile clears local records; export JSON regularly. Multiple devices are not synced.
- Don't enter regulated customer data, payment card data, secret customer records, or supplier trade secrets unless you understand browser-local storage risks. The pricebook config crosses the network for the calculation but is not persisted by this Worker.
- All estimate outputs—including contractor-entered rates—need human verification for permits, tax, actual scope and local cost. No model claims predictive accuracy or warranties.
- The legacy Python/ML/n8n files are excluded from the current deployment and their older documentation does not represent production protections.
