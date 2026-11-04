# Detty December — Private Admin

A separate Next.js admin application with a **black and white** dashboard, built for **one authorized administrator**. Uses the exact `events` columns already read by your existing Detty December public website.

## Features

- Private email/password sign-in (Supabase Auth)
- Event list, keyword search, and published/draft filters
- Add, edit and permanently delete events
- Publish/unpublish events
- Upload JPEG/PNG/WebP flyers (up to 5 MB) to Supabase Storage
- Lagos-friendly dates, time and naira pricing
- Responsive black-and-white UI
- Supabase Row Level Security: public users can only read published events; only your allowlisted user can change data

## 1. Install

Use Node.js 20.9 or newer.

```bash
npm install
```

## 2. Create a Supabase project

1. Visit https://supabase.com/dashboard and create a project.
2. Open **SQL Editor**. Run the entire `supabase/setup.sql` file.
3. Go to **Authentication > Providers > Email** and disable public email signup (often called **Allow new users to sign up**). Keep email/password authentication enabled.
4. Go to **Authentication > Users** and manually create your one admin user with a strong password. Verify/confirm the email using the Supabase interface.
5. Copy the user's **UID**. In **SQL Editor**, run the following with the *real* UID:

```sql
insert into public.admin_users (user_id)
values ('REPLACE-WITH-THE-USER-UID');
```

6. Turn on MFA for your account if supported by your authentication policy; the provided app implements email/password sign-in, **not a built-in MFA challenge flow**. For MFA enforcement, add an MFA verification page before production use.

**Important:** If your database already has an `events` table, run the SQL carefully: it creates only missing tables and adds some missing fields but it does not reconcile every possible custom schema. Review old RLS policies: a pre-existing permissive write policy can override restrictions because permissive policies combine with OR.

## 3. Configure the admin app

Copy `.env.example` to `.env.local` and fill both values from Supabase **Project Settings > API**:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Use the **publishable** key (or legacy anon key), never the secret/service-role key. These NEXT_PUBLIC values are designed to be available to the browser; security must come from Supabase RLS.

Run:

```bash
npm run dev
```

Open http://localhost:3000/login and sign in with the manually created admin user.

## 4. Connect your public Detty December site

Your existing public site already has:

- `lib/supabase.ts`
- `lib/supabase-events.ts`
- `app/api/events/route.ts`

In your **public** project's `.env.local`, set the **same** `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Your public site queries `public.events` for published events and can read the `image_url` for flyers.

**Important public site changes** (not bundled into this admin ZIP):

1. In `lib/supabase-events.ts`, `getEvents()` currently combines Supabase rows with demo events (`EVENTS`). To show **only real published events**, change `return [...db, ...EVENTS.filter((e) => !slugs.has(e.slug))];` to `return db;`. Also update the returns `return EVENTS;` in unconfigured/error paths as appropriate, e.g. `return [];`, and remove the unused `slugs` variable. Keep the existing Dec 1–31 2026 date filter only if you want exactly that period; otherwise remove or update `.gte("event_date", "2026-12-01")` and `.lte("event_date", "2026-12-31")`.
2. For production, ensure that public API responses are allowed to be cached only as intended. The current public `/api/events` route uses `revalidate = 60`; published changes may take up to about a minute (or longer if another cache is involved) to show.
3. Remove your old `app/admin` page from the public project if you want no admin route in the public deployment.
4. Use the project **publishable key**, not the Supabase secret/service-role key, in the public app.

## 5. Deploy securely

Deploy the admin as a **separate** Next.js app. Add the same two environment variables to the deployment provider. Use a distinct private admin address. There must be **no links** to it from the public website.

A separate admin address hides it from navigation but does **not** prevent anyone from opening the login page if they find the address. The dashboard is protected by Supabase Auth + the database allowlist + RLS, and server actions revalidate admin authorization. For a stronger requirement that visitors cannot reach even the login page, add a front-door access policy (such as Cloudflare Access) allowing only your identity. This requires you to configure the hosting/domain and the access provider.

**Production checklist:**
- [ ] Disable public signup in Supabase Auth
- [ ] Create only your own Auth user, then insert its UID into `admin_users`
- [ ] Verify the database has no leftover permissive policies
- [ ] Add MFA or an external access gateway if you require stronger protection
- [ ] Confirm unauthorized browser sessions cannot create/update/delete events or upload flyers
- [ ] Confirm public visitors only see published events
- [ ] Keep `.env.local`, secrets, and `.git` out of the public ZIP and repository
- [ ] Set an allowed redirect URL in Supabase Auth if you enable other sign-in methods

## What you should know

- If Supabase is not configured, this app cannot sign in or manage events. There is **no mock-admin bypass**.
- The published `event-images` storage bucket exposes uploaded flyers publicly; this is intended because visitors need to see event flyers. Do not upload confidential images.
- Deleting an event does not automatically delete its flyer file. You can remove unreferenced files in Supabase Storage.
- The public site currently maps event categories to `Music`, `Nightlife`, `Arts`, `Food`, or `Experiences`. This admin uses the same category names.
- Supabase free tier limits and any hosting restrictions apply.
