-- Race calendar data model: profiles (roles), organizers, races.
--
-- Multilingual fields are JSONB keyed by locale, e.g. {"nl": "..."}. Adding a
-- language later is data, not a migration.
--
-- Security is Row-Level Security, deny-by-default:
--   * organizers + races have RLS enabled and NO anon/authenticated policies.
--     Every read/write goes through FastAPI, which connects as the `postgres`
--     role and bypasses RLS (per architecture: no client talks to Supabase
--     directly). A leaked anon/publishable key therefore exposes no race data.
--   * profiles is self-access only.
-- Auth itself (Supabase Auth + JWT verification in FastAPI) is foreseen here via
-- the role enum and audit FKs, but the FastAPI gate lands with the first write
-- endpoint (block 6/8).

-- ----- Enums -----
create type race_type as enum ('weg', 'trail', 'cross');

create type province as enum (
  'antwerpen', 'oost-vlaanderen', 'west-vlaanderen', 'limburg', 'vlaams-brabant'
);

create type race_status as enum ('draft', 'live', 'edition_past');

create type organizer_type as enum ('atletiekclub', 'commercial', 'municipality', 'informal');

create type user_role as enum ('admin', 'coach', 'organizer');

-- ----- profiles: 1:1 with auth.users; carries the role -----
create table profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role user_role not null default 'organizer',
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----- organizers: the organising entity (distinct from the organizer role) -----
create table organizers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type organizer_type not null default 'informal',
  website text,
  contact_email text,
  -- the organizer-role user who manages this entity; null for hand-curated orgs
  owner_id uuid references profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id)
);

-- ----- races -----
create table races (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  race_type race_type not null,
  title jsonb not null, -- multilingual: {"nl": "...", "fr": "..."}
  description jsonb, -- multilingual, nullable
  date date not null,
  start_time time, -- headline start; per-distance times live in `distances`
  distances jsonb not null default '[]'::jsonb, -- [{label, km, start_time?, price_eur?}]
  price_eur numeric, -- optional base price
  registration_url text,
  image_url text,
  organizer_id uuid references organizers (id) on delete set null,
  organizer_name text, -- denormalized for hand-entered races without an org row
  -- location: country + city required, the rest optional
  country text not null default 'BE',
  province province, -- nullable; drives the /antwerpen-style index pages
  city text not null,
  postal_code text,
  street text,
  house_nr text,
  lat numeric,
  lng numeric,
  status race_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id),
  updated_by uuid references auth.users (id)
);

create index races_date_idx on races (date);
create index races_province_idx on races (province);
create index races_race_type_idx on races (race_type);
create index races_status_idx on races (status);
create index organizers_owner_idx on organizers (owner_id);

-- ----- updated_at touch trigger -----
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on profiles
  for each row execute function set_updated_at();

create trigger organizers_set_updated_at
  before update on organizers
  for each row execute function set_updated_at();

create trigger races_set_updated_at
  before update on races
  for each row execute function set_updated_at();

-- ----- Row-Level Security -----
alter table profiles enable row level security;
alter table organizers enable row level security;
alter table races enable row level security;

-- profiles: a signed-in user reads/updates only their own row. Role changes are
-- admin-only and happen via the service-role key (Dashboard / future admin API),
-- which bypasses RLS.
create policy profiles_self_select on profiles
  for select using ((select auth.uid()) = id);

create policy profiles_self_update on profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- organizers + races: deny-by-default. No anon/authenticated policies on purpose
-- — access is via FastAPI (postgres role, bypasses RLS) only.
