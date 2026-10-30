# AutoQuoter product audit — 2026-10-30

Scope: CURRENT `master` production runtime at audit, plus proposed PR changes. Evidence: `src/worker.js`, `frontend/index.html`, `frontend/app.js`, `wrangler.toml`, `tests/worker.test.mjs`, `.github/workflows/cloudflare.yml`, `docs/RESTORATION_AUDIT.md`.

| Journey/feature | Observed baseline | Commercial conclusion |
|---|---|---|
| Six-trade quote presets, state factors | Real deterministic code, 51 state/DC codes; only illustrative allowances | Free planning tool, not reliable bids |
| Job-specific user labor/material pricing | Not in baseline; code added in current GTM PR | Must validate UI and API end-to-end |
| Save/status/duplicate/delete | Browser `localStorage` | Single-device use; backup data loss risk |
| CSV and JSON export/import | Client-side logic present | Need real browser tests |
| Print to PDF | Uses browser print | Browser-specific; not hosted PDF service |
| Lead capture, signup, accounts | None | No conversion/purchase tracking |
| Payment, entitlements, refunds | None | Cannot collect fees automatically |
| SaaS recurring billing | None | Do not advertise a paid tier |
| Analytics dashboard | Aggregates *local saved quotes* | No server traffic, sales or revenue data |
| Real customer pricing data | None | Do not claim accurate market pricing |
| Legacy Python/ML/n8n integrations | Preserved files, **not** in runtime | Do not advertise as active |
| Automated tests | Node unit tests and post-deploy Worker smoke checks | Cloudflare live build must be observed after merge |
| Responsive UI | Responsive CSS exists | Browser/mobile E2E not yet run at audit |
| Compliance and security | CSP, basic guards; prior security doc falsely claimed GDPR & AES encryption | Corrected in this PR; **no formal audit** |
| Licensing | No root LICENSE file in repo tree as of audit | No generic open-source license asserted; independently check third-party dependencies |
| Trial, cancellation, recovery | Not applicable (free, no account) | Paid service scope and manual refund rules not implemented |

## Priorities

P0: stop implying illustrative pricing is factual; implement contractor-entered bounded rates and transparent labels. Fix inaccurate security claims.
P1: make SEO landing pages useful, not thin: markup-vs-margin interactive calculator, buyer comparison and account-free workflow.
P1: verify browser quoting, save, status and export; establish truthful full walkthrough.
P2: collect real purchase intent with permission-based outreach and measured engagement; only then develop paid service terms.
P3: add auth/D1/billing **only if** recurring software subscriptions show demand. Avoid storing customer information without a privacy/security plan.

## Test evidence
Baseline last successful cloudflare workflow: https://github.com/amiddlebrook/AutoQuoter/actions/runs/38923678954 (Oct 16 2026). New PR's checks and deployment results must be added to `EXECUTION_LOG.md` when observed. README feature statements are not test results.


## Commercial scorecard — qualitative judgment, not measured conversion probability

Scored 0–10 as of 2026-10-30, based on first-party competitor pages and product inspection. No paid AutoQuoter sales or retention data exist.

| Dimension | Score | Basis |
|---|---:|---|
| Demonstrated willingness to pay for AutoQuoter | 1/10 | Zero verified paying customers or signed offers |
| Competitive differentiation | 3/10 | Account-free transparent math, but competitors offer more capabilities and free tiers |
| Speed to first revenue | 3/10 | Proposed paid setup requires lead, merchant account, and delivery proof |
| Cost/difficulty of acquisition | 3/10 | Search/content free of ad spend but uncertain and potentially slow |
| Technical feasibility | 8/10 | Working deterministic core, browser QA and free deployment |
| Operating margin | 5/10 | Low infrastructure cost, unknown human service labor and support |
| Retention potential | 3/10 | Browser-local, no multi-user collaboration, uncertain repeat paid need |
| Market accessibility at $0 upfront | 6/10 | Free Workers/site/search/community possible, but limited differentiation |
| Long-term scalability | 4/10 | Free worksheet scales technically, one-off human setup does not |
| **Overall risk-adjusted opportunity** | **3/10** | Paid SaaS no-go; narrow service validation only |

**Decision:** NO-GO for another generic paid contractor estimating SaaS. PROCEED with a limited, fully free calculator as a demand-discovery asset, and one-time assisted pricebook setup only if real buyer evidence emerges. Do not conflate the high engineering completion score with business success.
