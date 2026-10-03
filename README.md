# HT

Habit tracker. Next.js (App Router), strict TypeScript, Supabase (Postgres, Auth, RLS), Tailwind.
Streaks and completion rates are computed in Postgres (`supabase/migrations`), not in client code.

## Setup
1. Create a Supabase project. In Authentication, set Site URL to your app URL and add `<app url>/auth/callback` to Redirect URLs.
2. `cp .env.example .env.local` and fill `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Only the anon key is used in the app.
3. Apply migrations: `npx supabase link --project-ref <ref>` then `npx supabase db push`.
4. `npm install` then `npm run dev`.
5. Optional sample data: set `SUPABASE_SERVICE_ROLE_KEY`, `SEED_EMAIL`, `SEED_PASSWORD` in `.env.local` (never commit it, never expose it to the browser), then `npm run seed`.
6. Generate DB types when you add queries that need them: `npx supabase gen types typescript --linked > src/lib/db/types.ts`.

## Deploy to Vercel
Import the repo, set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_SITE_URL`, deploy, then add the production URL to Supabase Redirect URLs.

## Status
Built: migrations, auth (password and magic link), session middleware, Today screen, seed script.
Not built yet: habit CRUD and drawer, habit detail, analytics, settings, TanStack Query, streak tests, legal pages.
