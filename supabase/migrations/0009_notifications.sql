create table notifications (
  id               uuid primary key default uuid_generate_v4(),
  clinic_id        uuid not null references clinics(id) on delete cascade,
  appointment_id   uuid references appointments(id) on delete set null,
  recipient_email  text not null,
  channel          notification_channel not null default 'email',
  type             notification_type not null,
  status           notification_status not null default 'pending',
  payload          jsonb,
  sent_at          timestamptz,
  error            text,
  created_at       timestamptz not null default now()
);

create index notifications_clinic_id_idx on notifications(clinic_id);
create index notifications_appointment_id_idx on notifications(appointment_id);
create index notifications_status_idx on notifications(status);
