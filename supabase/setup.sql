create extension if not exists pgcrypto;

create table if not exists public.events (
 id uuid primary key default gen_random_uuid(),
 title text not null,
 slug text not null unique,
 description text,
 category text default 'Experiences',
 venue text,
 address text,
 city text not null default 'Lagos',
 event_date date not null,
 start_time time,
 end_time time,
 price_min numeric(12,2),
 currency text not null default 'NGN',
 image_url text,
 ticket_url text,
 organizer text,
 source text not null default 'admin',
 is_published boolean not null default false,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);

-- Existing projects may already have the table; make sure minimum admin columns exist.
alter table public.events add column if not exists is_published boolean not null default false;
alter table public.events add column if not exists source text not null default 'admin';
alter table public.events add column if not exists updated_at timestamptz not null default now();
alter table public.events enable row level security;

create table if not exists public.admin_users (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.admin_users enable row level security;
-- No client-facing policies on admin_users; only the database owner can add/remove admins.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
 select exists(select 1 from public.admin_users where user_id = (select auth.uid()));
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- Replace old versions of these policies to allow running the setup more than once.
drop policy if exists "Public can read published events" on public.events;
drop policy if exists "Admins can read all events" on public.events;
drop policy if exists "Admins can create events" on public.events;
drop policy if exists "Admins can update events" on public.events;
drop policy if exists "Admins can delete events" on public.events;

create policy "Public can read published events" on public.events
 for select to anon, authenticated using (is_published = true);
create policy "Admins can read all events" on public.events
 for select to authenticated using ((select public.is_admin()));
create policy "Admins can create events" on public.events
 for insert to authenticated with check ((select public.is_admin()));
create policy "Admins can update events" on public.events
 for update to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins can delete events" on public.events
 for delete to authenticated using ((select public.is_admin()));

create or replace function public.touch_events_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin new.updated_at=now();return new;end;
$$;
drop trigger if exists events_updated_at on public.events;
create trigger events_updated_at before update on public.events
for each row execute function public.touch_events_updated_at();

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values('event-images','event-images',true,5242880,array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true,file_size_limit=5242880,allowed_mime_types=array['image/jpeg','image/png','image/webp'];

drop policy if exists "Admin uploads event flyers" on storage.objects;
drop policy if exists "Admin deletes event flyers" on storage.objects;
create policy "Admin uploads event flyers" on storage.objects
 for insert to authenticated with check(bucket_id='event-images' and (select public.is_admin()) and (storage.foldername(name))[1]='event-flyers');
create policy "Admin deletes event flyers" on storage.objects
 for delete to authenticated using(bucket_id='event-images' and (select public.is_admin()));
-- Public file reads are enabled by the public storage bucket itself.

-- REQUIRED FINAL STEP: After you manually create exactly one user in Supabase Auth,
-- run this SEPARATELY, using the real UUID, not the sample:
-- insert into public.admin_users(user_id) values ('00000000-0000-0000-0000-000000000000');

-- SECURITY CHECK: Review and remove any older, permissive event/storage policies
-- you created previously. PostgreSQL ORs permissive policies together.
