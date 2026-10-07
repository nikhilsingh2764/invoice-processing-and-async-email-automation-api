# InvoicePilot Frontend

React 19 + Vite + Tailwind 4 + TanStack Query. Talks to the existing Express backend (`/api/v1`) using its HttpOnly cookies.

## Setup
```bash
cd Frontend
npm install
cp .env.example .env     # then fill in the values below
npm run dev              # http://localhost:5173
npm run build            # production build -> dist/
npm test                 # unit + render smoke tests
npm run lint
```

## Environment variables (public, build-time)
| Variable | Required | Example |
|---|---|---|
| `VITE_API_BASE_URL` | yes | `http://localhost:8000/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | no | same value as backend `GOOGLE_CLIENT_ID`; empty hides the Google button |

## Backend settings this frontend relies on
- `CLIENT_URL` must equal the frontend origin exactly (e.g. `http://localhost:5173`, no trailing slash) — CORS uses `credentials: true`.
- Cookies are `Secure; SameSite=None`. `localhost` works in Chrome/Edge/Firefox. In production use HTTPS.
- Background worker must be running (`npm run worker` in Backend) or PDF download / email will never complete.

## Deploy
1. Set the env vars above in your host (Vercel/Netlify/Render static) and run `npm run build`; publish `dist/`.
2. SPA fallback is included (`vercel.json`, `public/_redirects`).
3. **Recommended for production:** serve the API from the same site via a proxy/rewrite so cookies are first-party
   (Safari and Chrome-incognito block third-party cookies). Example `vercel.json`:
   ```json
   { "rewrites": [
     { "source": "/api/v1/:path*", "destination": "https://YOUR-BACKEND/api/v1/:path*" },
     { "source": "/(.*)", "destination": "/index.html" } ] }
   ```
   then set `VITE_API_BASE_URL=/api/v1` and backend `CLIENT_URL=https://your-frontend-domain`.
