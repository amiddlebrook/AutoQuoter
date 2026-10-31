# GTM launch gates

Status is evidence-based; checked boxes mean work actually landed and was verified.
- [x] Existing baseline quote API and app tested in last Oct 16 successful CI.
- [x] Code reviewed for actual routes/storage and legacy false marketing.
- [x] Direct competitors researched from official plan pages.
- [x] New contractor pricebook verified through PR CI + main Cloudflare smoke test (Oct 30).
- [x] Free marketing pages merged and browser/static checks passed; **Google/Bing indexing unverified**.
- [x] Four narrated media outputs generated with free tooling, audio and captions validated, served via Cloudflare after HTTP smoke check (Oct 30).
- [ ] Commercial privacy, licensing, support terms reviewed.
- [ ] Customer-feasibility conversations and verified demand collected.
- [ ] Real testable setup delivery finished for an actual qualifying buyer.
- [ ] Merchant verified; payment link accepted; refund/cancellation policy in signed scope.
- [ ] First paid project transaction confirmed in provider dashboard.
- [ ] Customer fulfillment accepted; costs measured.
- [ ] Google/Bing ownership verification and actual index/performance data (not yet observed).
- [ ] Access to an authorized channel for sending replies/distribution.
- [ ] Evidence of paid customer revenue/positive contribution exists (none verified).

**Not launch complete** merely because git deploy and static marketing pages succeed. Five independent gates: product utility, commerce, discoverability, sales motion and commercial validation.

## Verified release evidence
- PR #3: https://github.com/amiddlebrook/AutoQuoter/pull/3
- Worker main deploy (passed): https://github.com/amiddlebrook/AutoQuoter/actions/runs/41144364426
- Real browser E2E main (passed): https://github.com/amiddlebrook/AutoQuoter/actions/runs/41144364504
- Narrated video render, audio/captions, live Cloudflare redeploy (passed): https://github.com/amiddlebrook/AutoQuoter/actions/runs/41144364331
- Pricebook backup/restore E2E (passed): https://github.com/amiddlebrook/AutoQuoter/actions/runs/41144633875
- Public feedback post: https://github.com/amiddlebrook/AutoQuoter/issues/4

## Added GTM proof (2026-10-30)
- [x] Private, unverified inquiry software built on Cloudflare free storage, 90-day cleanup and consent controls; PR #6.
- [x] Intake fails closed without a configured admin secret; PR #7.
- [x] Live Worker production deploy and lead-status smoke tests passed: https://github.com/amiddlebrook/AutoQuoter/actions/runs/41152970587.
- [x] IndexNow URL change notification was received with HTTP 202, **not** indexing: same run.
- [ ] Cloudflare owner configures `LEADS_ADMIN_TOKEN`, checks private lead review and confirms real visitor submission path is usable.
- [ ] Search Console/Bing Webmaster ownership verified and actual search impressions measured.
- [ ] Any qualified real customer conversations, offers, purchases or revenue (none verified).
