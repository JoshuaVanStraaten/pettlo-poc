-- Enable RLS on all tables
alter table clinics enable row level security;
alter table users enable row level security;
alter table pets enable row level security;
alter table clinic_pets enable row level security;
alter table appointments enable row level security;
alter table visits enable row level security;
alter table vaccinations enable row level security;
alter table notifications enable row level security;

-- Helper: resolve the clinic_id for the current auth user
create or replace function auth_clinic_id()
returns uuid language sql stable security definer as $$
  select clinic_id from users where auth_id = auth.uid() limit 1;
$$;

-- Helper: resolve the user id for the current auth user
create or replace function auth_user_id()
returns uuid language sql stable security definer as $$
  select id from users where auth_id = auth.uid() limit 1;
$$;

-- clinics: staff can read their own clinic
create policy clinic_isolation on clinics
  for select using (id = auth_clinic_id());

-- users: staff can read users in their clinic
create policy clinic_isolation on users
  for select using (clinic_id = auth_clinic_id());

-- pets: owners see their own pets; clinic staff see pets registered to their clinic
create policy owner_sees_own on pets
  for select using (owner_id = auth_user_id());

create policy clinic_sees_registered on pets
  for select using (
    exists (
      select 1 from clinic_pets
      where clinic_pets.pet_id = pets.id
        and clinic_pets.clinic_id = auth_clinic_id()
    )
  );

-- clinic_pets: clinic staff only
create policy clinic_isolation on clinic_pets
  for select using (clinic_id = auth_clinic_id());

-- appointments: clinic staff only
create policy clinic_isolation on appointments
  for select using (clinic_id = auth_clinic_id());

create policy clinic_isolation_insert on appointments
  for insert with check (clinic_id = auth_clinic_id());

create policy clinic_isolation_update on appointments
  for update using (clinic_id = auth_clinic_id());

-- visits: clinic staff only; exclude soft-deleted rows
create policy clinic_isolation on visits
  for select using (clinic_id = auth_clinic_id() and deleted_at is null);

create policy clinic_isolation_insert on visits
  for insert with check (clinic_id = auth_clinic_id());

create policy clinic_isolation_update on visits
  for update using (clinic_id = auth_clinic_id());

-- vaccinations: clinic staff only
create policy clinic_isolation on vaccinations
  for select using (clinic_id = auth_clinic_id());

create policy clinic_isolation_insert on vaccinations
  for insert with check (clinic_id = auth_clinic_id());

-- notifications: clinic staff only
create policy clinic_isolation on notifications
  for select using (clinic_id = auth_clinic_id());
