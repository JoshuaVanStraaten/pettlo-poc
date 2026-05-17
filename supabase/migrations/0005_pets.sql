create table pets (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references users(id) on delete cascade,
  name         text not null,
  species      text not null,
  breed        text,
  sex          pet_sex not null default 'unknown',
  date_of_birth date,
  weight_kg    numeric(5,2),
  microchip    text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table clinic_pets (
  clinic_id  uuid not null references clinics(id) on delete cascade,
  pet_id     uuid not null references pets(id) on delete cascade,
  registered_at timestamptz not null default now(),
  primary key (clinic_id, pet_id)
);

create index pets_owner_id_idx on pets(owner_id);
create index clinic_pets_clinic_id_idx on clinic_pets(clinic_id);
