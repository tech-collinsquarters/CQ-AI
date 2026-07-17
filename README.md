# cq-ai — AI Legal Assistant

Production-oriented AI Legal Assistant platform for a **single law firm** (not a multi-tenant SaaS).

**Done so far**

- Authentication (Supabase Auth + Prisma User)
- Dashboard shell (sidebar, navbar, empty workspace)

**Not yet**

- Case creation / case management
- Chat UI
- RAG / LangChain / Gemini

---

## Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js App Router, TypeScript |
| UI | Tailwind CSS, shadcn/ui, Lucide |
| Data / forms | TanStack Query, React Hook Form, Zod |
| Auth | Supabase Authentication |
| Database | Supabase PostgreSQL + Prisma ORM |

---

## Quick start

```bash
npm install
# Fill .env.local (Supabase + DATABASE_URL / DIRECT_URL)
npx prisma migrate deploy
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) → redirects to `/auth/login`.

---

## Project structure

### Root

| Path | Purpose |
|------|---------|
| `package.json` | Dependencies and npm scripts |
| `tsconfig.json` | TypeScript compiler options |
| `next.config.ts` | Next.js configuration |
| `next-env.d.ts` | Next.js TypeScript ambient types |
| `postcss.config.mjs` | PostCSS / Tailwind pipeline |
| `eslint.config.mjs` | ESLint rules |
| `components.json` | shadcn/ui config |
| `prisma.config.ts` | Prisma CLI config (DB URL for migrations) |
| `middleware.ts` | Auth gate: refresh session, protect routes, redirect |
| `.env` | Local env stub (no secrets) |
| `.env.local` | Secrets: Supabase + Postgres URLs (gitignored) |
| `.gitignore` | Files/folders excluded from git |
| `README.md` | Project docs |
| `AGENTS.md` / `CLAUDE.md` | Agent / AI coding guidance for this repo |

---

### `app/` — Next.js App Router (pages + APIs)

| Path | Purpose |
|------|---------|
| `app/layout.tsx` | Root layout: fonts, QueryProvider, AuthProvider, Toaster |
| `app/page.tsx` | `/` — redirects to `/auth/login` |
| `app/globals.css` | Global styles + design tokens (Tailwind / shadcn) |
| `app/favicon.ico` | Browser tab icon |

#### Auth UI (`/auth/*`)

| Path | Purpose |
|------|---------|
| `app/auth/layout.tsx` | Auth pages wrapper (Suspense) |
| `app/auth/login/page.tsx` | Login form (RHF + Zod → API) |
| `app/auth/register/page.tsx` | Register form (fullName, email, password) |

#### Auth APIs (`/api/auth/*`)

| Path | Purpose |
|------|---------|
| `app/api/auth/register/route.ts` | `POST` — create Supabase user + Prisma User |
| `app/api/auth/login/route.ts` | `POST` — sign in, set session cookies |
| `app/api/auth/logout/route.ts` | `POST` — clear session |
| `app/api/auth/me/route.ts` | `GET` — current Prisma user profile |

#### App shell (`(shell)` = route group; not part of the URL)

| Path | Purpose |
|------|---------|
| `app/(shell)/layout.tsx` | Wraps pages in DashboardLayout (sidebar + navbar) |
| `app/(shell)/dashboard/page.tsx` | `/dashboard` — empty welcome workspace |
| `app/(shell)/profile/page.tsx` | `/profile` — user profile (from auth) |
| `app/(shell)/settings/page.tsx` | `/settings` — placeholder |
| `app/(shell)/cases/new/page.tsx` | `/cases/new` — New Case placeholder (no create yet) |

---

### `components/` — UI building blocks

#### Dashboard shell

| Path | Purpose |
|------|---------|
| `components/workspace/dashboard-layout.tsx` | Full shell: sidebar + navbar + main + right panel |
| `components/workspace/empty-workspace.tsx` | Centered empty main area |
| `components/workspace/welcome-card.tsx` | “Welcome / no cases yet” card |
| `components/workspace/dashboard-skeleton.tsx` | Loading skeleton for shell |

#### Sidebar

| Path | Purpose |
|------|---------|
| `components/sidebar/sidebar.tsx` | Assembles full left sidebar |
| `components/sidebar/sidebar-header.tsx` | Logo + app name |
| `components/sidebar/sidebar-menu.tsx` | Home / Settings nav links |
| `components/sidebar/sidebar-footer.tsx` | Profile + settings links, user snippet |
| `components/sidebar/new-case-button.tsx` | “New Case” → `/cases/new` |
| `components/sidebar/search-cases.tsx` | Search input (UI only for now) |
| `components/sidebar/case-history.tsx` | Case list empty state |
| `components/sidebar/responsive-drawer.tsx` | Mobile nav (Sheet drawer) |

#### Navbar

| Path | Purpose |
|------|---------|
| `components/navbar/top-navbar.tsx` | Top bar: app name, collapse, notifications, settings, avatar |
| `components/navbar/user-dropdown.tsx` | Avatar menu: profile, settings, logout |

#### shadcn UI primitives (`components/ui/`)

| Path | Purpose |
|------|---------|
| `alert.tsx` | Inline alert messages |
| `avatar.tsx` | User avatar / initials |
| `button.tsx` | Buttons |
| `card.tsx` | Cards |
| `dropdown-menu.tsx` | Menus |
| `form.tsx` | React Hook Form helpers |
| `input.tsx` | Text inputs |
| `label.tsx` | Form labels |
| `scroll-area.tsx` | Scrollable regions |
| `separator.tsx` | Dividers |
| `sheet.tsx` | Drawer / slide-over (mobile nav) |
| `skeleton.tsx` | Loading placeholders |
| `sonner.tsx` | Toast host |
| `spinner.tsx` | Loading spinner |
| `tooltip.tsx` | Tooltips |

---

### `providers/` — App-wide React context

| Path | Purpose |
|------|---------|
| `providers/query-provider.tsx` | TanStack Query client |
| `providers/auth-provider.tsx` | Auth context: user, login, register, logout |

---

### `hooks/`

| Path | Purpose |
|------|---------|
| `hooks/use-auth.ts` | Re-exports `useAuth` |
| `hooks/use-dashboard-shell.tsx` | Sidebar collapse, mobile drawer, selected menu |

---

### `lib/` — Shared utilities / clients

| Path | Purpose |
|------|---------|
| `lib/utils.ts` | `cn()` className helper |
| `lib/prisma.ts` | Shared Prisma client (Postgres adapter) |
| `lib/auth-client.ts` | Browser helpers calling `/api/auth/*` |
| `lib/supabase/client.ts` | Browser Supabase client |
| `lib/supabase/server.ts` | Server Supabase client (cookies) |
| `lib/supabase/middleware.ts` | Session refresh helper for middleware |

---

### `services/` — Business logic (server)

| Path | Purpose |
|------|---------|
| `services/authService.ts` | register / login / logout / getCurrentUser |

---

### `validators/` — Zod schemas

| Path | Purpose |
|------|---------|
| `validators/auth.ts` | `loginSchema`, `registerSchema` |

---

### `types/`

| Path | Purpose |
|------|---------|
| `types/auth.ts` | Auth-related TypeScript types |
| `types/dashboard.ts` | Dashboard menu / shell state types |

---

### `prisma/` — Database

| Path | Purpose |
|------|---------|
| `prisma/schema.prisma` | Models: `User` (+ `Chat` leftover for a later phase) |
| `prisma/migrations/` | Applied SQL migration history |
| `prisma/migrations/migration_lock.toml` | Prisma migration lock (provider) |

---

### `public/` — Static assets

| Path | Purpose |
|------|---------|
| `public/*.svg` | Static images |

---

## Mental map

```
Auth pages  →  /api/auth/*  →  Supabase Auth + Prisma User
     ↓
Dashboard shell (sidebar + navbar + workspace)
     ↓
Future: Cases → Chat → RAG
```

## Main routes

| Route | Description |
|-------|-------------|
| `/auth/login` | Sign in |
| `/auth/register` | Create account |
| `/dashboard` | Shell + empty workspace |
| `/profile` | Current user profile |
| `/settings` | Placeholder |
| `/cases/new` | New Case placeholder |
