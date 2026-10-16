# AutoQuoter

**Contractor estimating workspace built for Cloudflare Workers Free.** Six trades, transparent line-item pricing, a usable project pipeline, downloadable backups, and GitHub Actions deployment.

[![Cloudflare](https://img.shields.io/badge/runtime-Cloudflare%20Workers-F38020)](https://developers.cloudflare.com/workers/) [![Node](https://img.shields.io/badge/tests-Node%2022-43853D)](https://nodejs.org/) [![Price](https://img.shields.io/badge/required%20services-$0-11ab96)](https://developers.cloudflare.com/workers/platform/pricing/)

> **Pricing honesty:** These are **illustrative planning estimates**, not verified fair-market prices, a certified bid, live BLS wage information, or a trained AI prediction. Confirm local prices, materials, permits, and site conditions before quoting a customer.

## Status

Version 2 repairs the original deployment architecture. The original GitHub repository contained a static-only Cloudflare Worker, while the HTML pages attempted to call a Flask server on \`http://localhost:5000\`. Its dashboard showed mock/random metrics and much of the “ML/integrations” functionality was not production-ready. **The current implementation is fully functional without Flask, Docker, Kubernetes, a purchased domain, database subscriptions, or API keys.**

### Features

- **Interactive quote studio:** HVAC, plumbing, electrical, roofing, landscaping and remodeling; service presets; all 50 states plus Washington, DC; quantity, complexity, urgency and additional materials.
- **Native API:** \`GET /api/health\`, \`GET /api/catalog\`, \`POST /api/quote\`.
- **Explainable math:** labor, materials, overhead (18%) and profit allowance (12%), plus low/typical/high range.
- **Saved estimates:** browser-local pipeline with draft/sent/accepted/declined status, search, filtering and duplication.
- **Insights:** real totals and per-trade summaries calculated only from saved estimates—never pretend analytics.
- **Exports:** print-to-PDF, copy summary, CSV, complete JSON backup and JSON restore.
- **UI:** responsive single-page desktop/mobile workspace with accessible form labels, error messages and empty states.
- **CI/CD:** GitHub Actions tests pull requests and deploys \`master\` to Cloudflare Workers after tests pass.

### Architecture

\`\`\`
  Browser
    ├── Static SPA (HTML/CSS/JS) — Cloudflare Workers Assets
    ├── Quote API (/api/quote) — Cloudflare Worker JavaScript
    └── Estimates + preferences — browser localStorage

  GitHub pull request → Node syntax checks + API unit tests
  GitHub master push → Checks → Wrangler deploy → Cloudflare Workers Free
\`\`\`

The public endpoint **does not send or store customer names, reference numbers or saved estimates**. Those are kept locally in the browser. This is a deliberate no-cost, no-login single-device workspace—not a shared CRM. JSON backups support manual transfers.

## Quick start

Requires Node.js 20+.

\`\`\`bash
git clone https://github.com/amiddlebrook/AutoQuoter.git
cd AutoQuoter
npm test
npm run check
npm run dev
\`\`\`

Wrangler may ask you to log into Cloudflare. Open the local URL printed by Wrangler. There are no packages to install for app runtime; \`npx\` downloads Wrangler when required.

### API request example

\`\`\`bash
curl -X POST http://127.0.0.1:8787/api/quote \
  -H "content-type: application/json" \
  -d '{"trade":"hvac","task":"heatpump","state":"CO","quantity":1,"complexity":"standard","urgency":"flexible","addedMaterials":0}'
\`\`\`

The API validates request size, known job identifiers, states, quantity, timing, complexity and additional-material amounts. The response provides \`low\`, \`median\`, \`high\`, a \`breakdown\` object, a methodology statement and a warning about limitations.

### Pricing approach

\`\`\`
  hours = preset hours × quantity × complexity factor
  labor = hours × trade labor-rate allowance × state multiplier × urgency factor
  materials = (preset allowance × quantity × coarse state adjustment) + extras
  direct cost = labor + materials
  overhead = direct cost × 18%
  profit allowance = (direct cost + overhead) × 12%
  typical = direct cost + overhead + profit allowance
  low = typical × 0.78
  high = typical × 1.28
\`\`\`

Inputs, static hourly allowances, preset material allowances and state multipliers are visible in [src/worker.js](src/worker.js). These are **assumptions selected for prototyping**, not audited 2026 trade price data. The calculation deliberately does not invent provenance, confidence scores, ML models, or real-time external feed access.

## Deploy with GitHub Actions

See **[Cloudflare deployment setup](docs/CLOUDFLARE_SETUP.md)**.

Create a free Cloudflare account and add the following two GitHub Actions repository secrets:

| Secret | Value |
| --- | --- |
| \`CLOUDFLARE_API_TOKEN\` | Cloudflare API token with **Edit Cloudflare Workers** permissions |
| \`CLOUDFLARE_ACCOUNT_ID\` | Your Cloudflare account identifier |

A push to \`master\` after CI passes publishes the \`autoquoter\` Worker, generally at \`https://autoquoter.<your-subdomain>.workers.dev\`. The precise URL depends on your Cloudflare account. The original README previously linked to a deployed URL, but current production availability cannot be proven just by finding that link.

**No paid service is required** for development or modest free-tier operation. Cloudflare Workers Free enforces usage limits; once reached, requests may stop working until the limits reset. Use a free account, not a Workers Paid plan, to avoid usage charges. GitHub Actions for public repositories is generally available without purchasing hosted minutes under GitHub's applicable terms.

## Folder guide

| Path | Purpose |
| --- | --- |
| \`src/worker.js\` | **Production API** and pricing assumptions |
| \`frontend/index.html\` | New single-page workspace |
| \`frontend/styles.css\` | Responsive UI styles |
| \`frontend/app.js\` | Quote client, local pipeline, exports and insights |
| \`tests/worker.test.mjs\` | Quote and HTTP endpoint regression tests |
| \`.github/workflows/cloudflare.yml\` | CI and Workers deployment |
| \`wrangler.toml\` | Current Cloudflare configuration |
| \`backend/\`, \`ml_components/\`, \`n8n_workflows/\` | Preserved **legacy prototypes**, not used in v2 runtime |
| \`Dockerfile\`, \`k8s-deployment.yml\` | Preserved legacy deployment files, not used |

## Security and limitations

- Cross-origin API access is not enabled; application fetches use same-origin relative URLs.
- The Worker validates structured pricing inputs; it does not accept arbitrary pricing-model parameters or run user code.
- Response headers include CSP, nosniff, frame denial, and restrictive browser permissions.
- Estimates in localStorage are **not cross-device synced, backed up automatically or encrypted**. Do not use this version as a regulated customer-record system; export backups regularly.
- The app has **no customer login or verified contractor identity**, payment processing, external CRM sync, authoritative local pricing, ML training, scheduling, or multi-tenant accounts.
- Data-driven geo pricing, D1-backed multi-user workspaces and optional AI should be considered future projects **only when they can be built truthfully and within zero-cost limits**.
- A quote is not a warranty, appraisal, fair-market certification, or binding offer.

## Contributing

Make changes in a branch, run \`npm test && npm run check\`, submit a pull request, and merge after checks pass. No build step is required.

[Cloudflare Workers documentation](https://developers.cloudflare.com/workers/) · [Cloudflare GitHub Actions deployment](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/) · [Report an issue](https://github.com/amiddlebrook/AutoQuoter/issues)
