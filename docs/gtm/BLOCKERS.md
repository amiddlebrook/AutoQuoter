# Current blockers and owner-authorization requirements

## Must be solved before *commercial launch*
- **Real demand:** no verified qualified leads, buyer interviews or willingness-to-pay data from AutoQuoter; do not infer purchases from competitor prices.
- **Deliverable:** personalized pricebook setup and written SOW, support expectations and test cases must be proven against a real buyer need.
- **Merchant identity:** payment account approval and payout bank/tax verification require account-owner access; no API key provided or generated. Do not enable a fake checkout link.
- **Support/private intake:** public GitHub issues are unsuitable for customer prices and identity; need permissioned private channel before paid work.
- **Security/licensing/legal:** no production security audit; old docs had false claims; localStorage not encrypted; custom pricebooks entered in quote API. Terms and compliance require review.

## SEO/distribution
- GSC and Bing Webmaster Tools require verification from owner accounts; sitemap itself can be deployed without them.
- YouTube upload requires account authorization. Repository CI can generate a tutorial with open-source tools but cannot upload to a personal YouTube account without credentials/permission.
- Public community rules often restrict self-promotion. Don't use WordPress.org support forums for solicitation.

## Spending
- $0 advertising, domains, paid software/API subscriptions. Processing fees after a sale are not upfront spend, but refunds/chargebacks can incur negative balances. Cloudflare Free limits remain applicable.

## Next most valuable action
Test end-to-end contractor input price math and browser persistence; then get independent proof from a real user willing to compare self-service vs paid setup before building any SaaS payments.

## Owner-only inquiry review secret
- New free Cloudflare Durable Object stores first-party, unverified feasibility inquiries, with no email notification. Set Cloudflare Worker secret `LEADS_ADMIN_TOKEN` to a random >=24-character value (via Cloudflare dashboard). Only then can the operator access `/lead-admin.html`. Never commit tokens or put them in browser localStorage.
- No verified submissions, sales or replies are implied by deploying this intake; manual lead review is required. No email blasts or paid campaigns.

## Current exact action required to enable private inquiries
The Worker expects an account-owner secret named `LEADS_ADMIN_TOKEN`, random 24+ characters. Add it in Cloudflare dashboard → Workers & Pages → autoquoter → Settings → Variables and Secrets. Without the secret, `GET /api/leads/status` honestly reports `accepting:false`; the form never sends PII; only the public GitHub fallback remains. When enabled, operator can review inquiries privately at `/lead-admin.html`. Email notification has not been configured. Stripe merchant identity and checkout are separate blockers. The HTTP 202 from IndexNow is **not** proof of indexing or organic clicks.
