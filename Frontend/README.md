# InvoicePilot Frontend

React 19 + Vite + Tailwind 4 single-page app for the InvoicePilot API (Express 5, MongoDB, Redis, BullMQ). Drop this `Frontend/` folder next to `Backend/`, install, fill in the placeholders, run.

> **Read "What was and was not verified" before you rely on this.** The build environment this was produced in could not reach the npm registry, so `npm install`, the production build, ESLint and the real Vitest run have **not** been executed.

## Quick start

```bash
cd Frontend
npm install            # commit the generated package-lock.json
cp .env.example .env   # then edit
npm run dev            # http://localhost:5173, proxies /api to VITE_PROXY_TARGET
```

No backend handy? `npm run dev:mock` starts a local mock of the API plus Vite. Sign in with `demo@example.com` / `Demo@1234`; signup and password-reset OTPs are always `123456`.

| Script | What it does |
|---|---|
| `dev`, `dev:mock` | Vite dev server (against your API, or against the mock) |
| `build`, `preview` | Production build and local preview (preview sends the same security headers as `vercel.json`) |
| `lint` | ESLint (react, hooks, jsx-a11y, plus rules that ban `dangerouslySetInnerHTML`, `eval`, direct `localStorage`, `console`) |
| `test` | Vitest (jsdom) |
| `contrast` | Recomputes every colour pair and rewrites `docs/contrast.md`; fails on a miss |
| `check:bundle` | After a build: entry chunk budget, recharts must stay in its own chunk, no dev code in production |
| `audit`, `verify` | `npm audit --audit-level=high`; `verify` runs lint, contrast, test, build, bundle check and audit |

## Configuration

`.env` (only `VITE_*` values reach the browser; none of them are secrets):

| Variable | Meaning |
|---|---|
| `VITE_API_BASE_URL` | Default `/api/v1` (same-origin proxy mode, recommended). A full URL switches to direct mode. |
| `VITE_PROXY_TARGET` | Where the dev proxy sends `/api` (your backend, for example `http://localhost:8000`). |
| `VITE_GOOGLE_CLIENT_ID` | Optional. Enables the Google button; the Google script loads only when this is set. |
| `VITE_CSRF_HEADER` | Direct mode only: `true` sends `X-Requested-With` cross-origin too. |

### Why same-origin proxy mode

Authentication lives in HttpOnly cookies (`accessToken` 15 min, `refreshToken` 15 days). Serving the app and `/api` from one origin means no CORS, no third-party-cookie problems and `SameSite=Lax` cookies just work. Pick one:

- **Vercel:** edit the `destination` of the `/api/v1` rewrite in `vercel.json`.
- **Netlify / Cloudflare Pages:** edit `public/_redirects` (the first line proxies `/api/*`).
- **Direct mode:** set `VITE_API_BASE_URL=https://api.example.com/api/v1`, set `CLIENT_URL` on the backend, add the API origin to `connect-src` in **both** `vercel.json` and `public/_headers` (a test checks they match), and make sure the backend cookies are `SameSite=None; Secure`.

## Before you go live (owner's fill-in list)

1. Replace every `REPLACE_ME` in `src/config/site.js` (company name, address, support, security, privacy and grievance contacts, Grievance Officer, dates, site URL). `grep -rn REPLACE_ME src public` finds the rest (`security.txt`, `sitemap.xml`, `robots.txt`, a few legal sentences).
2. **Have a lawyer review the legal pages.** They are templates written from what the code does, not legal advice, and they contain `REPLACE_ME` items (retention, processors, jurisdiction).
3. Set the proxy target in `vercel.json` or `public/_redirects`, and `VITE_GOOGLE_CLIENT_ID` if you want Google sign-in.
4. Run `npm install`, commit `package-lock.json`, then run `npm run verify` and fix whatever it reports. Dependency versions in `package.json` were written without registry access, so check them (React, zod, Tailwind and clsx are pinned exactly; the rest use `^` ranges).
5. Review the backend requests below, especially B-1.
6. Do a manual screen-reader pass (NVDA/VoiceOver) and update `src/pages/public/Accessibility.jsx` with the result.

## Differences between the prompt and the backend source

Where the two disagreed the source won. What changed in the UI:

| Topic | Prompt said | Source says | What the frontend does |
|---|---|---|---|
| Validation errors | Only `message` | 400s also carry an `errors` array | Mapped onto form fields (`src/api/errors.js`, `src/lib/forms.js`) |
| Dashboard pagination total | `pagination.totalInvoices` | `pagination.totalDocs` | Adapter accepts both |
| PDF / email jobs | No status route | `GET /invoice/pdf/status/:jobId` and `/invoice/email/status/:jobId` exist | PDF: after a 202 the job status is polled, then the PDF is fetched **once** (polling the PDF URL would queue a new job on every cache miss). Falls back to polling the URL if the status route is missing. Email: the toast says "Queued", then reports delivered or failed. |
| Login errors | Generic only | 400 for unknown email, wrong password, unverified, inactive and Google accounts; 429 for lock (5 failures, 15 min) | Wrong password and unknown email show one generic message; the other states get a clear explanation; 429 disables submit with a countdown |
| OTP | No attempt info | Server limits attempts | UI locks after 5 wrong codes and offers only "Start again" |
| Invoice number | `PREFIX-start` | The counter is incremented first, so the first invoice is `PREFIX-(start+1)` | Previews use the real rule |
| Money | n/a | Server rounds each step to paise | `src/lib/money.js` replicates it for live totals (server is final) |
| Language | n/a | `Accept-Language` selects translated messages | UI is English only; server messages shown as sent |

### Backend requests (not fixed by the frontend)

- **B-1 (blocking in the attached snapshot).** `src/service/dashboard/dashboard.service.js` calls seven repository methods (`getDashboardStats`, `getInvoiceList`, `getRevenueChart`, `getInvoiceStatusChart`, `getTopCustomers`, `getTopProducts`, `getRecentInvoices`), but `src/repository/dashboard/dashboard.repository.js` defines only the first two, so `GET /dashboard` would throw. The invoice list, the dashboard and "needs attention" all depend on that endpoint (there is no list-invoices route). Also, `getDashboardStats` sums `$amountPaid`, a field that is not in the invoice model, so "paid revenue" would always be 0. The frontend shows an error state with a retry button rather than inventing numbers. I could only read the code, not run it, so confirm against your real running backend.
- **B-2.** Invoices store no `customerId`, so the dashboard customer filter and "top customers" cannot work. The UI hides the filter (`FEATURES.customerFilter = false`) and explains the empty "top customers" card.
- **B-3.** `topProducts` are returned unsorted; the UI sorts by quantity.
- **B-4.** Dashboard totals are cached up to 10 minutes; the UI says so and patches caches optimistically.
- **B-6.** No resend-OTP route (the UI offers "Start again").
- **B-7.** Google accounts get a 400 "cannot use password authentication" on change-password and delete-account; there is no `provider` flag on `/profile`. A flag would let the UI hide those forms instead of reacting to the error.
- **B-8.** No contact route (Support page uses `mailto:`).
- **B-9.** A PDF request that misses the cache queues a new job each time it is repeated. Consider returning the existing job id.
- **B-10.** The email status route is useful; consider also returning the failure reason.

## Security

See `SECURITY.md` for the table of controls and where each lives. Highlights: same-origin cookies only, single-flight token refresh, strict CSP identical in `vercel.json` and `public/_headers`, open-redirect-safe `next`, URL and filename sanitisers, PDF magic-byte check, one storage facade that a test enforces, idle timeout, multi-tab logout, no account enumeration on forgot-password, PII-scrubbed error reports.

## Design

Every screen is an "Invoice Document": a sheet made of letterhead, meta strip, parties, ledger, totals and notes, with at most one signature flourish (fold, stamp, perforation or paper stack) per viewport. Tokens live in `src/theme/tokens.css` (light and dark), components in `components.css`, the document pattern in `patterns.css`, motion in `motion.css` (all motion is off under `prefers-reduced-motion`). Brand orange `#F26A1B` carries ink text; orange text on light uses `#C2410C`. The focus ring uses `#C2410C` in light mode because the lighter orange is only 2.9:1 on the page background. `docs/contrast.md` lists every pair (70 checked, 0 failing; the one deliberate exception is documented there). Run the dev server and open `/__styleguide` to see every component in both themes (dev and mock builds only).

### Browser support

Evergreen Chrome, Edge, Firefox and Safari. Layouts use container queries, `:has()`, `color-mix()` and logical properties. Where container queries are missing, `theme-init.js` sets `data-legacy` and a calm banner explains the simplified layout.

## Project layout

```
src/api         axios client, adapters, endpoints, payload whitelists, PDF flow, query keys
src/hooks       auth, theme, queries, idle timeout, hotkeys, PDF/email actions
src/lib         security, storage facade, money maths, validators (zod), password rules
src/components  ui/, sheet/ (document pattern), layout/, forms/, charts/ (lazy), public/
src/pages       public/, legal/, auth/, app/, dev/
tools           mock API, dev launcher, contrast and bundle checks, icon generator
tests           unit, contract (mock API), source-scan and header-sync tests
```

Patterns used on purpose: adapter (API shapes to UI models), factory (query keys), strategy (money and date formatters), facade (storage), observer (cross-tab auth channel), state machines (PDF flow, OTP entry), compound components (Modal), command (delete with undo).

## What was and was not verified

Run for real in the build environment:

- Every source file parses (esbuild), and the whole app bundles with all local imports and named exports resolving.
- The mock API was started and driven end to end over HTTP: login cookies, validation errors, invoice numbering, server maths, the 202 job-then-PDF flow with `%PDF-` check, dashboard shape, token refresh, health. This also found and fixed two bugs in the mock itself.
- Pure-logic tests (security helpers, money, passwords, validators, adapters and payloads, errors, OTP state machine, storage facade, source scan, header sync, token definitions, mock contract) ran green through a small stand-in test runner, because the real Vitest could not be installed.
- Fourteen groups of components were server-rendered with `react-dom/server` and the markup inspected (labels, `aria-invalid`, `aria-describedby`, table captions, `aria-sort`).
- The contrast script ran: 70 pairs, 0 failing (it caught and led to a fix for the focus ring colour).
- Generated icons and the social card were rendered and the card was viewed.

**Not run** (no npm registry access): `npm install`, `vite build`, ESLint, the real Vitest (including `tests/components.test.jsx`, `tests/hooks.test.jsx`, `tests/api-client.test.js` and `tests/pdf.test.js`, which need axios, React Testing Library or `vi.mock`), `npm audit`, Lighthouse, axe, and any visual review in a browser. No screenshots were taken. Expect to fix a few small things on first `npm run verify`; the CI workflow runs the same steps.
