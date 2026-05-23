create table clinics (
  id          uuid primary key default gen_random_uuid(),
  slug        text not null unique,
  name        text not null,
  timezone    text not null default 'UTC',
  locale      text not null default 'en',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
