-- ============================================================
-- ImmigrantsFirstStay — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends auth.users 1-to-1)
create table public.profiles (
  id            uuid references auth.users on delete cascade primary key,
  email         text not null,
  full_name     text,
  avatar_url    text,
  bio           text,
  phone         text,
  languages     text[]  default '{}',
  role          text    default 'guest' check (role in ('guest','host','both','admin')),
  country_of_origin text,
  created_at    timestamptz default now() not null,
  updated_at    timestamptz default now() not null
);

-- Host listings
create table public.host_listings (
  id              uuid primary key default uuid_generate_v4(),
  host_id         uuid references public.profiles(id) on delete cascade not null,
  title           text not null,
  city            text not null,
  state           text not null,
  address         text,
  neighborhood    text,
  description     text,
  max_guests      integer default 1  check (max_guests >= 1),
  max_stay_days   integer default 30 check (max_stay_days >= 1),
  is_free         boolean default true,
  price_per_night numeric(10,2),
  house_rules     text,
  languages_spoken text[] default '{}',
  -- support_offered values: temporary_stay | airport_pickup | apartment_search | local_guidance
  support_offered  text[] default '{}',
  is_verified     boolean default false,
  is_active       boolean default true,
  available_from  date,
  available_to    date,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);

-- Bookings
create table public.bookings (
  id          uuid primary key default uuid_generate_v4(),
  listing_id  uuid references public.host_listings(id) on delete cascade not null,
  guest_id    uuid references public.profiles(id) on delete cascade not null,
  host_id     uuid references public.profiles(id) on delete cascade not null,
  check_in    date not null,
  check_out   date not null,
  num_guests  integer default 1 check (num_guests >= 1),
  message     text,
  -- status: pending | accepted | declined | cancelled | completed
  status      text default 'pending' check (status in ('pending','accepted','declined','cancelled','completed')),
  total_price numeric(10,2),
  created_at  timestamptz default now() not null,
  updated_at  timestamptz default now() not null
);

-- Reviews
create table public.reviews (
  id           uuid primary key default uuid_generate_v4(),
  booking_id   uuid references public.bookings(id) on delete cascade not null unique,
  reviewer_id  uuid references public.profiles(id) on delete cascade not null,
  reviewee_id  uuid references public.profiles(id) on delete cascade not null,
  listing_id   uuid references public.host_listings(id) on delete set null,
  rating       integer not null check (rating between 1 and 5),
  comment      text,
  created_at   timestamptz default now() not null
);

-- Messages (placeholder — full chat out of scope for MVP)
create table public.messages (
  id           uuid primary key default uuid_generate_v4(),
  booking_id   uuid references public.bookings(id) on delete cascade,
  sender_id    uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade not null,
  content      text not null,
  is_read      boolean default false,
  created_at   timestamptz default now() not null
);

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Keep updated_at fresh
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at        before update on public.profiles        for each row execute procedure public.set_updated_at();
create trigger host_listings_updated_at   before update on public.host_listings   for each row execute procedure public.set_updated_at();
create trigger bookings_updated_at        before update on public.bookings        for each row execute procedure public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles       enable row level security;
alter table public.host_listings  enable row level security;
alter table public.bookings       enable row level security;
alter table public.reviews        enable row level security;
alter table public.messages       enable row level security;

-- profiles
create policy "profiles: public read"      on public.profiles for select using (true);
create policy "profiles: own insert"       on public.profiles for insert with check (auth.uid() = id);
create policy "profiles: own update"       on public.profiles for update using (auth.uid() = id);

-- host_listings
create policy "listings: public read active"
  on public.host_listings for select
  using (is_active = true or auth.uid() = host_id);

create policy "listings: host insert"
  on public.host_listings for insert
  with check (auth.uid() = host_id);

create policy "listings: host update"
  on public.host_listings for update
  using (auth.uid() = host_id);

create policy "listings: host delete"
  on public.host_listings for delete
  using (auth.uid() = host_id);

-- bookings
create policy "bookings: parties read"
  on public.bookings for select
  using (auth.uid() = guest_id or auth.uid() = host_id);

create policy "bookings: guest insert"
  on public.bookings for insert
  with check (auth.uid() = guest_id);

create policy "bookings: parties update"
  on public.bookings for update
  using (auth.uid() = guest_id or auth.uid() = host_id);

-- reviews
create policy "reviews: public read"       on public.reviews for select using (true);
create policy "reviews: reviewer insert"   on public.reviews for insert with check (auth.uid() = reviewer_id);

-- messages
create policy "messages: parties read"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "messages: sender insert"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "messages: recipient read update"
  on public.messages for update
  using (auth.uid() = recipient_id);

-- ============================================================
-- INDEXES (performance for common queries)
-- ============================================================
create index idx_host_listings_host_id      on public.host_listings(host_id);
create index idx_host_listings_city_state   on public.host_listings(city, state);
create index idx_host_listings_active       on public.host_listings(is_active);
create index idx_bookings_guest_id          on public.bookings(guest_id);
create index idx_bookings_host_id           on public.bookings(host_id);
create index idx_bookings_listing_id        on public.bookings(listing_id);
create index idx_bookings_status            on public.bookings(status);
create index idx_messages_booking_id        on public.messages(booking_id);
