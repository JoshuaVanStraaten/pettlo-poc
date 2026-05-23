create table vaccinations (
  id              uuid primary key default gen_random_uuid(),
  clinic_id       uuid not null references clinics(id) on delete cascade,
  pet_id          uuid not null references pets(id) on delete cascade,
  vet_id          uuid not null references users(id),
  visit_id        uuid references visits(id),
  vaccine_name    text not null,
  administered_at timestamptz not null default now(),
  next_due_at     timestamptz,
  batch_number    text,
  notes           text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index vaccinations_clinic_id_idx on vaccinations(clinic_id);
create index vaccinations_pet_id_idx on vaccinations(pet_id);
