-- DarksideRF accounts and the Phase 2 source registry.
-- Run this in the Supabase SQL editor. The anon key stays in the browser;
-- these policies are what keep one visitor out of another visitor's logbook.
-- Catalogue satellites remain text ids until that snapshot moves into Postgres.

create table if not exists public.stations (
  user_id uuid primary key references auth.users (id) on delete cascade,
  profile jsonb not null,
  watchlist text[] not null default '{}',
  alerts jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.reception_logs (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  satellite_id text not null,
  transmitter_id text,
  event_id text,
  received_at timestamptz not null,
  reception_status text not null check (reception_status in ('received', 'decoded')),
  receiver_model_id text,
  antenna_model_id text,
  frequency_hz bigint,
  notes text,
  quality text,
  source_type text not null check (source_type in ('live_entry', 'manual_historical')),
  verification_state text not null default 'self_reported' check (verification_state in ('self_reported', 'evidence_attached', 'reviewed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reception_logs_user_idx on public.reception_logs (user_id, received_at desc);

create table if not exists public.reminders (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  satellite_id text not null,
  label text not null,
  pass_aos timestamptz not null,
  fire_at timestamptz not null
);

create index if not exists reminders_user_idx on public.reminders (user_id, fire_at);

create table if not exists public.sources (
  id text primary key,
  name text not null,
  url text not null,
  category text not null check (category in ('official', 'specialist')),
  trust_tier text not null check (trust_tier in ('official', 'specialist')),
  language text not null default 'en',
  poll_interval_hours integer not null check (poll_interval_hours > 0),
  notes text not null
);

create table if not exists public.activity_events (
  id text primary key,
  event_type text not null,
  title text not null,
  satellite_id text not null,
  frequency_hz bigint,
  mode text,
  start_date date,
  end_date date,
  time_precision text not null check (time_precision in ('date', 'instant')),
  status text not null check (status in ('reported', 'announced', 'scheduled', 'active', 'finished', 'postponed', 'cancelled')),
  pattern text,
  summary text not null,
  published boolean not null default false
);

grant select, insert, update, delete on public.stations to authenticated;
grant select, insert, update, delete on public.reception_logs to authenticated;
grant select, insert, update, delete on public.reminders to authenticated;
grant select on public.sources to anon, authenticated;
grant select on public.activity_events to anon, authenticated;

alter table public.stations enable row level security;
alter table public.reception_logs enable row level security;
alter table public.reminders enable row level security;
alter table public.sources enable row level security;
alter table public.activity_events enable row level security;

create policy "stations are private" on public.stations
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "logs are private" on public.reception_logs
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "reminders are private" on public.reminders
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "sources are public" on public.sources
  for select to anon, authenticated
  using (true);

create policy "published events are public" on public.activity_events
  for select to anon, authenticated
  using (published);

insert into public.sources (id, name, url, category, trust_tier, language, poll_interval_hours, notes) values
  ('ariss-sstv', 'ARISS upcoming SSTV', 'https://www.ariss.org/upcoming-sstv-events.html', 'official', 'official', 'en', 12, 'Date windows for ISS SSTV. Exact on-air times are often published later.'),
  ('amsat-status', 'AMSAT status summary', 'https://www.amsat.org/status/api/v1/summary.php?hours=720', 'specialist', 'specialist', 'en', 24, 'Heard, telemetry-only, and not-heard reports. A report is not a pass.'),
  ('amsat-uk', 'AMSAT-UK', 'https://amsat-uk.org/', 'specialist', 'specialist', 'en', 24, 'News and activation notes from AMSAT-UK.')
on conflict (id) do nothing;

insert into public.activity_events (
  id, event_type, title, satellite_id, frequency_hz, mode, start_date, end_date, time_precision, status, pattern, summary, published
) values (
  'ariss-sstv-series-34',
  'sstv',
  'ARISS SSTV Series 34 — ARISS Hardware',
  'iss',
  437550000,
  'SSTV Robot 36',
  '2026-10-22',
  '2026-10-25',
  'date',
  'announced',
  'About 36 seconds on, then about two minutes off.',
  'ARISS has announced the dates for Expedition 75 Series 34 and the downlink used for these events. Exact UTC start and end times were still to be updated on the ARISS page. These dates do not mean the transmitter is on for the whole window.',
  true
) on conflict (id) do nothing;
