# Zero-spend SEO implementation and validation

## Published in GTM PR
- Main app: canonical, unique title/description, OG metadata.
- `/pricing-guide.html`: original interactive markup vs margin calculator, formula and worked example with clear source disclaimer.
- `/compare.html`: linked, verified third-party competitor plans and honest limitations.
- `/custom-setup.html`: free vs optional quote-on-review assisted service; GitHub public issue intake with safety notice.
- `/demo.html`: video guide with captions placeholder until actual media is generated.
- `/privacy.html`: local data/privacy claims based on code, no unsupported compliance claims.
- `/robots.txt`, `/sitemap.xml`, crawlable normal pages instead of hash-only public SEO routes.
- All styles and JS served first-party; Worker CSP preserved.

## Intent priority
1. Transactional-ish long tail: contractor markup calculator, markup vs margin calculator for contractors — excellent free-tool fit; keyword difficulty **not yet measured**.
2. Informational: how to price a contracting job, labor plus materials overhead markup — supported by the utility.
3. Comparison: AutoQuoter vs Joist/Jobber/Contractor+ — low brand interest now, transparent alternative story.
4. Service: custom contractor pricebook setup — low initial search volume hypothesis; high potential intent if need confirmed.
Avoid broad 'best contractor estimating software' keyword until actual experience and customer reviews exist.

## Validation gates requiring user-owned accounts
- Google Search Console: verify a URL-prefix property for https://autoquoter.averymiddlebrook2014.workers.dev/ using a supported method; submit /sitemap.xml; check indexing Coverage and Search Performance. No claim of verification.
- Bing Webmaster Tools: add same site, verify, submit sitemap.
- Don't embed Google Analytics requiring consent/paid tools. Cloudflare Web Analytics can be enabled in owner dashboard on free plan; check privacy requirements first.
- Test canonical HTTP 200 and sitemap XML via deployed CI curl. Confirm site not blocked from robots. Measure mobile Lighthouse/Core Web Vitals with free tools as a follow-up.
- Add new pages only in response to measured query impressions/customer questions. No mass-produced thin pages.

No search ranking, referral traffic, or Google impression count has been observed.

## Actual IndexNow search discovery
An IndexNow ownership text file is hosted in frontend; after successful production deployment, a no-cost action verifies the key and only submits modified indexable HTML pages (not admin/private pages) to api.indexnow.org. HTTP 200/202 means accepted for *processing*, **not** indexing or ranking. Any failure is logged, without failing deployment. Google Search Console and Bing Webmaster ownership are not yet verified. See https://www.bing.com/indexnow/getstarted.
