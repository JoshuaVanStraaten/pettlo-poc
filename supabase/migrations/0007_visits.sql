create table visits (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references clinics(id) on delete cascade,
  pet_id          uuid not null references pets(id) on delete cascade,
  vet_id          uuid not null references users(id),
  appointment_id  uuid references appointments(id),
  visited_at      timestamptz not null default now(),
  chief_complaint text,
  diagnosis       text,
  treatment       text,
  notes           text,
  deleted_at      timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index visits_clinic_id_idx on visits(clinic_id);
create index visits_pet_id_idx on visits(pet_id);
