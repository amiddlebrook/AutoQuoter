# Cloudflare deployment: AutoQuoter v2

This deployment requires **no paid infrastructure**, Docker, Python, external database, custom domain, or external service API.

## 1. Confirm the free plan

Sign into [Cloudflare](https://dash.cloudflare.com) and use the **Workers Free** plan. Cloudflare has usage limits on the free plan; if you hit them, the site can be throttled or error until the limit resets. Do not upgrade to a paid plan if the project must remain zero cost.

## 2. Grant a CI deploy token

Create an API token from the Cloudflare dashboard:

- Token permission: **Account → Workers Scripts → Edit** (Cloudflare's "Edit Cloudflare Workers" template).
- Account scope: the account where you will host the app.
- Keep the token private.

Copy your Cloudflare **Account ID** from the Cloudflare dashboard.

## 3. Create GitHub Actions secrets

In this repository:

\`Settings → Secrets and variables → Actions → New repository secret\`

Create:

- \`CLOUDFLARE_API_TOKEN\` (the API token)
- \`CLOUDFLARE_ACCOUNT_ID\` (your Cloudflare account ID)

**Never commit these values** to a source file, pull request or log.

## 4. Run CI and deploy

The workflow is [.github/workflows/cloudflare.yml](../.github/workflows/cloudflare.yml).

- Every pull request runs syntax checks, HTTP endpoint tests and asset checks.
- A push to \`master\` runs those checks, then executes \`wrangler deploy\` using the two secrets.
- The Worker name is **autoquoter** and static files come from \`frontend/\`.
- GitHub Actions will show the deployment URL in the publish step.

With an existing \`autoquoter\` Worker under the same Cloudflare account, deploying with the same name can replace that Worker's existing code. Check your account and intended production target before merging. There are no database migrations.

## 5. Verify the deployment

Open:

- \`https://autoquoter.<your-cloudflare-subdomain>.workers.dev/\`
- \`https://autoquoter.<your-cloudflare-subdomain>.workers.dev/api/health\`

Expected health JSON:

\`\`\`json
{"status":"ok","engine":"cloudflare-worker","dataSource":"illustrative planning assumptions"}
\`\`\`

On the website, calculate a heat pump estimate, save it, change its pipeline status, print it, download a JSON backup, and reload to confirm browser-local persistence.

## Local development

\`\`\`powershell
git clone https://github.com/amiddlebrook/AutoQuoter.git
cd AutoQuoter
npm test
npm run check
npx wrangler@4 dev
\`\`\`

No Cloudflare API token is needed for local quote calculations. Login might be required by Wrangler for some commands, but the local Worker itself does not depend on any paid service.

## Cost model

| Component | Minimum recurring cost |
| --- | --- |
| Cloudflare Workers Free API | $0 within free limits |
| Cloudflare static assets | $0 within free limits |
| Local estimates | $0 (browser storage) |
| GitHub repo and public Actions | $0 under eligible free usage |
| Domain | $0 (use \`.workers.dev\`) |
| External pricing API, AI, database | None required |

**Important:** no host can promise unconditional unlimited traffic at zero dollars. This design requires no paid tiers and is subject to provider quotas.

## Troubleshooting

**The page loads but quoting fails:** Try \`/api/health\` and \`/api/catalog\`; deploy the current \`src/worker.js\` from GitHub's main branch. Ensure Wrangler uses the repository root.

**GitHub deployment fails authentication:** Confirm both secrets and token permissions, and that the token belongs to the Cloudflare account ID supplied.

**The UI shows no saved estimates after switching browsers:** Estimates live in **this browser's localStorage**. Export/import JSON if moving browsers or devices. Incognito profiles and cleared browser storage cannot be recovered.

**Your old dashboard routes look broken:** v2 redirects the legacy HTML routes to the new workspace. Bookmark \`/\` and use the application navigation.

**You need live pricing, user accounts, or D1 storage:** Those are outside this honest, zero-cost restoration. Never imply a static planning model is live local market data.
