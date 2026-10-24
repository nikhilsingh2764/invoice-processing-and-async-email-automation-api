# Security

## Reporting a vulnerability

Email the address in `src/config/site.js` (`securityEmail`) and in `public/.well-known/security.txt`. Please include steps to reproduce and give us reasonable time to fix the problem before sharing it. Do not include real customer data.

## What the frontend does

| Area | Control | Where |
|---|---|---|
| Sessions | HttpOnly, Secure cookies set by the API. Tokens and user objects are never stored in the browser. | `src/api/client.js`, `src/lib/storage.js` |
| Refresh | Single-flight refresh, only for the three documented token 401 messages, never for auth routes, retried once. | `src/api/client.js` |
| Same origin | The app talks to `/api/v1` on its own origin (dev proxy, `vercel.json` rewrite, `_redirects`). A custom `X-Requested-With` header is sent on writes. Absolute URLs are refused (`allowAbsoluteUrls: false`). | `vite.config.js`, `vercel.json` |
| CSP and headers | Strict CSP (no inline or eval scripts, `object-src 'none'`, `frame-ancestors 'none'`), HSTS, nosniff, Referrer-Policy, Permissions-Policy, COOP/CORP. `vercel.json` and `public/_headers` are kept identical by a test. | `vercel.json`, `public/_headers`, `tests/headers-sync.test.js` |
| Open redirect | `next` must be a same-origin path; double encoding, backslashes, schemes and control characters are rejected. | `src/lib/security.js` |
| Untrusted URLs | `safeUrl` allows only https (http on localhost in dev). External links use `noopener noreferrer`. | `src/lib/security.js`, `ExternalLink.jsx` |
| Downloads | PDF content type and `%PDF-` magic bytes are checked; filenames are sanitised; downloads use an anchor, never an iframe. | `src/api/pdf.js` |
| Account safety | Password denylist, OTP lock after 5 wrong codes, neutral forgot-password message (no account enumeration), generic login error. | `src/lib/password.js`, `src/lib/otp.js`, auth pages |
| Session hygiene | 30 minute idle timeout with warning, multi-tab logout, back/forward-cache revalidation, query cache cleared on sign-out. | `useIdleTimeout.js`, `useAuth.jsx`, `authChannel.js` |
| Browser storage | One facade with a registry, a validator per key, a token detector and a test that fails on any other use of `localStorage`. | `src/lib/storage.js`, `tests/source-scan.test.js` |
| Privacy in errors | Error reports are scrubbed of emails, long numbers and tokens. No console output in production builds. | `src/lib/report.js`, `vite.config.js` |
| Supply chain | Exact versions for React, zod, Tailwind and clsx; `engine-strict`; `npm audit` and Dependabot in CI. | `package.json`, `.npmrc`, `.github/` |

## What it does not do

- It does not replace backend security. Authorisation, rate limits, input validation and CSRF defences must be enforced by the API.
- Source maps are off in production. If you enable them, serve them only to your error tracker.
- No certification (SOC 2, ISO 27001, PCI) is claimed anywhere.

## Open items for the owner

See the README section "Before you go live".
