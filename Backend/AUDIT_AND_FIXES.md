# Backend audit & fixes

Verified here: syntax of every file, Prettier (CI check), undefined variables (ESLint), every relative import/export, every package declared in package.json, 7 unit tests (`npm test`).
NOT verified here (no npm registry / MongoDB in the sandbox): `npm install`, booting the app, real MongoDB/Redis/Brevo/Google calls.

## Critical bugs fixed
| Area | File | Problem | Fix |
|---|---|---|---|
| Auth | service/auth/refreshToken.service.js | Called `updateByTokenHash` (does not exist) -> every `/refresh-token` = 500; stored raw replacement tokens | Atomic rotate (`consumeByTokenHash`), 10 s Redis grace pair for parallel tabs, user/token match check, reuse detection kept |
| Auth | service/auth/auth.service.js | Logout called missing `deleteByToken` -> 500 | `revokeTokenByHash(hashToken(...))`; route no longer needs a valid access token |
| Auth | auth.service.js Login | Lock/failed-attempt code unreachable (password error thrown first); Google users crashed bcrypt (no hash); invalid dummy hash | Lock check first, atomic counter, lock after 5, valid dummy hash |
| Auth | auth.service.js Verify OTP / Google | Response leaked password hash / internal fields | Public fields only |
| Auth | DeleteAccount | Passed `{session}` as session -> always failed; token delete outside transaction | Correct session use, endSession in finally |
| Auth | Google login | No audience check when GOOGLE_CLIENT_ID unset; invalid token -> 500; invalid/duplicate usernames | 503 if unset, 401 on bad token, unique valid username |
| Auth | validators | Login enforced password complexity (blocked valid users) | Only "not empty" on login; added idToken / delete-account validators |
| Security | metricsAuth | Default admin/password fallback; timingSafeEqual threw on length mismatch | No defaults (503 until configured), SHA-256 digest compare |
| Security | tokens | Empty `*_EXPIRES_IN` could issue bad/non-expiring tokens | Central `utils/tokens.js` with 15m / 15d defaults |
| Config | i18n.js | Translation path `cwd/locales` (files are in `src/locales`) -> all messages were keys | Path relative to file; 3 missing keys added (en+hi) |
| Config | server/worker | Env validation ran after imports; EPIPE handler ineffective; worker had no validation | `config/env.js` first import; transient socket errors ignored; CACHE_ENCRYPTION_KEY required |
| Config | CORS/CSRF | Trailing slash / multiple origins broke matching | `CLIENT_URL` comma list, normalised |
| Invoices | repository `findInvoicesNeedingOverdueStatus` | Used "PAID"/"OVERDUE" uppercase -> nightly job marked Paid/Cancelled invoices Overdue | Only Pending/Partially Paid past due |
| Business | service + controller | Update called non-existent repo methods and wrong argument shape -> always 500; no `logo` field; stale cache | Rewritten, whitelist, cache invalidated, `logo` in schema |
| Customers/Products | controllers | `req.language` passed as filters -> search/pagination ignored; frontend expects array in `data` | Pass `req.query`; `data` = array, `pagination` beside it |
| Products | service | Update whitelist had `name` (not productName) and missed `discount`; unescaped regex search; create returned array | Fixed; escaped search; returns document |
| Invoices | service | `termsAndConditions` update dropped; duplicate copied `amountPaid`; Paid invoices had amountPaid 0 (wrong PDF balance/revenue); customerId not stored | Fixed; `customerId` added to schema |
| Dashboard | repository | Used non-existent fields (`items.name`, `items.total`, `$customerId`), wrong shapes vs frontend, revenue always 0, overdue count ignored Overdue status, crashes on bad ids/dates | Rewritten to frontend shapes (old field names kept as aliases), validators added, cache invalidated on writes |
| Misc | error middleware | 5xx internals leaked in production; no JSON 404 | Generic message in prod; JSON 404 |
| Misc | job status endpoints | Any user could read any job status | Owner check |
| DevOps | Dockerfile | `ARG` not available at runtime -> worker image ran empty command; root user | `ENV`, non-root, prod deps |
| DevOps | docker-compose | No worker service; Mongo replica set never initiated (transactions fail); floating `latest` tags | Worker service, auto `rs.initiate`, pinned images |
| DevOps | prometheus | Scrape had no auth (401) and wrong host | basic_auth + `api:8000` |
| DevOps | CI | Wrong env names; `npm test` was a no-op | Correct names; real `node --test` |

## Deliberately NOT changed
- Invoice numbering: first invoice = `invoiceStartNumber + 1` (the frontend documents and tests this; changing it would collide with existing data).
- Response envelope (`statuscode` spelling), routes, status codes, rate-limit values.
- Dependencies/lockfile untouched (could not run npm). `@getbrevo/brevo` is unused; remove later with `npm uninstall @getbrevo/brevo`.

## Remaining / needs your check
- Frontend calls `GET /customer` and `/product` without `limit`, so it only receives the first 10 rows (server default). Add paging or `?limit=100` in the frontend.
- Existing invoices have no `customerId`; "top customers" fills in for new/edited invoices only.
- Mongoose 9 / BullMQ 6 behaviour is unverified at runtime; run the smoke test below.
- Root README says workers start with the API; they run separately (`npm run worker`).
- Google login by a Gmail address with dots may not match a locally registered (dot-stripped) email.
