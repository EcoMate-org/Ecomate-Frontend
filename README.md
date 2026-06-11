# EcoMate

EcoMate is a recycling marketplace & sustainability platform. This repository is
the full-stack Next.js (App Router) application — frontend and backend live
together. This README documents the **authentication system** (role-based
signup/login, sessions, protected routes) added on top of the marketing site
and news feed.

## Tech stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Prisma 7** ORM (new `prisma-client` generator + `@prisma/adapter-pg` driver adapter)
- **PostgreSQL** (Supabase preferred; any Postgres works)
- **Tailwind CSS v4**
- **bcryptjs** for password hashing
- **jose** for JWT session tokens (httpOnly cookie)
- **React Hook Form + Zod** for form handling & validation

## Authentication overview

Three account types register through one page (`/signup`) with a role tab:

| Role      | Collected fields                                                    | Redirects to         | Dashboard colour |
| --------- | ------------------------------------------------------------------- | -------------------- | ---------------- |
| `USER`    | First Name, Last Name, Email, Password                              | `/dashboard/user`    | Purple           |
| `NGO`     | Company Name, Registration Number, Company Address, Email, Password | `/dashboard/ngo`     | Green            |
| `COMPANY` | Company Name, Registration Number, Company Address, Email, Password | `/dashboard/company` | Blue             |

- Passwords are hashed with bcrypt (12 rounds) and **never** stored in plain text.
- On signup/login a signed JWT is issued and stored in an **httpOnly, SameSite=Lax** cookie.
- `proxy.ts` (Next 16's renamed middleware) guards `/dashboard/*`, redirects
  unauthenticated users to `/signin`, and enforces **role-based authorization**
  (a USER cannot open the NGO/COMPANY dashboards). Dashboard pages re-check the
  session server-side as defense-in-depth.
- A unique `username` is auto-generated from the email/company name (the schema
  requires it but the forms don't collect it).

### API endpoints

| Method | Route                | Purpose                                  |
| ------ | -------------------- | ---------------------------------------- |
| POST   | `/api/auth/register` | Create account (USER/NGO/COMPANY), login |
| POST   | `/api/auth/login`    | Authenticate, issue session              |
| POST   | `/api/auth/logout`   | Clear session cookie                     |
| GET    | `/api/auth/me`       | Current user (or 401)                    |

### Registration-number (CAC) verification

There is **no free, official public API** from the Nigerian Corporate Affairs
Commission (CAC); only paid KYB providers (Dojah, VerifyMe, Prembly, Youverify)
offer it. Registration numbers are therefore **validated for uniqueness only**
(DB `@unique` + a pre-insert check). The integration point for real verification
is documented and stubbed in `lib/auth/registrationVerification.ts` — set
`CAC_VERIFICATION_ENABLED=true` and the provider env vars to enable it.

## Getting started

### 1. Install dependencies

```bash
npm install
```

`postinstall` runs `prisma generate` automatically (outputs the client to
`generated/prisma`, which is gitignored).

### 2. Configure environment

Copy the template and fill in values:

```bash
cp .env.example .env
```

| Variable              | Required | Notes                                                              |
| --------------------- | -------- | ------------------------------------------------------------------ |
| `DATABASE_URL`        | yes      | Postgres connection string. Supabase: use the **Session pooler** (port 5432) so migrations work. |
| `JWT_SECRET`          | yes      | 32+ char random string. `openssl rand -base64 32`                  |
| `SESSION_COOKIE_NAME` | no       | Defaults to `ecomate_session`                                      |
| `NEWSAPI_KEY` / `GNEWS_API_KEY` | no | For the `/Feed` news page                                     |
| `CAC_*`               | no       | Future company-verification provider config                        |

### 3. Apply database migrations

```bash
npm run db:migrate      # prisma migrate deploy (production-safe, no reset)
```

For local schema changes during development use `npm run db:migrate:dev`.

### 4. Run

```bash
npm run dev             # http://localhost:3000
```

## Commands

| Command                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `npm run dev`           | Start the dev server                         |
| `npm run build`         | Production build                             |
| `npm run start`         | Start the production server                  |
| `npm run lint`          | ESLint                                       |
| `npm run typecheck`     | `tsc --noEmit`                               |
| `npm run db:migrate`    | Apply migrations (`prisma migrate deploy`)   |
| `npm run db:migrate:dev`| Create + apply a dev migration               |
| `npm run db:generate`   | Regenerate the Prisma client                 |
| `npm run db:studio`     | Open Prisma Studio                           |

## Folder structure (auth-relevant)

```
app/
  api/auth/
    register/route.ts     # POST signup (USER/NGO/COMPANY)
    login/route.ts        # POST login
    logout/route.ts       # POST logout
    me/route.ts           # GET current user
  dashboard/
    user/page.tsx         # purple, "Welcome {firstName}!"
    ngo/page.tsx          # green,  "Welcome {companyName}!" + reg number
    company/page.tsx      # blue,   "Welcome {companyName}!" + reg number
  signin/page.tsx         # login form (RHF + Zod)
  signup/page.tsx         # role-tabbed signup form (RHF + Zod)
lib/
  prisma.ts               # Prisma client (pg driver adapter)
  auth/
    password.ts           # bcrypt hash/verify
    session.ts            # jose JWT sign/verify + role→dashboard map (edge-safe)
    server.ts             # cookie + getCurrentUser helpers (server-only)
    username.ts           # unique username generation
    registrationVerification.ts  # CAC verification stub + research notes
  validations/auth.ts     # Zod schemas (login + discriminated signup union)
proxy.ts                  # route protection + role-based authorization
prisma/
  schema.prisma           # models + enums
  migrations/             # SQL migrations
```

## Notes for this database

The provided Supabase database already contained the full EcoMate schema plus an
applied migration that was not in the repo. The migration history was **baselined**
(`prisma/migrations/20260611202903_ini`) to match the live DB without resetting
it, and an additive migration added `firstName`, `lastName`, `companyName`, and
`companyAddress` to `User`. No data was dropped.
