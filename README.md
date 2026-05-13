# ImmigrantsFirstStay

A platform connecting immigrants with welcoming hosts who provide temporary stays and settlement support.

Built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

---

## Features

- **User accounts** — Sign up, login, logout with Supabase Auth
- **Profile system** — Role selection (Guest / Host / Both), languages, bio
- **Host listings** — Full listing creation with support types, pricing, dates, house rules
- **Search** — Filter by city, state, support type, free/paid
- **Booking system** — Request, accept, decline, cancel, complete
- **Admin dashboard** — View all users/hosts/bookings, approve verification, remove listings

---

## Quick Start (Local)

### 1. Clone & install

```bash
# In the project directory:
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) → **New project**
2. Copy your **Project URL** and **anon public key** from:
   `Project Settings → API`
3. Open **SQL Editor** in the Supabase dashboard
4. Paste and run the entire contents of `supabase/schema.sql`
5. That's it — tables, RLS policies, triggers, and indexes are all set up.

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Making yourself an Admin

1. Create an account on the app (sign up normally)
2. Go to Supabase Dashboard → **Table Editor** → `profiles`
3. Find your row and set `role` to `admin`
4. Visit `/admin` — you now have full admin access

---

## Project Structure

```
app/
  (auth)/           → Login & signup pages
  (protected)/      → Auth-required pages (dashboard, profile, listings, bookings)
  admin/            → Admin dashboard
  hosts/[id]/       → Public host profile + booking form
  search/           → Host search page
  auth/callback/    → Supabase OAuth callback
components/
  ui/               → Reusable UI components (Button, Card, Badge, etc.)
  navbar.tsx        → Top navigation
  listing-card.tsx  → Host listing card for search results
  booking-form.tsx  → Guest booking form
  host-listing-form.tsx → Create/edit host listing form
lib/
  supabase/
    client.ts       → Browser Supabase client
    server.ts       → Server-side Supabase client
  utils.ts          → Helpers, constants (SUPPORT_OPTIONS, formatDate, etc.)
types/index.ts      → TypeScript types for all DB entities
middleware.ts       → Route protection
supabase/schema.sql → Full DB schema with RLS
```

---

## Database Schema

| Table           | Purpose                                     |
|-----------------|---------------------------------------------|
| `profiles`      | Extended user info (role, bio, languages)   |
| `host_listings` | Host listing with all details               |
| `bookings`      | Booking requests with status                |
| `reviews`       | Guest/host reviews (schema ready)           |
| `messages`      | Placeholder messaging table                 |

Row Level Security is enabled on all tables. Users can only read/write their own data.

---

## Deploy to Vercel

### Option A — Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts. When asked about environment variables, add:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Option B — Vercel Dashboard

1. Push this project to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your repo
3. Under **Environment Variables**, add your two Supabase keys
4. Click **Deploy**

### After deploying

Update Supabase allowed redirect URLs:
- Go to Supabase → **Authentication → URL Configuration**
- Add your Vercel URL to **Redirect URLs**, e.g.:
  `https://your-app.vercel.app/auth/callback`

---

## Capacity & Scalability

This MVP is designed for **100+ users** with:

- Supabase free tier handles up to 50,000 MAUs and 500 MB database
- Indexed queries on `city`, `state`, `host_id`, `guest_id`, `status`
- Row Level Security keeps data isolated without application-level auth checks
- Next.js server components reduce client-side load
- Vercel auto-scales serverless functions globally

To scale further: upgrade Supabase to Pro ($25/mo), add connection pooling (PgBouncer, built into Supabase), enable Vercel Edge runtime.

---

## Tech Stack

| Layer      | Technology                           |
|------------|--------------------------------------|
| Framework  | Next.js 14 (App Router)              |
| Language   | TypeScript                           |
| Styling    | Tailwind CSS                         |
| UI         | Custom shadcn-style components       |
| Database   | Supabase PostgreSQL                  |
| Auth       | Supabase Auth (email/password)       |
| Icons      | Lucide React                         |
| Deployment | Vercel                               |

---

## Environment Variables Reference

| Variable                         | Required | Description                    |
|----------------------------------|----------|--------------------------------|
| `NEXT_PUBLIC_SUPABASE_URL`       | Yes      | Your Supabase project URL      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | Yes      | Supabase anonymous public key  |
