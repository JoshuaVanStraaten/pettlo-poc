create table users (
  id          uuid primary key default gen_random_uuid(),
  clinic_id   uuid references clinics(id) on delete cascade,
  auth_id     uuid unique,
  email       text not null unique,
  full_name   text not null,
  role        user_role not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index users_clinic_id_idx on users(clinic_id);
create index users_auth_id_idx on users(auth_id);
