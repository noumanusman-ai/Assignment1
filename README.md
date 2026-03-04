# NexusID

A modern, full-stack identity and user management platform built with SvelteKit 2, Svelte 5, Better Auth, Drizzle ORM, and Neon PostgreSQL. Features complete authentication flows (email/password + OAuth), email verification, admin dashboard, and role-based access control.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | [SvelteKit](https://svelte.dev/docs/kit) | v2.50.2 |
| **UI** | [Svelte](https://svelte.dev) | v5.51.0 |
| **Styling** | [Tailwind CSS](https://tailwindcss.com) | v4.1.18 |
| **Database** | [Neon](https://neon.tech) (Serverless PostgreSQL) | — |
| **ORM** | [Drizzle ORM](https://orm.drizzle.team) | v0.45.1 |
| **Auth** | [Better Auth](https://www.better-auth.com) | v1.4.18 |
| **Email** | [Nodemailer](https://nodemailer.com) (Gmail SMTP) | v8.0.1 |
| **Build** | [Vite](https://vite.dev) | v7.3.1 |
| **Language** | [TypeScript](https://www.typescriptlang.org) | v5.9.3 |
| **Deployment** | [Vercel](https://vercel.com) (via `adapter-auto`) | — |

---

## Features

- **Authentication** — Email/password signup with required email verification
- **OAuth** — GitHub and Google social login
- **Password Reset** — Token-based reset flow with branded HTML emails
- **User Profiles** — Avatar upload, name/email editing, session management
- **Admin Dashboard** — User CRUD, search/filter, ban/unban, statistics, pagination
- **Role-Based Access** — `user` and `admin` roles with route-level guards
- **Server Hooks** — Automatic session validation and route protection
- **Responsive UI** — Tailwind CSS with custom Manrope font and glass-morphism design

---

## Project Structure

```
NexusID/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte              # Root layout
│   │   ├── +page.svelte                # Landing page
│   │   ├── layout.css                  # Global styles & Tailwind
│   │   ├── (auth)/                     # Auth route group (public)
│   │   │   ├── login/+page.svelte
│   │   │   ├── signup/+page.svelte
│   │   │   ├── verify-email/+page.svelte
│   │   │   ├── forgot-password/+page.svelte
│   │   │   └── reset-password/+page.svelte
│   │   ├── (app)/                      # Protected route group
│   │   │   ├── profile/+page.svelte    # User profile
│   │   │   └── admin/+page.svelte      # Admin dashboard
│   │   └── demo/                       # Demo/test routes
│   ├── lib/
│   │   ├── auth-client.ts              # Client-side auth helpers
│   │   ├── index.ts                    # Library barrel exports
│   │   └── server/
│   │       ├── auth.ts                 # Better Auth server config
│   │       └── db/
│   │           ├── index.ts            # Drizzle client instance
│   │           ├── schema.ts           # App-specific schemas
│   │           └── auth.schema.ts      # Auto-generated auth schema
│   ├── hooks.server.ts                 # Auth middleware & route guards
│   ├── app.html                        # HTML shell
│   └── app.d.ts                        # Global type definitions
├── drizzle/                            # SQL migration files
│   └── 0000_fast_morph.sql
├── drizzle.config.ts                   # Drizzle Kit config
├── svelte.config.js                    # SvelteKit config
├── vite.config.ts                      # Vite + Tailwind plugin
├── tsconfig.json                       # TypeScript (strict mode)
├── .env.example                        # Environment variable template
└── package.json
```

---

## Prerequisites

- **Node.js** — v18.13+ (LTS recommended)
- **pnpm** — v8+ (package manager)
- **Neon Account** — Free tier at [neon.tech](https://neon.tech) for PostgreSQL
- **GitHub OAuth App** *(optional)* — [Create one here](https://github.com/settings/developers)
- **Google OAuth Credentials** *(optional)* — [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- **Gmail App Password** — For sending verification/reset emails ([Generate here](https://myaccount.google.com/apppasswords))

---

## Installation & Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/NexusID.git
cd NexusID
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and configure:

```env
# Database — Neon PostgreSQL connection string
DATABASE_URL="postgresql://<user>:<password>@<host>.neon.tech/<dbname>?sslmode=require"

# App origin — must match your dev server URL
ORIGIN="http://localhost:5173"

# Auth secret — generate a random string (e.g. openssl rand -hex 32)
BETTER_AUTH_SECRET="your-secret-key-here"

# GitHub OAuth (optional — leave empty to disable)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Google OAuth (optional — leave empty to disable)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Email — Gmail SMTP credentials for verification & reset emails
SMTP_USER="your-email@gmail.com"
SMTP_APP_PASSWORD="your-16-char-app-password"
```

> **Generating `BETTER_AUTH_SECRET`:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 4. Set up the database

Create a free PostgreSQL database on [Neon](https://neon.tech), copy the connection string, and paste it as `DATABASE_URL` in your `.env`.

Push the schema to your database:

```bash
pnpm db:push
```

Or use migrations:

```bash
pnpm db:generate   # Generate migration files from schema
pnpm db:migrate    # Apply migrations to the database
```

### 5. Start the dev server

```bash
pnpm dev
```

The app will be running at **http://localhost:5173**.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `pnpm dev` | `vite dev` | Start dev server with HMR |
| `pnpm build` | `vite build` | Create production build |
| `pnpm preview` | `vite preview` | Preview production build locally |
| `pnpm check` | `svelte-kit sync && svelte-check` | Run type checking |
| `pnpm check:watch` | `svelte-check --watch` | Type checking in watch mode |
| `pnpm lint` | `prettier --check .` | Check code formatting |
| `pnpm format` | `prettier --write .` | Auto-format all files |
| `pnpm db:push` | `drizzle-kit push` | Push schema directly to DB |
| `pnpm db:generate` | `drizzle-kit generate` | Generate SQL migration files |
| `pnpm db:migrate` | `drizzle-kit migrate` | Run pending migrations |
| `pnpm db:studio` | `drizzle-kit studio` | Open Drizzle Studio (DB GUI) |
| `pnpm auth:schema` | `better-auth generate` | Regenerate auth schema types |

---

## Database Schema

NexusID uses four core tables managed by Better Auth + Drizzle:

### `user`
| Column | Type | Description |
|--------|------|-------------|
| `id` | `text` PK | Unique identifier |
| `name` | `text` | Display name |
| `email` | `text` UNIQUE | Email address |
| `emailVerified` | `boolean` | Verification status |
| `image` | `text` | Avatar URL |
| `role` | `text` | `user` or `admin` |
| `banned` | `boolean` | Suspension flag |
| `bannedReason` | `text` | Reason for ban |
| `createdAt` / `updatedAt` | `timestamp` | Timestamps |

### `session`
Tracks active sessions with `token`, `expiresAt`, `ipAddress`, and `userAgent`.

### `account`
Links OAuth providers and password hashes to users. Stores `providerId`, `accessToken`, `refreshToken`, and `password`.

### `verification`
Holds email verification and password reset tokens with expiration.

---

## Authentication Flow

```
Signup → Email Verification → Login → Profile
           ↓ (token email)
       Verify Email → Auto Sign-In → /profile

Forgot Password → Reset Email → Reset Password → Login

GitHub/Google OAuth → Callback → /profile
```

**Key files:**
- Server config: `src/lib/server/auth.ts`
- Client helpers: `src/lib/auth-client.ts`
- Route guards: `src/hooks.server.ts`

---

## Setting Up OAuth Providers

### GitHub

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Set **Homepage URL** to `http://localhost:5173`
4. Set **Authorization callback URL** to `http://localhost:5173/api/auth/callback/github`
5. Copy **Client ID** and **Client Secret** to your `.env`

### Google

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Create an **OAuth 2.0 Client ID** (Web application)
3. Add `http://localhost:5173` to **Authorized JavaScript origins**
4. Add `http://localhost:5173/api/auth/callback/google` to **Authorized redirect URIs**
5. Copy **Client ID** and **Client Secret** to your `.env`

---

## Deploying to Vercel

NexusID uses `@sveltejs/adapter-auto`, which auto-detects Vercel at build time. No adapter changes needed.

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Import project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **Import Git Repository** and select your NexusID repo
3. Vercel will auto-detect SvelteKit — no build config changes needed
4. Framework preset: **SvelteKit** (auto-detected)

### 3. Set environment variables

In your Vercel project dashboard, go to **Settings → Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `ORIGIN` | `https://your-app.vercel.app` (your production URL) |
| `BETTER_AUTH_SECRET` | Your auth secret (same as local or generate new) |
| `GITHUB_CLIENT_ID` | Your GitHub OAuth Client ID |
| `GITHUB_CLIENT_SECRET` | Your GitHub OAuth Client Secret |
| `GOOGLE_CLIENT_ID` | Your Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Your Google OAuth Client Secret |
| `SMTP_USER` | Your Gmail address |
| `SMTP_APP_PASSWORD` | Your Gmail App Password |

> **Important:** Update `ORIGIN` to match your actual Vercel deployment URL.

### 4. Update OAuth callback URLs

After deploying, update your OAuth provider callback URLs to use your production domain:

- **GitHub:** `https://your-app.vercel.app/api/auth/callback/github`
- **Google:** `https://your-app.vercel.app/api/auth/callback/google`

### 5. Deploy

Click **Deploy** in Vercel. Subsequent pushes to `main` will trigger automatic deployments.

### 6. Run database migrations (if needed)

If your production database is fresh, push the schema:

```bash
DATABASE_URL="your-production-db-url" pnpm db:push
```

Or run migrations through your CI/CD pipeline.

---

## Deploying via Vercel CLI

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

Set environment variables via CLI:

```bash
vercel env add DATABASE_URL
vercel env add ORIGIN
vercel env add BETTER_AUTH_SECRET
vercel env add GITHUB_CLIENT_ID
vercel env add GITHUB_CLIENT_SECRET
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add SMTP_USER
vercel env add SMTP_APP_PASSWORD
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `DATABASE_URL` connection error | Ensure your Neon DB is active and the connection string includes `?sslmode=require` |
| Email not sending | Verify `SMTP_APP_PASSWORD` is a 16-character App Password, not your Gmail password |
| OAuth callback error | Check callback URLs match exactly (protocol, domain, path) |
| `ORIGIN` mismatch | Must match the exact URL (including protocol) where the app is served |
| Build fails on Vercel | Run `pnpm check` locally first to catch type errors |
| `adapter-auto` issues | Install `@sveltejs/adapter-vercel` explicitly if auto-detection fails |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and run checks: `pnpm check && pnpm lint`
4. Commit: `git commit -m "Add my feature"`
5. Push: `git push origin feature/my-feature`
6. Open a Pull Request

---

## License

This project is open source. See the [LICENSE](LICENSE) file for details.
