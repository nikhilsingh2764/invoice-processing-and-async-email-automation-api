# Invoice Generator — Frontend

A React + Vite frontend for the Invoice Processing & Async Email Automation
API in `../Backend`. Covers authentication, business profile setup,
customers, products, invoices (create/edit/duplicate/delete), PDF download,
emailing invoices, and a dashboard with revenue/status charts.

This app was built directly against the backend's actual route handlers,
services and Mongoose models (not just its Swagger docs, which in a couple
of places describe query parameters the controller doesn't actually read —
see "Known backend limitations" below for the one that matters).

## Stack

React 19 · Vite · Tailwind CSS v4 · React Router v7 · TanStack Query ·
React Hook Form + Zod · Zustand · Axios · Recharts · react-hot-toast ·
lucide-react

## 1. Installation

```bash
cd Frontend
npm install
```

`recharts` was added to `package.json` for the dashboard's revenue and
invoice-status charts. Because this project was generated without network
access, **`package-lock.json` was not regenerated** — the first `npm
install` you run will update it, which is expected and safe to commit.

## 2. Environment variables

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Base URL of your running backend, **including** `/api/v1` (e.g. `http://localhost:8000/api/v1`). The backend mounts every route under this prefix — see `Backend/src/app.js`. |
| `VITE_GOOGLE_CLIENT_ID` | No | Only needed if you use the "Continue with Google" button. Leave blank to hide/disable it. |

## 3. Development

```bash
npm run dev
```

## 4. Production build

```bash
npm run build
npm run preview   # optional local preview of the build
```

## 5. Connecting to the backend

Authentication is entirely **httpOnly cookie based** — see
`Backend/src/utils/cookieOptions.js` and `Backend/src/middleware/auth.middleware.js`.
The frontend never touches `accessToken`/`refreshToken` directly (no
localStorage tokens); `src/api/axios.js` sends every request with
`withCredentials: true`, and `src/services/interceptors.js` transparently
calls `POST /refresh-token` and retries the original request on a 401.

**Important:** the backend hardcodes its auth cookies with `secure: true`
and `sameSite: "none"` (`Backend/src/utils/cookieOptions.js`), regardless
of `NODE_ENV`. Browsers will silently refuse to store these cookies unless
both the frontend and backend are served over **HTTPS**. Plain
`http://localhost` will not work for login persistence — either run both
sides behind HTTPS locally (e.g. via a reverse proxy/tunnel) or ask the
backend team to relax the cookie flags for local development. This is a
backend-side constraint; nothing in the frontend can work around it.

CORS on the backend is locked to a single `CLIENT_URL` origin with
`credentials: true` (`Backend/src/app.js`) — make sure the backend's
`CLIENT_URL` env var matches exactly where this frontend is served from
(protocol + host + port).

## 6. What's implemented

- **Auth** (pre-existing in this repo): signup, OTP verification, login,
  Google login, forgot/reset password, profile, change password,
  deactivate/delete account.
- **Business profile** (`/business`) — create/edit the single business
  profile the backend requires before invoices can be created.
- **Customers** (`/customers`) — list, search, create, edit, delete, with
  full billing/shipping address forms (India-only states, matching
  `Backend/src/model/invoice/address.model.js`).
- **Products** (`/products`) — list, search, create, edit, delete.
- **Invoices** (`/invoices`) — searchable/filterable/sortable paginated
  list, create, edit, duplicate, delete, PDF download, and "email to
  customer", plus a professional, printable invoice preview.
- **Dashboard** (`/dashboard`) — stats cards, revenue chart, invoice status
  breakdown, top customers/products, recent invoices.

## 7. Known backend limitations

These are backend-side gaps discovered during analysis; the frontend works
around them as described, without inventing endpoints or data the backend
doesn't actually provide.

1. **No standalone invoice list endpoint.** `Backend/src/route/invoice/invoice.routes.js`
   only exposes `GET /invoice/:id` for a single invoice — there is no
   `GET /invoice` list route. The only place a paginated/filterable
   invoice list exists is `GET /api/v1/dashboard`
   (`Backend/src/controller/dashboard/dashboard.controller.js`), which
   happens to accept `page`, `limit`, `search`, `paymentStatus`,
   `customerId`, `startDate`, `endDate`, `sortBy`, `sortOrder`. The
   **Invoices** page (`src/pages/invoices/Invoices.jsx`) therefore calls
   the dashboard endpoint and reads `data.invoices`. A dedicated
   `GET /invoice` endpoint (with the same query support) would be a
   cleaner backend addition, but isn't required for the app to work.

2. **PDF generation and email sending have no status/polling route.**
   `GET /invoice/:id/pdf` and `POST /invoice/:id/email` queue BullMQ jobs
   and immediately return `202 { jobId }`
   (`Backend/src/service/invoice/invoice.service.js`). The controller file
   defines `getInvoicePDFStatus` / `getInvoiceEmailStatus` handlers that
   could check a job's state via `queue.getJob(jobId)`, but **neither is
   wired up in `invoice.routes.js`** — there's no way to poll a job by ID.
   The frontend never claims "PDF ready" or "email sent" on a 202: for
   PDFs, it retries the *same* download endpoint every ~2.5s (up to 8
   times) until the worker's Redis-cached PDF makes the endpoint return the
   binary (`src/hooks/useInvoices.js#useInvoicePDF`); for email, the toast
   explicitly says the email was **queued**, never "sent" or "delivered",
   since the frontend has no way to confirm actual delivery. Wiring up the
   two existing status routes on the backend would let the frontend show
   real progress instead of polling.

3. **Editing an invoice can't reliably reconstruct which customer it
   belongs to.** `Backend/src/model/invoice/invoice.model.js` stores only
   a *snapshot* of the customer (name, email, address, etc.) on the
   invoice — it does not persist a `customerId` field. The invoice edit
   form (`src/pages/invoices/InvoiceForm.jsx`) best-effort matches the
   snapshot back to a live customer by email; if no match is found (e.g.
   the customer was later deleted), the customer dropdown is left for the
   user to re-select rather than guessing. Adding `customerId` to the
   invoice schema would remove the need for this heuristic.

4. **`Customer.customerType` enum has a data-entry bug.** The Mongoose
   enum in `Backend/src/model/invoice/customer.model.js` is
   `["Individual ", "Business"]` (note the trailing space after
   `"Individual"`), while the validator
   (`Backend/src/validators/customer.validator.js`) and API docs both use
   `"Individual"` with no trailing space. In practice the validator runs
   first and accepts `"Individual"`, so this hasn't caused a visible bug,
   but it's worth a one-line backend fix.

None of the above required any change to the backend to ship this
frontend — they're documented here per the "backend remains the source of
truth" requirement, in case you want to make the small backend additions
that would remove the workarounds.

## 8. Verification notes

This environment has no outbound network access, so `npm install` /
`npm run build` could not be executed here to produce a verified build.
Instead, every `.js`/`.jsx` file in `src/` was syntax-checked individually
with esbuild, and the whole app was bundled from `src/main.jsx` with all
`node_modules` packages marked external — this successfully resolves every
internal import/export across all ~100 files with zero errors. Before
deploying, still run:

```bash
npm install
npm run build
```

and fix anything that surfaces (most likely nothing beyond the expected
`package-lock.json` update for `recharts`).

## 9. Project structure

```text
src/
├── api/            # one file per backend resource — thin axios wrappers
├── components/
│   ├── ui/          # Button, Input, Select, Modal, Badge, Pagination, …
│   ├── common/       # AddressFields, PageLoader, layout primitives
│   ├── invoice/      # InvoicePreview, InvoiceItemsEditor, InvoiceTable, …
│   ├── dashboard/    # StatCard, RevenueChart, StatusChart, TopList
│   ├── customer/ product/  # entity-specific form modals
│   └── navigation/ landing/ auth/   # pre-existing shell components
├── hooks/          # TanStack Query hooks per resource (useInvoices, …)
├── pages/          # route-level screens, grouped by resource
├── routes/         # AppRoutes, ProtectedRoute, PublicRoute
├── store/          # Zustand stores (auth, theme)
├── utils/          # constants.js (enums mirrored from the backend), format.js
└── validation/      # auth zod schema (form-level schemas otherwise live
                      # next to their form component)
```
