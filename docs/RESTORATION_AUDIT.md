# AutoQuoter restoration audit (2026-10-16)

## Observed in the original master branch

- \`worker.js\` served assets only and had no \`/api/quote\` handler.
- \`frontend/index.html\`, \`dashboard.html\` and \`market-trends.html\` made \`http://localhost:5000\` API requests. Browsers visiting a Cloudflare domain cannot reach another person's localhost Flask backend.
- \`backend/app.py\` referenced \`pricing_engine\` without initialization; \`geo_pricing.py\` expected ML imports not present on the Flask module path without extra runtime manipulation.
- Dashboard statistics were random and activity/market trends were mock data. No data persistence strategy was actually wired.
- The README claimed that integrations, “AI accuracy,” security compliance and external services were ready without evidence that production integration and deployment worked.

## v2 remediation

- Production now uses Workers JS for the quote service and Worker static assets for the entire UI, with same-origin API calls.
- Six-trade job catalog with coarse state allowances, deterministic formula and explicit source disclaimers.
- Quotes, status pipeline, insights and import/export run in browser localStorage.
- Accessible, responsive UI redesign with no frontend framework/CDN or paid dependencies.
- GitHub Actions PR validation and a protected deploy job on \`master\`.
- All legacy Python, Docker, n8n and ML sources are preserved for reference but are **not** represented as operational product features.

## Out of scope / next opportunities

- Real cost index feeds (require licensing/data provenance, ongoing maintenance).
- Verified fair-market certificates (require validated market input and audit process).
- Central persistence/multi-user collaboration (D1 + authentication + data handling controls).
- Full customer pipeline and invoicing integrations (vendor access and OAuth).
- Cross-browser end-to-end tests (can be added via an appropriate free CI test runner).

## Launch verification checklist

- [ ] PR unit tests and frontend checks pass
- [ ] Cloudflare Actions secrets configured by repository owner
- [ ] Merge PR to master
- [ ] GitHub deploy job succeeds
- [ ] Worker health, catalog and quote endpoints respond
- [ ] UI quote/save/status/export/import/print smoke-tested in a browser

A repository code push does not by itself prove that the Cloudflare account is connected or the production endpoint is healthy.
