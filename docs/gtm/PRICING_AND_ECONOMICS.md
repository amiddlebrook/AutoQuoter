# Pricing experiments and unit economics — scenario model

No observed revenue or paid customers. Dollar examples here are hypothetical **targets**, not realized results.

## Three models
1. **Free calculator + assisted service** — no account, optional one-time $199/$299/$399 setup after customer-specific feasibility; manual delivery and no guaranteed demand. Initial validation option.
2. **Subscription at $9 or $19/mo** — competes poorly against Joist/Contractor+/ServiceM8; would require auth, tenant data, paid entitlements, receipts, cancellations, customer support. **Defer**.
3. **Usage-based credits** — unlikely to make sense for deterministic calculator CPU costs near zero. Creates unjustified checkout friction. **Reject**.
4. **One-time downloadable pricebook template** — only after validated reusable, licensed original content; beware vendor material price data rights. Optional longer-term productization.

## Net service examples
Assume a domestic US card processed via Stripe standard 2.9% + $0.30; excludes refunds, support, income tax, sales tax, software, labor, buyer acquisition and dispute fees. Processing fees may vary.
| Nominal price | Payment processing | Collected before delivery labor | If 3h of work | If 8h of work |
|---|---|---|---|---|
| $199 | $6.07 | $192.93 | $64.31/h | $24.12/h |
| $299 | $8.97 | $290.03 | $96.68/h | $36.25/h |
| $399 | $11.87 | $387.13 | $129.04/h | $48.39/h |

If effective delivery time exceeds target, quote more or refuse rather than fulfill at a loss. No universal tax rate or support burden is assumed.
Assuming $299 per project, to reach **gross** revenue of $1k/$3k/$10k in a month requires 4/11/34 jobs respectively. At 3 labor hours each, this would mean 12/33/102 delivery hours *excluding sales*. These are throughput requirements, not predictions. No proven repeatability yet.

## Payment due diligence
- Stripe Payment Links can be created without a fixed monthly charge; 2.9% + $0.30 standard domestic card rate is current published example. Merchant approval, identity, payout delay, taxes, refunds, chargebacks and service category remain relevant.
- PayPal is an alternative if an existing verified account has favorable cash availability.
- A public checkout is premature without a tested deliverable, agreed scope and verified merchant account. Use private hosted project-specific links only after customer approval; verify provider dashboard settlement.
- A modern webhook/entitlement ledger is needed for future self-service SaaS but unnecessary for a manual service proof of demand. Never claim webhooks exist now.
- For model costing, see https://stripe.com/pricing and https://stripe.com/payments/payment-links.

## Acquisition cost
Out-of-pocket advertising $0; human prospecting time **not** $0. Track exact outreach hours, qualification calls, paid conversions, refund costs and rework before describing contribution margin.
