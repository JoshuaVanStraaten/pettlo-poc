create table appointments (
  id           uuid primary key default gen_random_uuid(),
  clinic_id    uuid not null references clinics(id) on delete cascade,
  pet_id       uuid not null references pets(id) on delete cascade,
  vet_id       uuid not null references users(id),
  scheduled_at timestamptz not null,
  duration_min int not null default 30,
  reason       text,
  status       appointment_status not null default 'pending',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create index appointments_clinic_id_idx on appointments(clinic_id);
create index appointments_pet_id_idx on appointments(pet_id);
create index appointments_vet_id_idx on appointments(vet_id);
create index appointments_scheduled_at_idx on appointments(scheduled_at);
