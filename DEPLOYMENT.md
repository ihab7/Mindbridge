# Deploying MindBridge to Vercel

This document covers everything needed to deploy MindBridge to Vercel: required
configuration, database setup, authentication notes, and a post-deployment
checklist.

## 1. Required Environment Variables

MindBridge only reads one environment variable at runtime (verified by
grepping the codebase for `process.env` usage):

| Variable       | Required | Description                                                                 |
| -------------- | -------- | ----------------------------------------------------------------------------- |
| `DATABASE_URL` | Yes      | PostgreSQL connection string (Neon). Used by `lib/db.ts` via `@neondatabase/serverless`. Must include `?sslmode=require`. |

`NODE_ENV` is set automatically by Vercel/Next.js — do not set it manually.
`lib/auth.ts` reads it only to decide whether the session cookie gets the
`secure` flag.

There is **no** `NEXTAUTH_SECRET`, `JWT_SECRET`, or `OPENAI_API_KEY` in this
project — authentication is a custom cookie/session-table implementation
(see §4) and there is no external AI API integration. Don't add unused
variables; a real `.env.example` reflecting exactly what's read is at the
project root.

Set `DATABASE_URL` in **Vercel → Project Settings → Environment Variables**
for all three environments (Production, Preview, Development) so preview
deployments work too. Use a separate Neon branch/database for Preview if you
don't want preview deploys writing to production data.

## 2. How to Deploy to Vercel

### Option A — Vercel Dashboard (recommended for first deploy)

1. Push this repository to GitHub/GitLab/Bitbucket (this step is on you —
   nothing here has been committed or pushed).
2. In Vercel, click **Add New → Project** and import the repository.
3. Vercel auto-detects Next.js — no build command changes needed
   (`next build` / `next start` are already correct in `package.json`).
4. Add `DATABASE_URL` under Environment Variables before the first deploy.
5. Click **Deploy**.

### Option B — Vercel CLI

```bash
npm i -g vercel
vercel login
vercel link
vercel env add DATABASE_URL production
vercel env add DATABASE_URL preview
vercel --prod
```

No `vercel.json` is required — this is a standard Next.js App Router project
and Vercel's zero-config detection handles routing, API routes, and static
assets correctly.

## 3. Database Configuration

- **Library**: `@neondatabase/serverless` — an HTTP-based Postgres driver
  purpose-built for serverless/edge environments. It does not hold a
  persistent TCP connection, which is exactly what you want on Vercel's
  serverless functions (a traditional `pg` connection pool would exhaust
  connections or add cold-start latency here). No changes were needed.
- **Connection**: `lib/db.ts` lazily creates a single cached client via
  `getSql()`, reading `DATABASE_URL` from the environment and throwing a
  clear error if it's unset. No credentials are hardcoded anywhere in the
  codebase.
- **Schema & migrations**: `scripts/migrate.sql` is idempotent (`CREATE
  TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`) and is *not* run
  automatically during the Vercel build — `package.json`'s `build` script is
  plain `next build`. Run it manually against your production database
  before (or after) the first deploy:

  ```bash
  DATABASE_URL="<your-production-url>" node scripts/setup-db.mjs --migrate-only
  ```

  Omit `--migrate-only` to also load `scripts/seed.sql` demo data — **do not
  seed a real production database**; seed data is meant for demos/previews
  only.
- **Provider**: any Neon Postgres database works as-is. If you use a
  different Postgres host, it must support the Neon serverless driver's
  HTTP/WebSocket protocol (i.e., stay on Neon, or swap the driver — not done
  here since it wasn't necessary).

## 4. Authentication Configuration

MindBridge uses a **custom cookie-based session system**, not NextAuth or
JWT:

- `lib/auth.ts` creates a random session ID (`crypto.randomBytes`), stores it
  in a `sessions` table with a 7-day expiry, and sets it as an `httpOnly`,
  `sameSite=lax` cookie (`secure` in production automatically, via
  `NODE_ENV`).
- Passwords are hashed with `bcryptjs` (pure JS — no native build step, safe
  on Vercel's serverless runtime).
- No secret/env var configuration is needed for this to work in production.

**⚠️ Security note before making this publicly accessible**: the app ships a
demo-login endpoint (`POST /api/auth/demo`), wired to the "Demo Practitioner"
/ "Demo Patient" buttons on the login page. It logs a caller in as the
**first user of the requested role in the database — no password required**.
This is a deliberate product feature for showcasing the app, but if you
deploy with real patient data, anyone can use it to log in as your first
practitioner or first patient account. Before going live with real data,
either remove/gate this route or ensure the first patient/practitioner rows
are demo accounts only.

## 5. Common Deployment Issues

- **`next.config.mjs` has `typescript: { ignoreBuildErrors: true }`.** This
  was already present before this deployment pass and was left in place —
  see "Remaining Issues" in the final report for why. It means `next build`
  will succeed on Vercel even if TypeScript errors exist; it does not affect
  runtime behavior.
- **Migrations are not automatic.** If you deploy without running
  `scripts/setup-db.mjs` first, every API route touching the database will
  return 500s (`lib/db.ts` and `lib/auth.ts` throw clearly-labeled errors
  when `DATABASE_URL` is missing, and Postgres itself will error on missing
  tables). Run migrations before your first real deploy.
- **`DATABASE_URL` missing or wrong for an environment.** Login, register,
  and demo-login routes already surface a `"Server database is not
  configured. Please set DATABASE_URL."` message instead of a bare 500 in
  this case — check Vercel's environment variable scoping (Production /
  Preview / Development) if you see this.
- **Middleware deprecation warning.** The build log will print `The
  "middleware" file convention is deprecated. Please use "proxy" instead.`
  This is a Next.js 16 naming change (`middleware.ts` → `proxy.ts`); it's a
  non-blocking warning and the build succeeds either way. Left as-is per
  project decision (renaming requires deleting the existing file).
- **Cold starts on first DB query.** Neon's serverless driver and Neon's own
  compute auto-suspend mean the very first request after idle time can be
  slower. This is expected and not a bug.

## 6. Post-Deployment Checklist

- [ ] `DATABASE_URL` set in Vercel for Production (and Preview, if used)
- [ ] `node scripts/setup-db.mjs --migrate-only` run against the production
      database
- [ ] Visit `/` (landing page) and confirm it loads
- [ ] Register a real account via `/register` and confirm login works
      end-to-end (this path was broken before this deployment pass — see the
      final report)
- [ ] Confirm dark mode toggle and language switcher work
- [ ] Generate a consultation report as a practitioner and confirm PDF
      download works (uses `@react-pdf/renderer`, Node runtime — already
      configured on every API route via `export const runtime = "nodejs"`)
- [ ] Decide what to do about the open demo-login endpoint (§4) before
      sharing the URL publicly with real patient data
- [ ] Set up a Neon branch (or separate database) for Preview deployments if
      you don't want preview builds touching production data
